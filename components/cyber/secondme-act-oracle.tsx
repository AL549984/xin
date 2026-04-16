'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Loader2, TrendingDown, Minus, TrendingUp } from 'lucide-react';
import { parseSecondMeAct, type SecondMeActResult } from '@/lib/secondme';
import { useSecondMe } from '@/hooks/use-secondme';
import type { StoryChoice, SceneData } from '@/lib/game-types';

interface SecondMeActOracleProps {
  scene: SceneData | null;
  /** 场景切换时的唯一 key，用于重新触发 */
  sceneKey: string;
  /** 回调：预判结果就绪，供 DecisionMatrix 消费 */
  onResult: (result: SecondMeActResult | null) => void;
}

const RISK_CONFIG = {
  low:    { label: '局势稳定', color: '#00ff88', Icon: TrendingDown },
  medium: { label: '隐患潜伏', color: '#ffd700', Icon: Minus },
  high:   { label: '危机四伏', color: '#ff0055', Icon: TrendingUp },
} as const;

export function SecondMeActOracle({ scene, sceneKey, onResult }: SecondMeActOracleProps) {
  const { user, isAuthenticated } = useSecondMe();
  const [result, setResult] = useState<SecondMeActResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!scene || !isAuthenticated || !user) {
      setResult(null);
      onResult(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setResult(null);
    onResult(null);
    setIsPending(true);

    const run = async () => {
      try {
        const res = await fetch('/api/secondme/act', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneText: scene.narrativeText,
            choices: scene.branchingOptions.map((c: StoryChoice) => ({
              id: c.id,
              text: c.text,
              type: c.type,
            })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          setIsPending(false);
          return;
        }

        await parseSecondMeAct(
          res,
          (r) => {
            if (!controller.signal.aborted) {
              setResult(r);
              onResult(r);
            }
          },
          () => {
            if (!controller.signal.aborted) setIsPending(false);
          },
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setIsPending(false);
        }
      }
    };

    run();
    return () => { controller.abort(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey, isAuthenticated]);

  if (!isAuthenticated) return null;

  const riskCfg = result ? RISK_CONFIG[result.riskLevel] : null;

  return (
    <AnimatePresence>
      {(isPending || result) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-xl p-3.5 border border-[#a855f7]/20 flex items-center gap-3"
        >
          {/* 图标区 */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center">
            {isPending && !result ? (
              <Loader2 className="w-4 h-4 text-[#a855f7] animate-spin" />
            ) : (
              <Cpu className="w-4 h-4 text-[#a855f7]" />
            )}
          </div>

          {/* 内容区 */}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono text-[#a855f7]/50 uppercase tracking-widest mb-0.5">
              SECOND_ME ACT·命运预判
            </div>

            {isPending && !result ? (
              <div className="text-xs font-mono text-[#a855f7]/50">分身正在感应命运...</div>
            ) : result ? (
              <div className="flex items-center gap-3 flex-wrap">
                {/* 直觉语句 */}
                <span className="text-xs font-mono text-[#d8b4fe]/80 leading-snug">
                  {result.intuition}
                </span>

                {/* 风险标签 */}
                {riskCfg && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{
                      color: riskCfg.color,
                      background: `${riskCfg.color}15`,
                      border: `1px solid ${riskCfg.color}30`,
                    }}
                  >
                    <riskCfg.Icon className="w-3 h-3" />
                    {riskCfg.label}
                  </span>
                )}
              </div>
            ) : null}
          </div>

          {/* 用户微标 */}
          {user?.avatar && (
            <img
              src={user.avatar}
              alt=""
              className="w-5 h-5 rounded-full border border-[#a855f7]/30 flex-shrink-0 object-cover"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
