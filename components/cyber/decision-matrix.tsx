'use client';

import { motion } from 'framer-motion';
import { Target, Zap, AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import type { StoryChoice } from '@/lib/game-types';

const choiceIcons = {
  normal: Target,
  critical: Zap,
  chaos: AlertTriangle,
};

const choiceStyles = {
  normal: {
    border: 'border-[#00f2ff]/30 hover:border-[#00f2ff]',
    bg: 'hover:bg-[#00f2ff]/10',
    glow: 'hover:shadow-[0_0_20px_rgba(0,242,255,0.3)]',
    text: 'text-[#00f2ff]',
  },
  critical: {
    border: 'border-[#ffd700]/30 hover:border-[#ffd700]',
    bg: 'hover:bg-[#ffd700]/10',
    glow: 'hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]',
    text: 'text-[#ffd700]',
  },
  chaos: {
    border: 'border-[#ff0055]/30 hover:border-[#ff0055]',
    bg: 'hover:bg-[#ff0055]/10',
    glow: 'hover:shadow-[0_0_20px_rgba(255,0,85,0.3)]',
    text: 'text-[#ff0055]',
  },
};

interface DecisionMatrixProps {
  choices: StoryChoice[];
  onChoice: (choice: StoryChoice) => void;
  disabled?: boolean;
}

export function DecisionMatrix({ choices, onChoice, disabled }: DecisionMatrixProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-mono text-[#00f2ff]/50 uppercase tracking-widest mb-4">
        {'>'} 选择你的路径
      </div>
      
      <div className="grid gap-3">
        {choices.map((choice, index) => {
          const Icon = choiceIcons[choice.type];
          const styles = choiceStyles[choice.type];
          
          return (
            <motion.button
              key={choice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              disabled={disabled}
              onClick={() => onChoice(choice)}
              className={`
                relative group w-full text-left p-4 rounded-lg
                glass backdrop-blur-md transition-all duration-300
                ${styles.border} ${styles.bg} ${styles.glow}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {/* Choice indicator line */}
              <motion.div
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                  choice.type === 'normal' ? 'bg-[#00f2ff]' :
                  choice.type === 'critical' ? 'bg-[#ffd700]' : 'bg-[#ff0055]'
                }`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              />

              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-background/50 ${styles.text}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1">
                  <div className="text-sm md:text-base font-medium text-foreground group-hover:text-white transition-colors">
                    {choice.text}
                  </div>
                  
                  {/* Stat impact preview */}
                  {choice.statImpact && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-mono">
                      {choice.statImpact.wealth !== undefined && (
                        <span className={choice.statImpact.wealth >= 0 ? 'text-green-400' : 'text-red-400'}>
                          财富 {choice.statImpact.wealth >= 0 ? '+' : ''}{choice.statImpact.wealth}
                        </span>
                      )}
                      {choice.statImpact.sanity !== undefined && (
                        <span className={choice.statImpact.sanity >= 0 ? 'text-green-400' : 'text-red-400'}>
                          理智 {choice.statImpact.sanity >= 0 ? '+' : ''}{choice.statImpact.sanity}
                        </span>
                      )}
                      {choice.statImpact.synchRate !== undefined && (
                        <span className={choice.statImpact.synchRate >= 0 ? 'text-green-400' : 'text-red-400'}>
                          同步率 {choice.statImpact.synchRate >= 0 ? '+' : ''}{choice.statImpact.synchRate}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Type badge */}
                <div className={`text-xs font-mono uppercase ${styles.text} opacity-50`}>
                  {choice.type === 'normal' ? '标准' : 
                   choice.type === 'critical' ? '关键' : '混沌'}
                </div>
              </div>

              {/* Hover effect grid */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg overflow-hidden">
                <div className="absolute inset-0 fui-grid opacity-30" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
