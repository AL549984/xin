'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, RotateCcw, Shield, Zap, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';

export function SoulBackupCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const { stats, keywords, chaosEvents, ending, resetGame } = useGameStore();
  const [showFullStory, setShowFullStory] = useState(false);

  // 用结局颜色作为主色；若无结局数据则回退到旧逻辑
  const accentColor = ending?.color ?? '#00f2ff';
  const serialNumber = `CL-${Date.now().toString(36).toUpperCase()}`;

  const handleShare = () => {
    const text = ending
      ? `我在 CYBER-LIFE 中达成了结局：${ending.title}`
      : '我完成了 CYBER-LIFE 的故事';
    if (navigator.share) {
      navigator.share({ title: 'CYBER-LIFE 灵魂备份', text, url: window.location.href });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen overflow-y-auto bg-[#020202] flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-2xl">
        {/* ── 结局标题区 ── */}
        {ending && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="text-xs font-mono mb-2" style={{ color: `${accentColor}80` }}>
              STORY_END // 档案封存
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold mb-2"
              style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}60` }}
            >
              {ending.title}
            </h2>
            <p className="text-sm font-mono text-muted-foreground">
              {ending.subtitle}
            </p>
          </motion.div>
        )}

        {/* ── 结局故事叙事 ── */}
        {ending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6 rounded-xl overflow-hidden"
            style={{ border: `1px solid ${accentColor}30`, background: `${accentColor}08` }}
          >
            <div className="p-5 md:p-6">
              <div className="text-xs font-mono mb-3" style={{ color: `${accentColor}60` }}>
                NEURAL_RECORD // 最终叙事
              </div>
              <AnimatePresence initial={false}>
                <motion.p
                  key={showFullStory ? 'full' : 'preview'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm leading-relaxed text-foreground/80 font-mono whitespace-pre-wrap"
                >
                  {showFullStory
                    ? ending.narrativeText
                    : ending.narrativeText.slice(0, 200) + (ending.narrativeText.length > 200 ? '……' : '')}
                </motion.p>
              </AnimatePresence>
              {ending.narrativeText.length > 200 && (
                <button
                  onClick={() => setShowFullStory(v => !v)}
                  className="mt-3 flex items-center gap-1 text-xs font-mono transition-colors"
                  style={{ color: accentColor }}
                >
                  {showFullStory ? (
                    <><ChevronUp className="w-3 h-3" /> 收起</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" /> 阅读完整结局</>
                  )}
                </button>
              )}
            </div>
            {/* 尾注 */}
            <div
              className="px-5 md:px-6 py-3 text-xs font-mono italic"
              style={{ borderTop: `1px solid ${accentColor}20`, color: `${accentColor}70` }}
            >
              // {ending.epilogue}
            </div>
          </motion.div>
        )}

        {/* ── 灵魂备份档案卡 ── */}
        <motion.div
          ref={cardRef}
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="relative bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] rounded-2xl overflow-hidden"
          style={{ boxShadow: `0 0 40px ${accentColor}25` }}
        >
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

          <div className="p-5 md:p-7">
            {/* 卡头 */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-1">CYBER-LIFE // 身份证明</div>
                <div className="text-xl md:text-2xl font-bold" style={{ color: accentColor }}>
                  {ending ? ending.title.split('】')[0].replace('【', '') : '幸存者'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-muted-foreground">序列号</div>
                <div className="text-sm font-mono" style={{ color: accentColor }}>{serialNumber}</div>
              </div>
            </div>

            {/* 关键词 */}
            {keywords.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-mono text-muted-foreground mb-2">核心特征</div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-1 rounded text-xs font-mono"
                      style={{
                        background: `${accentColor}15`,
                        border: `1px solid ${accentColor}30`,
                        color: accentColor,
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 属性 */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: '财富', value: stats.wealth, color: '#00f2ff', Icon: Zap },
                { label: '理智', value: stats.sanity, color: '#ffd700', Icon: Brain },
                { label: '同步率', value: stats.synchRate, color: '#00ff88', Icon: Shield },
              ].map(({ label, value, color, Icon }) => (
                <div key={label} className="text-center">
                  <div
                    className="w-11 h-11 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{ background: `${color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="text-base font-bold" style={{ color }}>{value}%</div>
                  <div className="text-xs font-mono text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            {/* 混沌事件 */}
            {chaosEvents.length > 0 && (
              <div className="mb-5 p-3 rounded-lg bg-[#ff0055]/10 border border-[#ff0055]/20">
                <div className="text-xs font-mono text-[#ff0055] mb-1">混沌事件记录</div>
                <div className="text-sm font-mono text-[#ff0055]/70">
                  {chaosEvents.map(e => e.name).join(' • ')}
                </div>
              </div>
            )}

            {/* 底部 */}
            <div className="flex items-center justify-between pt-4 border-t border-[#ffffff]/5">
              <div className="grid grid-cols-4 gap-0.5">
                {Array.from({ length: 16 }, (_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5"
                    style={{ background: (i * 7 + 3) % 3 !== 0 ? accentColor : 'transparent' }}
                  />
                ))}
              </div>
              <div className="text-right text-xs font-mono text-muted-foreground">
                <div>VERIFIED</div>
                <div>2099.{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
        </motion.div>

        {/* ── 操作按钮 ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 mt-5"
        >
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-sm transition-colors"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            <Share2 className="w-4 h-4" />分享
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={resetGame}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#ff0055]/20 text-[#ff0055] rounded-xl font-mono text-sm hover:bg-[#ff0055]/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />重玩
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
