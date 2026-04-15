'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';

// Corner coordinates display
export function CornerCoordinates({ 
  sector, 
  stream 
}: { 
  sector: string; 
  stream: string; 
}) {
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top Left */}
      <div className="absolute top-4 left-4 text-xs font-mono text-[#00f2ff]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00f2ff] rounded-full animate-pulse" />
          <span>SECTOR: {sector}</span>
        </div>
        <div className="mt-1 text-[#00f2ff]/50">LAT: 35.6762 | LON: 139.6503</div>
      </div>

      {/* Top Right */}
      <div className="absolute top-4 right-4 text-xs font-mono text-right text-[#00f2ff]/70">
        <div>STREAM: {stream}</div>
        <div className="mt-1 text-[#00f2ff]/50">{time} UTC+9</div>
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-4 left-4 text-xs font-mono text-[#00f2ff]/50">
        <div>SYS_VER: 2.0.99-ALPHA</div>
        <div>NEURAL_LINK: ACTIVE</div>
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-4 right-4 text-xs font-mono text-right text-[#00f2ff]/50">
        <div>FRAME: {Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</div>
        <div>CODEC: NEURO-H.266</div>
      </div>

      {/* Corner Brackets */}
      <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-[#00f2ff]/30" />
      <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-[#00f2ff]/30" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-[#00f2ff]/30" />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-[#00f2ff]/30" />
    </>
  );
}

// Floating data points
export function FloatingDataPoints() {
  const points = [
    { x: '15%', y: '20%', label: 'NODE_A', value: '0x7F3' },
    { x: '85%', y: '30%', label: 'NODE_B', value: '0xE2A' },
    { x: '10%', y: '70%', label: 'NODE_C', value: '0x1B9' },
    { x: '90%', y: '75%', label: 'NODE_D', value: '0x4C8' },
  ];

  return (
    <>
      {points.map((point, index) => (
        <motion.div
          key={index}
          className="absolute text-xs font-mono text-[#00f2ff]/40"
          style={{ left: point.x, top: point.y }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 0.5,
          }}
        >
          <div className="w-1.5 h-1.5 bg-[#00f2ff]/50 rounded-full mb-1" />
          <span className="text-[10px]">{point.label}</span>
        </motion.div>
      ))}
    </>
  );
}

// Scanline effect
export function Scanlines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Static scanlines */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,242,255,0.1) 2px, rgba(0,242,255,0.1) 4px)',
        }}
      />
      {/* Moving scanline */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f2ff]/20 to-transparent"
        animate={{ y: ['0vh', '100vh'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Mini chart decoration
export function MiniChart({ className }: { className?: string }) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    setHeights(Array.from({ length: 12 }, () => Math.random() * 100));
  }, []);

  return (
    <div className={`flex items-end gap-0.5 h-6 ${className}`}>
      {heights.map((height, i) => (
        <motion.div
          key={i}
          className="w-1 bg-[#00f2ff]/30 rounded-t"
          initial={{ height: `${height}%` }}
          animate={{ height: `${Math.random() * 100}%` }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

// Waveform visualization
export function Waveform({ intensity = 50, className }: { intensity?: number; className?: string }) {
  const lineCount = 40;
  
  return (
    <div className={`flex items-center justify-center gap-[2px] h-8 ${className}`}>
      {Array.from({ length: lineCount }).map((_, i) => {
        const baseHeight = Math.sin(i * 0.3) * 30 + 50;
        const intensityMod = (intensity / 100) * 1.5;
        
        return (
          <motion.div
            key={i}
            className="w-[2px] bg-[#00f2ff] rounded-full origin-center"
            animate={{
              scaleY: [1, intensityMod * (0.5 + Math.random()), 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.02,
            }}
            style={{ height: `${baseHeight}%` }}
          />
        );
      })}
    </div>
  );
}

// System breach alert overlay
export function SystemBreachAlert({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 pointer-events-none"
    >
      {/* Red flash overlay */}
      <motion.div
        className="absolute inset-0 bg-[#ff0055]"
        animate={{ opacity: [0.3, 0.1, 0.3, 0] }}
        transition={{ duration: 0.5, times: [0, 0.3, 0.6, 1] }}
      />
      
      {/* Alert text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-4xl md:text-6xl font-bold text-[#ff0055] tracking-widest"
          animate={{
            opacity: [1, 0.5, 1, 0],
            scale: [1, 1.1, 1, 0.9],
          }}
          transition={{ duration: 0.5 }}
          style={{
            textShadow: '0 0 20px #ff0055, 0 0 40px #ff0055, 0 0 60px #ff0055',
          }}
        >
          SYSTEM BREACH
        </motion.div>
      </div>

      {/* Glitch lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-1 bg-[#ff0055]/50"
          style={{ top: `${20 + i * 15}%` }}
          animate={{
            scaleX: [0, 1, 0],
            x: ['-100%', '0%', '100%'],
          }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        />
      ))}
    </motion.div>
  );
}

// ─── FUI 故障渲染遮罩 ─────────────────────────────────────────────────────────
// 在玩家选择后视频尚未生成完毕时全屏显示，将 API 延迟伪装成游戏设计的一部分
const RENDER_MESSAGES = [
  '> 初始化神经渲染管道...',
  '> 分配量子算力矩阵...',
  '> 扫描场景拓扑结构...',
  '> 生成视觉语义层...',
  '> 注入赛博朋克滤镜...',
  '> 合成全息投影...',
  '> 校准时间线参数...',
  '> 写入神经记忆流...',
];

const GLITCH_CHARS = '!@#$%^&*アイウエオ░▒▓█▄▀01';

function randomGlitch(len = 8) {
  return Array.from({ length: len }, () =>
    GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
  ).join('');
}

export function GlitchRenderingOverlay() {
  const { isRenderingGlitch, nextVideoStatus } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [statusLines, setStatusLines] = useState<string[]>([]);
  const [glitchTitle, setGlitchTitle] = useState('NEURAL RENDERING');
  const [hexCodes, setHexCodes] = useState<string[]>([]);

  // 进度条 + 状态日志动画
  useEffect(() => {
    if (!isRenderingGlitch) {
      setProgress(0);
      setStatusLines([]);
      return;
    }

    let msgIndex = 0;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        // 未就绪时最多涨到 88%，保留最后冲刺给"完成"时触发
        const cap = nextVideoStatus === 'ready' ? 100 : 88;
        const increment = Math.random() * 6 + 1;
        return Math.min(prev + increment, cap);
      });

      if (msgIndex < RENDER_MESSAGES.length) {
        setStatusLines(prev => [...prev, RENDER_MESSAGES[msgIndex]]);
        msgIndex++;
      }
    }, 650);

    return () => clearInterval(progressTimer);
  }, [isRenderingGlitch]); // eslint-disable-line react-hooks/exhaustive-deps

  // 视频就绪时冲到 100%
  useEffect(() => {
    if (nextVideoStatus === 'ready' && isRenderingGlitch) {
      setProgress(100);
      setStatusLines(prev => [...prev, '> [完成] 神经流同步成功 ✓']);
    }
  }, [nextVideoStatus, isRenderingGlitch]);

  // 标题故障字符抖动
  useEffect(() => {
    if (!isRenderingGlitch) return;
    const t = setInterval(() => {
      if (Math.random() > 0.6) {
        setGlitchTitle(randomGlitch(16));
        setTimeout(() => setGlitchTitle('NEURAL RENDERING'), 80);
      }
    }, 400);
    return () => clearInterval(t);
  }, [isRenderingGlitch]);

  // 背景浮动 hex 码
  useEffect(() => {
    if (!isRenderingGlitch) { setHexCodes([]); return; }
    const t = setInterval(() => {
      setHexCodes(
        Array.from({ length: 12 }, () => `0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0')}`)
      );
    }, 300);
    return () => clearInterval(t);
  }, [isRenderingGlitch]);

  return (
    <AnimatePresence>
      {isRenderingGlitch && (
        <motion.div
          key="glitch-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 overflow-hidden"
          style={{ backgroundColor: 'rgba(2,2,2,0.97)' }}
        >
          {/* 快速扫描线 */}
          <motion.div
            className="absolute left-0 right-0 h-[3px] pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, #00f2ff, #ff0055, transparent)' }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute left-0 right-0 h-[1px] pointer-events-none opacity-40"
            style={{ background: '#ff0055' }}
            animate={{ top: ['100%', '0%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          />

          {/* 背景 hex 码雨 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            {hexCodes.map((code, i) => (
              <motion.span
                key={i}
                className="absolute text-xs font-mono text-[#00f2ff]"
                style={{
                  left: `${(i / hexCodes.length) * 100}%`,
                  top: `${Math.random() * 80 + 10}%`,
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                {code}
              </motion.span>
            ))}
          </div>

          {/* RGB 分层故障背景 */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              x: [0, -4, 4, -2, 0],
              opacity: [0.05, 0.12, 0.05],
            }}
            transition={{ duration: 0.15, repeat: Infinity }}
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,85,0.04) 2px, rgba(255,0,85,0.04) 4px)',
            }}
          />

          {/* 中央内容区 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 gap-6">
            {/* 故障标题 */}
            <div className="text-center">
              <motion.div
                className="text-xs font-mono text-[#ff0055]/60 tracking-[0.4em] mb-2"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                // SYSTEM INTERRUPT //
              </motion.div>
              <motion.h1
                className="text-3xl md:text-5xl font-black tracking-widest font-mono"
                style={{
                  color: '#00f2ff',
                  textShadow: '-3px 0 #ff0055, 3px 0 #ffd700',
                }}
                animate={{
                  textShadow: [
                    '-3px 0 #ff0055, 3px 0 #ffd700',
                    '3px 0 #ff0055, -3px 0 #00f2ff',
                    '-2px 2px #ff0055, 2px -2px #ffd700',
                    '-3px 0 #ff0055, 3px 0 #ffd700',
                  ],
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                {glitchTitle}
              </motion.h1>
              <motion.div
                className="text-sm font-mono text-[#ffd700]/70 mt-2 tracking-widest"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                ▶ 神经流合成中... ◀
              </motion.div>
            </div>

            {/* 进度条 */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs font-mono text-[#00f2ff]/50 mb-1">
                <span>RENDER_PROGRESS</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <div className="h-2 bg-[#0a0a0a] border border-[#00f2ff]/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: progress < 50
                      ? 'linear-gradient(90deg, #ff0055, #ffd700)'
                      : progress < 90
                        ? 'linear-gradient(90deg, #ffd700, #00f2ff)'
                        : 'linear-gradient(90deg, #00f2ff, #00ff88)',
                    boxShadow: `0 0 8px ${progress >= 90 ? '#00f2ff' : '#ffd700'}`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {/* 进度条下方装饰 */}
              <div className="flex justify-between mt-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 h-1 rounded-full"
                    style={{
                      backgroundColor: i / 20 <= progress / 100 ? '#00f2ff' : '#1a1a1a',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 状态日志 */}
            <div className="w-full max-w-md bg-[#0a0a0a]/80 border border-[#00f2ff]/10 rounded-lg p-4 h-36 overflow-hidden relative">
              <div className="text-xs font-mono text-[#00f2ff]/30 mb-2">// RENDER LOG</div>
              <div className="space-y-1 overflow-hidden">
                {statusLines.filter((line): line is string => typeof line === 'string').slice(-5).map((line, i) => (
                  <motion.div
                    key={`${i}-${line}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: i === Math.min(statusLines.length, 5) - 1 ? 1 : 0.4, x: 0 }}
                    className="text-xs font-mono text-[#00f2ff]"
                    style={{
                      color: line.includes('完成') ? '#00ff88' : '#00f2ff',
                    }}
                  >
                    {line}
                  </motion.div>
                ))}
                {/* 闪烁光标 */}
                <motion.span
                  className="inline-block w-2 h-3 bg-[#00f2ff]"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </div>
            </div>

            {/* 底部提示 */}
            <motion.div
              className="text-xs font-mono text-[#666]/60 text-center"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              SYS: 正在调用神经渲染 API — 请保持神经接口连接
            </motion.div>
          </div>

          {/* 边角故障线框 */}
          <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-[#ff0055]/60" />
          <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-[#ff0055]/60" />
          <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-[#00f2ff]/60" />
          <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-[#00f2ff]/60" />

          {/* 水平故障切片 */}
          {[15, 35, 60, 80].map((top, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 pointer-events-none"
              style={{ top: `${top}%`, height: `${1 + Math.random() * 2}px` }}
              animate={{
                scaleX: [0, 1, 0.3, 1, 0],
                x: [0, -20, 20, 0],
                opacity: [0, 0.6, 0.3, 0.6, 0],
                backgroundColor: i % 2 === 0 ? '#ff0055' : '#00f2ff',
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                delay: i * 0.15,
                repeatDelay: Math.random() * 1.5,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
