'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/game-store';
import { CinematicCanvas } from './cinematic-canvas';
import { NarrativeDisplay } from './narrative-display';
import { DecisionMatrix } from './decision-matrix';
import { ChaosConsole } from './chaos-console';
import { StatsDashboard } from './stats-dashboard';
import { SystemBreachAlert, Scanlines, MiniChart, GlitchRenderingOverlay } from './fui-overlays';
import { Zap, SkipForward } from 'lucide-react';

export function GameInterface() {
  const { currentScene, makeChoice, systemBreach, glitchActive, endGame, phase, isTransitioning } = useGameStore();
  const keepAliveCanvasRef = useRef<HTMLCanvasElement>(null);

  // 持续向 DOM 内的 canvas 绘制，防止 Chrome 因视频 ended 状态节流 rAF
  useEffect(() => {
    const canvas = keepAliveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId: number;
    let tick = 0;
    const draw = () => {
      if (ctx) {
        tick = (tick + 1) % 256;
        ctx.fillStyle = `rgb(${tick},0,0)`;
        ctx.fillRect(0, 0, 1, 1);
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (!currentScene) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen bg-[#020202] relative ${glitchActive ? 'glitch-active' : ''}`}
    >
      {/* Background effects */}
      <div className="fixed inset-0 fui-grid opacity-30 pointer-events-none" />
      <Scanlines />

      {/* rAF keepalive canvas：防止视频 ended 后 Chrome 节流动画 */}
      <canvas
        ref={keepAliveCanvasRef}
        width={1}
        height={1}
        className="fixed pointer-events-none"
        style={{ opacity: 0.001, top: 0, left: 0 }}
      />

      {/* System breach alert overlay */}
      <SystemBreachAlert visible={systemBreach} />

      {/* 故障渲染遮罩：API 延迟时伪装成游戏特效 */}
      <GlitchRenderingOverlay />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#020202]/80 border-b border-[#00f2ff]/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#00f2ff]" />
            <span className="font-bold text-sm">
              <span className="text-[#00f2ff]">CYBER</span>
              <span className="text-[#ff0055]">-</span>
              <span className="text-foreground">LIFE</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <MiniChart className="hidden md:flex" />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={endGame}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#ff0055]/10 text-[#ff0055] rounded-lg text-xs font-mono hover:bg-[#ff0055]/20 transition-colors"
            >
              <SkipForward className="w-3 h-3" />
              结束
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Left column - Main content */}
          <div className="space-y-6">
            {/* Cinematic canvas */}
            <CinematicCanvas />

            {/* Narrative display */}
            <NarrativeDisplay />

            {/* Decision matrix */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <DecisionMatrix
                choices={currentScene.branchingOptions}
                onChoice={makeChoice}
                disabled={phase === 'chaos' || isTransitioning}
              />
            </motion.div>
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-20 self-start">
            {/* Stats dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatsDashboard />
            </motion.div>

            {/* Chaos console */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ChaosConsole />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#020202]/80 backdrop-blur-md border-t border-[#00f2ff]/10 py-2 px-4 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>SECTOR: {currentScene.sectorCode}</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            NEURAL_LINK: ACTIVE
          </span>
          <span>STREAM: {currentScene.streamStatus}</span>
        </div>
      </footer>
    </motion.div>
  );
}
