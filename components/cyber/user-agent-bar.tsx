'use client';

/**
 * UserAgentBar — 红框：用户 Agent 信息栏
 *
 * A2A 模式中的用户端 Agent 展示区：
 * - 绑定 Second Me 的当前登录 Session（useSecondMe）
 * - 实时显示 game store 中的财富与理智值
 * - 发出指令时向 CyberDirectorPanel 广播 DirectorCommand
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import { useSecondMe } from '@/hooks/use-secondme';
import { Zap, Banknote, Brain, LogIn } from 'lucide-react';

export interface DirectorCommand {
  userCommand: string;
  userName: string;
  stats: { wealth: number; sanity: number };
  /** 每次发令时的唯一 key，用于强制触发 */
  key: number;
}

interface UserAgentBarProps {
  latestChoice: string | null;
  commandKey: number;
  onCommand: (cmd: DirectorCommand) => void;
}

export function UserAgentBar({ latestChoice, commandKey, onCommand }: UserAgentBarProps) {
  const { stats } = useGameStore();
  const { user, isAuthenticated, login } = useSecondMe();

  // 未登录时显示连接引导
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#ff0055]/30 bg-[#ff0055]/5 px-4 py-3 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 text-xs font-mono text-[#ff0055]/70">
          <Zap className="w-3.5 h-3.5" />
          <span>USER_AGENT // 未绑定 Second Me</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={login}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#ff0055]/15 text-[#ff0055] hover:bg-[#ff0055]/25 transition-colors"
        >
          <LogIn className="w-3 h-3" />
          连接分身
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#ff0055]/50 bg-[#ff0055]/8 px-4 py-3 space-y-3"
        style={{ boxShadow: '0 0 20px rgba(255,0,85,0.12)' }}
      >
        {/* ── 标题行 ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#ff0055]/70 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-[#ff0055]" />
            <span>USER_AGENT // SESSION_ACTIVE</span>
          </div>
          {/* 在线指示灯 */}
          <span className="flex items-center gap-1.5 text-xs font-mono text-[#ff0055]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff0055] animate-pulse" />
            BOUND
          </span>
        </div>

        {/* ── 用户身份 ── */}
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-[#ff0055]/40 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border border-[#ff0055]/40 bg-[#ff0055]/10 flex items-center justify-center text-[#ff0055] text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <p className="text-xs font-mono text-foreground/90 font-semibold">{user?.name}</p>
            <p className="text-[10px] font-mono text-[#ff0055]/50">SECOND_ME · DIGITAL_TWIN</p>
          </div>
        </div>

        {/* ── 实时属性 ── */}
        <div className="grid grid-cols-2 gap-2">
          {/* 财富 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#00f2ff]/70">
              <span className="flex items-center gap-1">
                <Banknote className="w-3 h-3" />
                财富
              </span>
              <span className="font-bold text-[#00f2ff]">{stats.wealth}%</span>
            </div>
            <div className="h-1 bg-background/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${stats.wealth}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ background: 'linear-gradient(90deg, #00f2ff80, #00f2ff)', boxShadow: '0 0 6px #00f2ff60' }}
              />
            </div>
          </div>

          {/* 理智 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#ffd700]/70">
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                理智
              </span>
              <span className="font-bold text-[#ffd700]">{stats.sanity}%</span>
            </div>
            <div className="h-1 bg-background/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${stats.sanity}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ background: 'linear-gradient(90deg, #ffd70080, #ffd700)', boxShadow: '0 0 6px #ffd70060' }}
              />
            </div>
          </div>
        </div>

        {/* ── 最后指令摘要 ── */}
        {latestChoice && (
          <motion.div
            key={commandKey}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 pt-1 border-t border-[#ff0055]/20"
          >
            <span className="text-[10px] font-mono text-[#ff0055]/50 shrink-0 mt-0.5">DIRECTIVE&gt;</span>
            <span className="text-[10px] font-mono text-foreground/60 leading-relaxed line-clamp-2">{latestChoice}</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
