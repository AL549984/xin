'use client';

/**
 * CyberDirectorPanel — 蓝框：Cyber Director Agent 对话框
 *
 * A2A 模式中的官方 Agent 展示区：
 * - 永久固定为 "CYBER DIRECTOR" 身份，不受用户 Session 切换影响
 * - 接收 DirectorCommand 后调用 /api/secondme/director
 * - 解析流式响应，展示随机视频 + 剧情 JSON，并将生成的场景回调给父组件
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Loader2, Video, AlertTriangle, Film } from 'lucide-react';
import { parseDirectorStream, type DirectorScenePlot } from '@/lib/secondme';
import type { DirectorCommand } from './user-agent-bar';

interface CyberDirectorPanelProps {
  command: DirectorCommand | null;
  /** 场景数据就绪后回调给父组件 */
  onScenePlot?: (plot: DirectorScenePlot) => void;
}

export function CyberDirectorPanel({ command, onScenePlot }: CyberDirectorPanelProps) {
  const [plot, setPlot] = useState<DirectorScenePlot | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingVideo, setPendingVideo] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!command) return;

    // 取消上一次未完成的流
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPlot(null);
    setStreamingText('');
    setError(null);
    setIsStreaming(true);
    setPendingVideo(null);

    const run = async () => {
      try {
        const res = await fetch('/api/secondme/director', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userCommand: command.userCommand,
            userName: command.userName,
            stats: command.stats,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          setError('DIRECTOR_SIGNAL_LOST');
          setIsStreaming(false);
          return;
        }

        // 从响应头读取预先确定的视频（供加载提示用）
        const videoHeader = res.headers.get('X-Director-Video');
        if (videoHeader) setPendingVideo(videoHeader);

        // 流式累积文本（进度展示）
        let accumulated = '';
        await parseDirectorStream(
          res,
          (scenePlot) => {
            if (controller.signal.aborted) return;
            setPlot(scenePlot);
            onScenePlot?.(scenePlot);
          },
          () => {
            if (!controller.signal.aborted) setIsStreaming(false);
          },
        );
        void accumulated; // 仅用于流式文本展示
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('CONNECTION_SEVERED');
          setIsStreaming(false);
        }
      }
    };

    run();
    return () => { controller.abort(); };
  }, [command, onScenePlot]);

  return (
    <div
      className="glass rounded-xl p-4 space-y-3 border border-[#7b5cfa]/40"
      style={{ boxShadow: '0 0 24px rgba(123,92,250,0.12)' }}
    >
      {/* ── 标题行 ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-[#7b5cfa]/70 uppercase tracking-widest">
          <Cpu className="w-3.5 h-3.5 text-[#7b5cfa]" />
          <span>CYBER_DIRECTOR // OFFICIAL_AGENT</span>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <Loader2 className="w-3 h-3 animate-spin text-[#7b5cfa]/50" />
          )}
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#7b5cfa]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7b5cfa] animate-pulse" />
            FIXED
          </span>
        </div>
      </div>

      {/* ── Agent 身份标牌（永久固定，不随用户切换） ── */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#7b5cfa]/20">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#7b5cfa] border border-[#7b5cfa]/40"
          style={{ background: 'linear-gradient(135deg, #7b5cfa20, #00f2ff10)' }}
        >
          <Film className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-mono text-[#7b5cfa] font-semibold">CYBER DIRECTOR</p>
          <p className="text-[10px] font-mono text-[#7b5cfa]/50">OFFICIAL · NARRATIVE_ENGINE</p>
        </div>
      </div>

      {/* ── 等待状态 ── */}
      <AnimatePresence mode="wait">
        {!command && !isStreaming && !plot && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs font-mono text-[#7b5cfa]/40 text-center py-4"
          >
            等待用户 Agent 发出指令…
          </motion.div>
        )}

        {/* ── 流式加载中 ── */}
        {isStreaming && !plot && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {pendingVideo && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#7b5cfa]/60">
                <Video className="w-3 h-3" />
                <span>加载视频素材：{pendingVideo}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#7b5cfa]/50">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>DIRECTOR 正在生成剧情…</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="inline-block w-1.5 h-3 bg-[#7b5cfa] ml-0.5 align-middle"
              />
            </div>
            <div className="h-1 w-full bg-[#7b5cfa]/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#7b5cfa]/50 rounded-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '40%' }}
              />
            </div>
          </motion.div>
        )}

        {/* ── 错误状态 ── */}
        {error && !isStreaming && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs font-mono text-[#ff0055]/70"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{error} — 信号中断</span>
          </motion.div>
        )}

        {/* ── 剧情 JSON 渲染结果 ── */}
        {plot && !isStreaming && (
          <motion.div
            key={`plot-${command?.key}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-3"
          >
            {/* 视频素材标签 */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono border"
                style={{ borderColor: '#7b5cfa40', color: '#7b5cfa', background: '#7b5cfa10' }}
              >
                <Video className="w-3 h-3" />
                {plot.videoUrl}
              </div>
              <div
                className="px-2 py-1 rounded text-[10px] font-mono border"
                style={{ borderColor: '#00f2ff30', color: '#00f2ff80', background: '#00f2ff08' }}
              >
                {plot.sectorCode}
              </div>
              <div
                className="px-2 py-1 rounded text-[10px] font-mono"
                style={{ color: '#ff005560', background: '#ff005508' }}
              >
                {plot.streamStatus}
              </div>
            </div>

            {/* 导演指令摘要 */}
            {plot.directive && (
              <div
                className="px-3 py-2 rounded-lg text-xs font-mono text-[#7b5cfa]/80 border border-[#7b5cfa]/20"
                style={{ background: '#7b5cfa08' }}
              >
                <span className="text-[#7b5cfa]/50">DIRECTIVE &gt; </span>
                {plot.directive}
              </div>
            )}

            {/* 叙事文本（截取前 150 字展示） */}
            <div className="text-[11px] font-mono text-foreground/65 leading-relaxed border-l-2 border-[#7b5cfa]/30 pl-3">
              {plot.narrativeText.length > 150
                ? plot.narrativeText.slice(0, 150) + '…'
                : plot.narrativeText}
            </div>

            {/* 分支选项预览 */}
            <div className="space-y-1">
              <p className="text-[9px] font-mono text-[#7b5cfa]/40 uppercase tracking-widest">BRANCHING_OPTIONS</p>
              {plot.branchingOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-start gap-2 text-[10px] font-mono"
                >
                  <span
                    className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] ${
                      opt.type === 'chaos'
                        ? 'bg-[#ff0055]/15 text-[#ff0055]'
                        : opt.type === 'critical'
                        ? 'bg-[#ffd700]/15 text-[#ffd700]'
                        : 'bg-[#00f2ff]/10 text-[#00f2ff]'
                    }`}
                  >
                    {opt.type === 'chaos' ? 'CHAOS' : opt.type === 'critical' ? 'CRIT' : 'STD'}
                  </span>
                  <span className="text-foreground/55 leading-relaxed">{opt.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
