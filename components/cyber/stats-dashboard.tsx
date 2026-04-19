'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, Brain, Activity } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { Waveform } from './fui-overlays';

interface StatBarProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  prevValue?: number;
}

function StatBar({ label, value, icon, color, prevValue }: StatBarProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const changed = prevValue !== undefined && prevValue !== value;

  useEffect(() => {
    if (changed) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value, changed]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2" style={{ color }}>
          {icon}
          <span className="uppercase tracking-wider">{label}</span>
        </div>
        <motion.span
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          className={`font-bold ${isAnimating ? 'stat-bounce' : ''}`}
          style={{ color }}
        >
          {value}%
        </motion.span>
      </div>
      
      <div className="relative h-2 bg-background/50 rounded-full overflow-hidden">
        {/* Background glow */}
        <div 
          className="absolute inset-0 opacity-30 rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${color}20, ${color}40)`,
          }}
        />
        
        {/* Progress bar */}
        <motion.div
          className={`h-full rounded-full ${isAnimating ? 'stat-bounce' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ 
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 10px ${color}50`,
          }}
        />

        {/* Change indicator */}
        {changed && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full"
            style={{ 
              border: `2px solid ${value > (prevValue || 0) ? '#00ff88' : '#ff0055'}`,
            }}
          />
        )}
      </div>
    </div>
  );
}

export function StatsDashboard() {
  const { stats, chaosLevel } = useGameStore();
  const [prevStats, setPrevStats] = useState(stats);

  useEffect(() => {
    const timer = setTimeout(() => setPrevStats(stats), 500);
    return () => clearTimeout(timer);
  }, [stats]);

  return (
    <div className="glass h-full rounded-xl p-4 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-[#00f2ff]/50 uppercase tracking-widest">
          属性监控
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Stat bars */}
      <div className="space-y-4">
        <StatBar
          label="财富"
          value={stats.wealth}
          prevValue={prevStats.wealth}
          icon={<Banknote className="w-4 h-4" />}
          color="#00f2ff"
        />
        <StatBar
          label="理智"
          value={stats.sanity}
          prevValue={prevStats.sanity}
          icon={<Brain className="w-4 h-4" />}
          color="#ffd700"
        />
        <StatBar
          label="同步率"
          value={stats.synchRate}
          prevValue={prevStats.synchRate}
          icon={<Activity className="w-4 h-4" />}
          color="#00ff88"
        />
      </div>

      {/* Chaos meter */}
      <div className="mt-auto pt-4 border-t border-[#00f2ff]/10">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-mono text-[#ff0055]/70 uppercase tracking-widest">
            混沌指数
          </div>
          <span className="text-xs font-mono font-bold text-[#ff0055]">
            {chaosLevel}%
          </span>
        </div>
        
        {/* Chaos waveform */}
        <div className="relative h-10 bg-background/30 rounded-lg overflow-hidden">
          <Waveform 
            intensity={chaosLevel} 
            className={chaosLevel > 70 ? 'chaos-wave' : ''} 
          />
          
          {/* Warning threshold lines */}
          <div className="absolute top-0 bottom-0 left-[50%] w-px bg-[#ffd700]/30" />
          <div className="absolute top-0 bottom-0 left-[75%] w-px bg-[#ff0055]/30" />
        </div>
        
        {/* Chaos level description */}
        <div className="mt-2 text-xs font-mono text-center">
          {chaosLevel < 30 && <span className="text-[#00f2ff]">系统稳定</span>}
          {chaosLevel >= 30 && chaosLevel < 60 && <span className="text-[#ffd700]">波动检测</span>}
          {chaosLevel >= 60 && chaosLevel < 80 && <span className="text-[#ff6600]">不稳定</span>}
          {chaosLevel >= 80 && <span className="text-[#ff0055] animate-pulse">临界状态</span>}
        </div>
      </div>
    </div>
  );
}
