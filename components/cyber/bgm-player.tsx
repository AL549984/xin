'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';

/**
 * 全局背景音乐播放器，挂载于根布局，场景切换时不中断。
 * 音乐文件请放置于 public/bgm.mp3
 *
 * 联动逻辑：
 *  - 正常阶段：playbackRate=1.0，volume=0.3
 *  - 混沌/系统入侵阶段：playbackRate=0.85，volume=0.18（营造失真低沉感）
 */
export function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);

  const { phase, systemBreach, chaosLevel } = useGameStore();

  // 首次用户交互后开始播放（兼容浏览器自动播放限制）
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const start = () => {
      audio.play().catch(() => {
        // 浏览器策略阻止时静默忽略，等待下次交互
      });
    };

    document.addEventListener('click', start, { once: true });
    document.addEventListener('keydown', start, { once: true });

    return () => {
      document.removeEventListener('click', start);
      document.removeEventListener('keydown', start);
    };
  }, []);

  // 根据游戏状态动态调整播放参数
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const isChaos = phase === 'chaos' || systemBreach || chaosLevel > 70;

    audio.playbackRate = isChaos ? 0.85 : 1.0;
    audio.volume = muted ? 0 : isChaos ? 0.18 : 0.3;
    audio.muted = muted;
  }, [phase, systemBreach, chaosLevel, muted]);

  return (
    <>
      <audio ref={audioRef} loop preload="auto" src="/bgm.mp3" />
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? '开启背景音乐' : '关闭背景音乐'}
        title={muted ? '开启背景音乐' : '关闭背景音乐'}
        className="
          fixed bottom-4 right-4 z-50
          w-8 h-8 flex items-center justify-center
          rounded-full border border-cyan-500/30 bg-black/60
          text-cyan-500 hover:border-cyan-400 hover:text-cyan-300
          transition-colors backdrop-blur-sm
        "
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
    </>
  );
}
