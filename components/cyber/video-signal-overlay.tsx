'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlitchStrip {
  top: number;
  height: number;
  offsetX: number;
  color: string;
}

interface GlitchState {
  strips: GlitchStrip[];
  flashY: number;
}

/**
 * VideoSignalOverlay
 *
 * 叠加在静态图片之上，模拟实时视频信号传输质感：
 *  1. 移动扫描线 — 一条青色光晕带自上而下匀速扫过
 *  2. 数字噪声   — 稀疏随机亮点，模拟信号颗粒感
 *  3. 故障闪烁   — 周期性 RGB 色差 + 水平条带错位 + 白色闪线
 */
export function VideoSignalOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const [glitchActive, setGlitchActive] = useState(false);
  const [glitch, setGlitch] = useState<GlitchState>({ strips: [], flashY: 50 });
  const glitchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── 1. Canvas: 数字噪声 + 移动扫描光带 ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scanY = 0;
    let lastTs = performance.now();

    const draw = (ts: number) => {
      const dt = ts - lastTs;
      lastTs = ts;

      const W = canvas.width;
      const H = canvas.height;

      if (W === 0 || H === 0) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      // 数字噪声：以极低密度随机撒亮点
      const imageData = ctx.createImageData(W, H);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (Math.random() < 0.018) {
          const v = 160 + Math.random() * 95;
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
          d[i + 3] = Math.random() * 45;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // 移动扫描光带（自上而下，带柔和渐变晕）
      scanY += dt * 0.1;
      if (scanY > H + 100) scanY = -100;

      const bandH = 100;
      const grad = ctx.createLinearGradient(0, scanY - bandH, 0, scanY + bandH);
      grad.addColorStop(0, 'rgba(0,242,255,0)');
      grad.addColorStop(0.4, 'rgba(0,242,255,0.035)');
      grad.addColorStop(0.5, 'rgba(0,242,255,0.08)');
      grad.addColorStop(0.6, 'rgba(0,242,255,0.035)');
      grad.addColorStop(1, 'rgba(0,242,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - bandH, W, bandH * 2);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ── 2. Canvas 尺寸同步 ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sync = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // ── 3. 周期性故障调度器 ──────────────────────────────────────────────────────
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 3500 + Math.random() * 7000; // 3.5 ~ 10.5s 随机间隔

      glitchTimerRef.current = setTimeout(() => {
        const stripCount = 2 + Math.floor(Math.random() * 3);
        const strips: GlitchStrip[] = Array.from({ length: stripCount }, (_, i) => ({
          top: Math.random() * 100,
          height: 2 + Math.random() * 14,
          offsetX: (Math.random() - 0.5) * 28,
          color: i % 2 === 0 ? '0,242,255' : '255,0,85',
        }));

        setGlitch({ strips, flashY: 20 + Math.random() * 60 });
        setGlitchActive(true);

        // 故障持续 80~240ms 后消失
        glitchTimerRef.current = setTimeout(() => {
          setGlitchActive(false);
          scheduleNext();
        }, 80 + Math.random() * 160);
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(glitchTimerRef.current);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-[18]">
      {/* Canvas: 噪声 + 移动扫描带 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.9 }}
      />

      {/* CSS 静态水平扫描线栅格 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* 故障闪烁层 */}
      <AnimatePresence>
        {glitchActive && (
          <motion.div
            key="glitch"
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.04 }}
          >
            {/* RGB 色差分离 */}
            <motion.div
              className="absolute inset-0"
              animate={{ x: [0, -6, 4, -3, 2, 0] }}
              transition={{ duration: 0.14, ease: 'linear' }}
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,0,85,0.10) 0%, transparent 40%, rgba(0,242,255,0.10) 100%)',
                mixBlendMode: 'screen',
              }}
            />

            {/* 水平错位条带 */}
            {glitch.strips.map((strip, i) => (
              <div
                key={i}
                className="absolute w-[120%] left-[-10%]"
                style={{
                  top: `${strip.top}%`,
                  height: `${strip.height}px`,
                  transform: `translateX(${strip.offsetX}px)`,
                  background: `rgba(${strip.color},0.20)`,
                  mixBlendMode: 'screen',
                }}
              />
            ))}

            {/* 随机白色闪光线 */}
            <div
              className="absolute w-full"
              style={{
                top: `${glitch.flashY}%`,
                height: '1px',
                background: 'rgba(255,255,255,0.65)',
                mixBlendMode: 'screen',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
