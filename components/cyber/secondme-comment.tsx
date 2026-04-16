'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { parseSecondMeStream } from '@/lib/secondme';
import { useSecondMe } from '@/hooks/use-secondme';
import type { StoryChoice } from '@/lib/game-types';

export interface SecondMeTrigger {
  sceneText: string;
  choice: StoryChoice;
  /** 用于在连续选择时强制重新触发（即使 choice 相同） */
  key: number;
}

interface SecondMeCommentProps {
  trigger: SecondMeTrigger | null;
}

function buildPrompt(
  userName: string,
  sceneText: string,
  choice: StoryChoice,
): string {
  const sceneSnippet = sceneText.slice(0, 120);
  const typeLabel =
    choice.type === 'chaos' ? '混沌' : choice.type === 'critical' ? '关键' : '标准';
  return (
    `你是${userName}的数字分身，正以旁观者的视角观察一段赛博朋克互动叙事。` +
    `当前场景（节选）：「${sceneSnippet}……」` +
    `主角刚刚做出了【${typeLabel}】选择：「${choice.text}」。` +
    `请以第一人称，用赛博朋克风格的简短语言（2~3句话，不超过80字）` +
    `分析这个选择对主角命运的影响，以及你的直觉判断。不要重复叙述剧情，只给出分身视角的感受与判断。`
  );
}

export function SecondMeComment({ trigger }: SecondMeCommentProps) {
  const { user, isAuthenticated } = useSecondMe();
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [visible, setVisible] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!trigger || !isAuthenticated || !user) return;

    // 取消上一次未完成的流
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setText('');
    setIsStreaming(true);
    setVisible(true);

    const run = async () => {
      try {
        const res = await fetch('/api/secondme/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: buildPrompt(user.name, trigger.sceneText, trigger.choice),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          setIsStreaming(false);
          return;
        }

        await parseSecondMeStream(
          res,
          (token) => {
            if (controller.signal.aborted) return;
            setText((prev) => prev + token);
          },
          () => {
            if (!controller.signal.aborted) setIsStreaming(false);
          },
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setIsStreaming(false);
        }
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [trigger, isAuthenticated, user]);

  if (!isAuthenticated || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={trigger?.key}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="glass rounded-xl p-4 border border-[#00ff88]/20"
      >
        {/* 标题行 */}
        <div className="flex items-center gap-2 mb-3 text-xs font-mono text-[#00ff88]/60 uppercase tracking-widest">
          <BrainCircuit className="w-3.5 h-3.5 text-[#00ff88]" />
          <span>SECOND_ME 分身信号</span>
          {isStreaming && (
            <Loader2 className="w-3 h-3 animate-spin ml-auto text-[#00ff88]/40" />
          )}
        </div>

        {/* 用户信息 */}
        {user && (
          <div className="flex items-center gap-2 mb-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-5 h-5 rounded-full border border-[#00ff88]/30 object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10" />
            )}
            <span className="text-xs font-mono text-[#00ff88]/70">{user.name}</span>
          </div>
        )}

        {/* 流式文本 */}
        <div className="text-sm font-mono text-[#b0fff0]/80 leading-relaxed min-h-[2.5rem]">
          {text}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-1.5 h-3.5 bg-[#00ff88] ml-0.5 align-middle"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
