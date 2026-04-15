'use client';

import { motion } from 'framer-motion';
import { Zap, Brain, Shield, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import type { StoryChoice } from '@/lib/game-types';

const ACT_TITLES = ['数据废墟', '霓虹巷弄', '秘密实验室', '红色警报', '代码9区'];

const CHOICE_TYPE_INFO: Record<string, { label: string; color: string }> = {
  normal:   { label: '谨慎', color: '#00ff88' },
  critical: { label: '关键', color: '#ffd700' },
  chaos:    { label: '混沌', color: '#ff0055' },
};

const STAT_LABELS: Record<string, string> = {
  wealth: '财富',
  sanity: '理智',
  synchRate: '同步率',
};

function formatStatImpact(statImpact: StoryChoice['statImpact']) {
  if (!statImpact) return null;
  return Object.entries(statImpact)
    .map(([k, v]) => `${STAT_LABELS[k] ?? k} ${v! > 0 ? '+' : ''}${v}`)
    .join('  ');
}

export function SummaryScreen() {
  const { stats, choiceHistory, chaosLevel, chaosEvents, scenes, proceedToEnding } = useGameStore();

  /* ── 逐幕决策摘要 ── */
  const actSummaries = scenes.map((scene, index) => {
    const choiceId = choiceHistory[index];
    const choice = scene.branchingOptions.find(c => c.id === choiceId) ?? null;
    return {
      actNum: index + 1,
      title: ACT_TITLES[index] ?? `第 ${index + 1} 幕`,
      sectorCode: scene.sectorCode,
      choice,
    };
  });

  /* ── 决策风格分析 ── */
  const typeCount = { normal: 0, critical: 0, chaos: 0 };
  actSummaries.forEach(s => {
    if (s.choice?.type && s.choice.type in typeCount) {
      typeCount[s.choice.type as keyof typeof typeCount]++;
    }
  });

  const dominant = (Object.keys(typeCount) as (keyof typeof typeCount)[]).reduce((a, b) =>
    typeCount[a] >= typeCount[b] ? a : b
  );

  const STYLE_MAP: Record<string, { label: string; desc: string; color: string }> = {
    chaos: {
      label: '混沌革命者',
      desc: '你习惯以极端手段打破规则，将世界推向不可逆的临界点',
      color: '#ff0055',
    },
    critical: {
      label: '冷静博弈者',
      desc: '你审时度势，在关键节点押下最重的筹码',
      color: '#ffd700',
    },
    normal: {
      label: '谨慎幸存者',
      desc: '你选择稳健行事，以时间和耐心换取最终的生存空间',
      color: '#00ff88',
    },
  };

  const style = STYLE_MAP[dominant] ?? {
    label: '多元策略者',
    desc: '你在谨慎与冒险之间寻求平衡，以灵活姿态应对瞬息万变的局面',
    color: '#00f2ff',
  };

  /* ── 结局成因解析 ── */
  const lastChoice = choiceHistory[choiceHistory.length - 1];
  let endingReason = '';
  if (stats.sanity < 20) {
    endingReason = '超载的数据冲击使你的意识在临界点彻底碎裂——理智的崩溃比任何外部威胁都更致命。';
  } else if (lastChoice === 'choice_5a') {
    endingReason = '你选择将真相彻底公开，放弃了安全换取了改变——即便那意味着再也无路可回。';
  } else if (lastChoice === 'choice_5c') {
    endingReason = '你将个人命运融入更大的反抗浪潮，代码起义的火种由此点燃，无法熄灭。';
  } else if (lastChoice === 'choice_5b') {
    endingReason =
      stats.wealth >= 50
        ? '充足的财富筹码支撑起了一场有效的谈判，沉默协议以生存为代价，以自由为报酬。'
        : '财富赤字暴露了你的底气，谈判在开始之前就已注定失败，Nexion从未打算认真倾听。';
  } else {
    endingReason = '你的抉择路径在混沌与秩序的夹缝间划出了独特的轨迹，命运以此为坐标作出回应。';
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen overflow-y-auto bg-[#020202] flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-2xl space-y-5">
        {/* ── 页眉 ── */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <div className="text-xs font-mono text-[#00f2ff]/50 mb-2">
            GAME_COMPLETE // 旅程终结分析报告
          </div>
          <h1
            className="text-2xl md:text-3xl font-bold text-[#00f2ff]"
            style={{ textShadow: '0 0 20px #00f2ff60' }}
          >
            {scenes.length}幕决策档案
          </h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            完整行为记录已生成 // NEURAL_ARCHIVE_COMPLETE
          </p>
        </motion.div>

        {/* ── 决策时间线 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[#00f2ff]/20 bg-[#00f2ff]/[0.03] overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-[#00f2ff]/10 text-xs font-mono text-[#00f2ff]/50">
            DECISION_TIMELINE // 决策时间线
          </div>
          <div className="divide-y divide-white/5">
            {actSummaries.map(({ actNum, title, sectorCode, choice }, i) => {
              const typeInfo = choice ? CHOICE_TYPE_INFO[choice.type] : null;
              const impactStr = choice ? formatStatImpact(choice.statImpact) : null;
              return (
                <motion.div
                  key={actNum}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="px-5 py-4 flex items-start gap-4"
                >
                  {/* 幕号 */}
                  <div className="flex-shrink-0 w-10 text-center">
                    <div className="text-xs font-mono text-[#00f2ff]/40">幕{actNum}</div>
                    <div className="text-[10px] font-mono text-[#00f2ff]/30">[{sectorCode}]</div>
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono text-muted-foreground mb-1">{title}</div>
                    {choice ? (
                      <>
                        <div className="text-sm text-foreground/90 leading-snug">{choice.text}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {typeInfo && (
                            <span
                              className="text-[11px] font-mono px-2 py-0.5 rounded"
                              style={{
                                color: typeInfo.color,
                                background: `${typeInfo.color}15`,
                                border: `1px solid ${typeInfo.color}30`,
                              }}
                            >
                              {typeInfo.label}
                            </span>
                          )}
                          {impactStr && (
                            <span className="text-[11px] font-mono text-muted-foreground">{impactStr}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground font-mono">[无记录]</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── 属性终值 + 行动风格 ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* 属性终值 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4"
          >
            <div className="text-[11px] font-mono text-muted-foreground mb-3">FINAL_STATS // 终值属性</div>
            <div className="space-y-3">
              {[
                { label: '财富',  value: stats.wealth,    color: '#00f2ff', Icon: Zap },
                { label: '理智',  value: stats.sanity,    color: '#ffd700', Icon: Brain },
                { label: '同步率', value: stats.synchRate, color: '#00ff88', Icon: Shield },
              ].map(({ label, value, color, Icon }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3" style={{ color }} />
                      <span className="text-xs font-mono" style={{ color }}>{label}</span>
                    </div>
                    <span className="text-xs font-mono" style={{ color }}>{value}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 text-[11px] font-mono text-muted-foreground">
              混沌值:&nbsp;
              <span style={{ color: `${chaosLevel >= 60 ? '#ff0055' : '#ff660080'}` }}>
                {chaosLevel}%
              </span>
              {chaosEvents.length > 0 && (
                <span className="ml-2 text-[#ff0055]/60">
                  · {chaosEvents.length} 次混沌事件
                </span>
              )}
            </div>
          </motion.div>

          {/* 行动风格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: `${style.color}30`, background: `${style.color}08` }}
          >
            <div className="p-4">
              <div className="text-[11px] font-mono mb-3" style={{ color: `${style.color}60` }}>
                PLAY_STYLE // 行动风格
              </div>
              <div className="text-sm font-bold mb-2" style={{ color: style.color }}>
                {style.label}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{style.desc}</p>

              {/* 决策分布 */}
              <div className="mt-4 flex gap-1.5">
                {(['normal', 'critical', 'chaos'] as const).map(type => (
                  <div key={type} className="flex-1 text-center">
                    <div
                      className="text-base font-bold"
                      style={{ color: CHOICE_TYPE_INFO[type].color }}
                    >
                      {typeCount[type]}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {CHOICE_TYPE_INFO[type].label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── 结局成因解析 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="rounded-xl border border-[#ff0055]/20 bg-[#ff0055]/[0.04] p-5"
        >
          <div className="text-[11px] font-mono text-[#ff0055]/50 mb-2">
            ENDING_ANALYSIS // 结局成因解析
          </div>
          <p className="text-sm font-mono text-foreground/80 leading-relaxed">{endingReason}</p>
        </motion.div>

        {/* ── 查看命运档案按钮 ── */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={proceedToEnding}
          className="w-full py-4 rounded-xl font-mono text-sm flex items-center justify-center gap-2 transition-colors"
          style={{
            background: '#00f2ff18',
            color: '#00f2ff',
            border: '1px solid #00f2ff30',
          }}
        >
          查看你的命运档案
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
