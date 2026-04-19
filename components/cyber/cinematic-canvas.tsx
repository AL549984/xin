'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerCoordinates, FloatingDataPoints, Scanlines } from './fui-overlays';
import { VideoSignalOverlay } from './video-signal-overlay';
import { useGameStore } from '@/lib/game-store';
import { getStorageUrl } from '@/lib/supabase';

function buildImageUrl(description: string, sceneId: string): string {
  const seed = parseInt(sceneId.replace(/\D/g, ''), 10) || 42;
  const prompt = `cyberpunk style, neon lights, futuristic dystopia, cinematic shot, ${description}, ultra detailed, 8k`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true&seed=${seed}`;
}

export function CinematicCanvas() {
  const { currentScene, glitchActive, videoStatus, nextVideoStatus, onVideoReady } = useGameStore();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 视频循环播放，无需暂停
  const handleVideoPlay = useCallback(() => {}, []);

  // 场景切换时清除定时器并重置状态
  useEffect(() => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setImgLoaded(false);
    setImgError(false);
  }, [currentScene?.id]);

  useEffect(() => () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImgLoaded(true);
    onVideoReady();
  }, [onVideoReady]);

  const handleImageError = useCallback(() => {
    setImgError(true);
    onVideoReady();
  }, [onVideoReady]);

  return (
    <div className="relative w-full max-w-[675px] mx-auto aspect-video rounded-2xl overflow-hidden border border-[#00f2ff]/20 group">
      {/* ── CSS 扫描线遮罩 ── */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* ── 背景基础层（始终显示）── */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#020202] to-[#0a0a0a] fui-grid ${
          glitchActive ? 'glitch-active' : ''
        }`}
        animate={glitchActive ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] } : {}}
        transition={{ duration: 0.5 }}
      />

      {/* ── 视频内容层：加载中占位 ── */}
      <AnimatePresence>
        {videoStatus === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
          >
            {/* 旋转的神经网络图标 */}
            <div className="relative w-20 h-20">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#00f2ff]/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border border-[#ff0055]/40"
                animate={{ rotate: -360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border border-[#ffd700]/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-3 h-3 bg-[#00f2ff] rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </div>

            <div className="text-center">
              <motion.div
                className="text-xs font-mono text-[#00f2ff]/60 tracking-[0.3em] uppercase"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                INITIALIZING NEURAL STREAM
              </motion.div>
              <motion.div
                className="text-[10px] font-mono text-[#666]/60 mt-1"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {currentScene?.videoPromptDescription}
              </motion.div>
            </div>

            {/* 扫描进度线 */}
            <div className="w-48 h-0.5 bg-[#0a0a0a] overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Supabase 视频源（videoUrl 存在时直接渲染，跳过 AI 图片逻辑）── */}
      {currentScene?.videoUrl ? (
        <video
          key={currentScene.id}
          src={getStorageUrl('videos', currentScene.videoUrl)}
          className="hidden"
          onCanPlay={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        /* ── 隐藏预加载图片元素（场景存在时即开始请求）── */
        currentScene && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={currentScene.id}
            src={buildImageUrl(currentScene.videoPromptDescription, currentScene.id)}
            alt=""
            className="hidden"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )
      )}

      {/* ── 内容层：已就绪，淡入 ── */}
      <AnimatePresence>
        {videoStatus === 'ready' && currentScene && imgLoaded && !imgError && (
          <motion.div
            key={`img-${currentScene.id}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute inset-0 z-10"
          >
            {/* Supabase 视频或 AI 图片，完全覆盖整个 Canvas 区域 */}
            {currentScene.videoUrl ? (
              <video
                ref={videoRef}
                src={getStorageUrl('videos', currentScene.videoUrl)}
                className="w-full h-full object-cover grayscale-[0.2] brightness-110"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={buildImageUrl(currentScene.videoPromptDescription, currentScene.id)}
                alt={currentScene.videoPromptDescription}
                className="w-full h-full object-cover"
              />
            )}

            {/* 预加载状态指示器（右上角小点）*/}
            <motion.div
              className="absolute top-3 right-3 flex items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    nextVideoStatus === 'ready' ? '#00ff88' :
                    nextVideoStatus === 'preloading' ? '#ffd700' : '#666',
                }}
                animate={nextVideoStatus === 'preloading' ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-[9px] font-mono text-[#666]/50">
                {nextVideoStatus === 'ready' ? 'PRELOADED' :
                 nextVideoStatus === 'preloading' ? 'RENDERING...' : 'STANDBY'}
              </span>
            </motion.div>

            {/* 淡入时的光晕扩散效果 */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,242,255,0.15) 0%, transparent 70%)',
              }}
            />

            {/* 视频信号着色器：扫描线 + 噪声 + 故障闪烁 */}
            <VideoSignalOverlay />
          </motion.div>
        )}

        {/* 错误备用：图片加载失败时显示描述文字 */}
        {videoStatus === 'ready' && currentScene && imgError && (
          <motion.div
            key={`fallback-${currentScene.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10 px-8"
          >
            <div className="text-center">
              <div className="mb-2 text-xs font-mono text-[#00f2ff]/40 uppercase tracking-widest">[VISUAL STREAM]</div>
              <div className="text-sm text-[#00f2ff]/70 font-mono leading-relaxed">
                {currentScene.videoPromptDescription}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 暗角效果 */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(2,2,2,0.5) 70%, rgba(2,2,2,0.9) 100%)',
        }}
      />

      {/* FUI 覆盖层 */}
      <div className="relative z-30">
        <Scanlines />
        <FloatingDataPoints />
        <CornerCoordinates
          sector={currentScene?.sectorCode || '??'}
          stream={currentScene?.streamStatus || '未知'}
        />
      </div>

      {/* RGB 分色故障效果 */}
      {glitchActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(90deg, rgba(255,0,85,0.1) 33%, transparent 33%, transparent 66%, rgba(0,242,255,0.1) 66%)',
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  );
}
