'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Plus, X, ChevronRight, User, LogOut, Loader2 } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { useSecondMe } from '@/hooks/use-secondme';
import { Scanlines, MiniChart } from './fui-overlays';
import type { SceneData } from '@/lib/game-types';

const suggestedKeywords = [
  '企业刺客',
  '2099',
  '合成灵魂',
  '记忆商人',
  '神经黑客',
  '复制人',
  '赛博僧侣',
  '数据走私',
];

function extractJsonPayload(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    return trimmed;
  }

  const fencedJsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedJsonMatch?.[1]) {
    return fencedJsonMatch[1].trim();
  }

  const firstObjectStart = trimmed.indexOf('{');
  const lastObjectEnd = trimmed.lastIndexOf('}');
  if (firstObjectStart !== -1 && lastObjectEnd !== -1 && lastObjectEnd > firstObjectStart) {
    return trimmed.slice(firstObjectStart, lastObjectEnd + 1);
  }

  const firstArrayStart = trimmed.indexOf('[');
  const lastArrayEnd = trimmed.lastIndexOf(']');
  if (firstArrayStart !== -1 && lastArrayEnd !== -1 && lastArrayEnd > firstArrayStart) {
    return trimmed.slice(firstArrayStart, lastArrayEnd + 1);
  }

  return null;
}

function normalizeGeneratedScenes(payload: unknown): SceneData[] | null {
  const scenes = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { scenes?: unknown[] }).scenes)
      ? (payload as { scenes: unknown[] }).scenes
      : null;

  if (!scenes || scenes.length < 3) return null;

  return scenes.slice(0, 3).map((scene, index) => {
    const fallbackScene = {
      id: `scene_${String(index + 1).padStart(3, '0')}`,
      sectorCode: ['7G', '4X', '9Z'][index] ?? '??',
      streamStatus: ['已加密', '监控中', '机密'][index] ?? '未知',
      statImpact: index === 0 ? { wealth: -10 } : index === 1 ? { synchRate: 5 } : { sanity: -10 },
    };

    const rawScene = scene && typeof scene === 'object' ? (scene as Record<string, unknown>) : {};
    const branchingOptions = Array.isArray(rawScene.branchingOptions)
      ? rawScene.branchingOptions
          .filter(option => option && typeof option === 'object')
          .slice(0, 3)
          .map((option, optionIndex) => {
            const rawOption = option as Record<string, unknown>;
            const type = rawOption.type;
            return {
              id:
                typeof rawOption.id === 'string'
                  ? rawOption.id
                  : `choice_${index + 1}${String.fromCharCode(97 + optionIndex)}`,
              text: typeof rawOption.text === 'string' ? rawOption.text : `选项${optionIndex + 1}`,
              type: type === 'normal' || type === 'critical' || type === 'chaos' ? type : 'normal',
              statImpact:
                rawOption.statImpact && typeof rawOption.statImpact === 'object'
                  ? (rawOption.statImpact as SceneData['statImpact'])
                  : undefined,
            };
          })
      : [];

    return {
      id: typeof rawScene.id === 'string' ? rawScene.id : fallbackScene.id,
      sectorCode:
        typeof rawScene.sectorCode === 'string' ? rawScene.sectorCode : fallbackScene.sectorCode,
      streamStatus:
        typeof rawScene.streamStatus === 'string' ? rawScene.streamStatus : fallbackScene.streamStatus,
      videoPromptDescription:
        typeof rawScene.videoPromptDescription === 'string'
          ? rawScene.videoPromptDescription
          : 'cinematic cyberpunk city, neon rain, dystopian future',
      narrativeText:
        typeof rawScene.narrativeText === 'string'
          ? rawScene.narrativeText
          : '信号受损，默认叙事片段已接管。',
      statImpact:
        rawScene.statImpact && typeof rawScene.statImpact === 'object'
          ? (rawScene.statImpact as SceneData['statImpact'])
          : fallbackScene.statImpact,
      branchingOptions:
        branchingOptions.length > 0
          ? branchingOptions
          : [
              { id: `choice_${index + 1}a`, text: '继续追查信号源', type: 'normal' as const },
              { id: `choice_${index + 1}b`, text: '尝试强制突破封锁', type: 'critical' as const },
              { id: `choice_${index + 1}c`, text: '交给混沌协议处理', type: 'chaos' as const },
            ],
    };
  });
}

async function generateScenes(keywords: string[]): Promise<SceneData[] | null> {
  const seed = keywords.reduce((acc, k) => acc + k.charCodeAt(0), 0);
  const prompt = `You are a cyberpunk interactive story generator. Generate exactly 3 interconnected scenes in Chinese based on these CHARACTER TRAITS/KEYWORDS: ${keywords.join('\u3001')}.

IMPORTANT RULES:
- The protagonist's character MUST be deeply shaped by ALL given keywords (e.g. if keywords include "企业刺客", the character IS an assassin; if "记忆商人", they trade memories)
- Scene 1 (开头): Story beginning, establish the cyberpunk world and protagonist's identity using the keywords, 150+ Chinese chars
- Scene 2 (经过/发展): Rising conflict, complications, plot twist that involves the keyword traits, 150+ Chinese chars  
- Scene 3 (高潮+结局): Dramatic climax and resolution that ties back to the keywords and character traits, 150+ Chinese chars
- Each narrativeText must be immersive first-person or third-person cyberpunk prose that EXPLICITLY references the keywords
- videoPromptDescription must be in English, cinematic cyberpunk

Return ONLY valid JSON:
{
  "scenes": [
    {
      "id": "scene_001",
      "sectorCode": "7G",
      "streamStatus": "已加密",
      "videoPromptDescription": "cyberpunk scene description in English, cinematic shot",
      "narrativeText": "开头场景，150字以上的中文叙事，融入关键词特征",
      "statImpact": { "wealth": -10 },
      "branchingOptions": [
        { "id": "choice_1a", "text": "选项A", "type": "normal", "statImpact": { "sanity": -5 } },
        { "id": "choice_1b", "text": "选项B", "type": "critical", "statImpact": { "wealth": 10 } },
        { "id": "choice_1c", "text": "选项C", "type": "chaos", "statImpact": { "synchRate": -15 } }
      ]
    },
    {
      "id": "scene_002",
      "sectorCode": "4X",
      "streamStatus": "监控中",
      "videoPromptDescription": "second scene English description",
      "narrativeText": "经过/发展场景，150字以上",
      "statImpact": { "synchRate": 5 },
      "branchingOptions": [
        { "id": "choice_2a", "text": "选项A", "type": "normal", "statImpact": { "sanity": 5 } },
        { "id": "choice_2b", "text": "选项B", "type": "critical", "statImpact": { "wealth": -20, "synchRate": 15 } },
        { "id": "choice_2c", "text": "选项C", "type": "chaos", "statImpact": { "sanity": -15, "synchRate": 20 } }
      ]
    },
    {
      "id": "scene_003",
      "sectorCode": "9Z",
      "streamStatus": "机密",
      "videoPromptDescription": "third scene English description, climax",
      "narrativeText": "高潮和结局场景，150字以上",
      "statImpact": { "sanity": -10 },
      "branchingOptions": [
        { "id": "choice_3a", "text": "选项A", "type": "critical", "statImpact": { "wealth": 30, "synchRate": -15 } },
        { "id": "choice_3b", "text": "选项B", "type": "chaos", "statImpact": { "sanity": -20, "wealth": -10 } },
        { "id": "choice_3c", "text": "选项C", "type": "normal", "statImpact": { "sanity": 5 } }
      ]
    }
  ]
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000);

  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [{ role: 'user', content: prompt }],
        seed,
        jsonMode: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const jsonPayload = extractJsonPayload(text);
    if (!jsonPayload) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('场景生成返回非 JSON，已回退默认场景');
      }
      return null;
    }

    const normalizedScenes = normalizeGeneratedScenes(JSON.parse(jsonPayload));
    if (!normalizedScenes) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('场景生成结构无效，已回退默认场景');
      }
      return null;
    }

    return normalizedScenes;
  } catch (err) {
    clearTimeout(timeoutId);
    if (process.env.NODE_ENV !== 'production') {
      console.warn('场景生成失败，已回退默认场景:', err);
    }
    return null;
  }
}

export function InitScreen() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'generating' | 'booting'>('generating');
  const { initializeGame } = useGameStore();
  const { user, isLoading: isUserLoading, isAuthenticated, login, logout } = useSecondMe();

  // 登录成功后从用户 bio/interests 自动推导关键词建议
  const secondmeKeywords: string[] = (() => {
    if (!user) return [];
    const tags: string[] = Array.isArray(user.interests) ? user.interests : [];
    // 从 bio 中提取逗号分隔词语
    const bioWords = user.bio
      ? user.bio.split(/[,，、\s]+/).filter(w => w.length >= 2 && w.length <= 8)
      : [];
    return [...new Set([...tags, ...bioWords])].slice(0, 6);
  })();

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !keywords.includes(keyword.trim()) && keywords.length < 5) {
      setKeywords([...keywords, keyword.trim()]);
      setInputValue('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleStart = async () => {
    if (keywords.length === 0) return;

    setIsLoading(true);
    setLoadingStage('generating');
    try {
      const customScenes = await generateScenes(keywords);
      setLoadingStage('booting');
      await new Promise(resolve => setTimeout(resolve, 800));
      initializeGame(keywords, customScenes ?? undefined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-dvh overflow-y-auto no-scrollbar bg-[#020202] flex items-start md:items-center justify-center p-4 md:p-8 relative"
    >
      {/* Background effects */}
      <div className="absolute inset-0 fui-grid opacity-50" />
      <Scanlines />
      
      {/* Decorative elements */}
      <div className="absolute top-8 left-8">
        <MiniChart />
      </div>
      <div className="absolute bottom-8 right-8">
        <MiniChart />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl my-4 md:my-0"
      >
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <Zap className="w-8 h-8 text-[#00f2ff]" />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              <span className="text-[#00f2ff]">CYBER</span>
              <span className="text-[#ff0055]">-</span>
              <span className="text-foreground">LIFE</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground font-mono text-sm"
          >
            THE GLITCH SCRIPT // AI 影游体验
          </motion.p>
        </div>

        {/* Initialization card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 md:p-8"
        >
          <div className="text-xs font-mono text-[#00f2ff]/50 uppercase tracking-widest mb-6">
            {'>'} 初始化生命蓝图
          </div>

          {/* SecondMe 接入区域 */}
          <div className="mb-6 border border-[#00f2ff]/15 rounded-xl p-4 bg-[#00f2ff]/[0.03]">
            <div className="text-xs font-mono text-[#00f2ff]/50 uppercase tracking-widest mb-3">
              {'>'} SecondMe 数字分身接入
            </div>

            {isUserLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>检测授权状态...</span>
              </div>
            ) : isAuthenticated && user ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-[#00f2ff]/40 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-[#00f2ff]/40 bg-[#00f2ff]/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#00f2ff]" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-mono text-[#00f2ff]">{user.name}</div>
                    {user.bio && (
                      <div className="text-xs font-mono text-muted-foreground line-clamp-1 max-w-[220px]">
                        {user.bio}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-[#ff0055] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  断开
                </button>
              </motion.div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-muted-foreground">
                  接入分身以使用你的真实人格数据生成专属剧情
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={login}
                  className="ml-4 shrink-0 px-3 py-1.5 bg-[#00f2ff]/15 border border-[#00f2ff]/40 rounded-lg text-xs font-mono text-[#00f2ff] hover:bg-[#00f2ff]/25 transition-colors"
                >
                  接入分身
                </motion.button>
              </div>
            )}
          </div>

          {/* Keyword input */}
          <div className="mb-6">
            <label className="block text-sm font-mono text-muted-foreground mb-2">
              输入你的生命关键词（最多5个）
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword(inputValue)}
                placeholder="例如：企业刺客、2099..."
                className="flex-1 bg-background/50 border border-[#00f2ff]/20 rounded-lg px-4 py-3 text-sm font-mono outline-none focus:border-[#00f2ff]/50 transition-colors text-foreground placeholder:text-muted-foreground"
                disabled={keywords.length >= 5}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addKeyword(inputValue)}
                disabled={!inputValue.trim() || keywords.length >= 5}
                className="px-4 py-3 bg-[#00f2ff]/20 text-[#00f2ff] rounded-lg hover:bg-[#00f2ff]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Selected keywords */}
          <AnimatePresence>
            {keywords.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6"
              >
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <motion.span
                      key={keyword}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-full text-sm font-mono text-[#00f2ff]"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-[#ff0055] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggested keywords */}
          <div className="mb-8">
            <div className="text-xs font-mono text-muted-foreground mb-2">
              {isAuthenticated && secondmeKeywords.length > 0
                ? '来自你分身的关键词：'
                : '建议关键词：'}
            </div>
            <div className="flex flex-wrap gap-2">
              {(isAuthenticated && secondmeKeywords.length > 0
                ? secondmeKeywords
                : suggestedKeywords
              )
                .filter(k => !keywords.includes(k))
                .slice(0, 6)
                .map((keyword) => (
                  <motion.button
                    key={keyword}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addKeyword(keyword)}
                    disabled={keywords.length >= 5}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                      isAuthenticated && secondmeKeywords.length > 0
                        ? 'bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff]/80 hover:text-[#00f2ff] hover:border-[#00f2ff]/50'
                        : 'bg-background/30 border border-[#00f2ff]/10 text-muted-foreground hover:text-[#00f2ff] hover:border-[#00f2ff]/30'
                    }`}
                  >
                    + {keyword}
                  </motion.button>
                ))}
            </div>
          </div>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={keywords.length === 0 || isLoading}
            className={`
              w-full py-4 rounded-xl font-mono text-lg font-bold
              flex items-center justify-center gap-3
              transition-all duration-300
              ${keywords.length > 0
                ? 'bg-[#00f2ff] text-[#020202] pulse-glow hover:bg-[#00f2ff]/90'
                : 'bg-[#1a1a1a] text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-[#020202] border-t-transparent rounded-full"
                />
                {loadingStage === 'generating' ? 'AI 生成中...' : '启动中...'}
              </>
            ) : (
              <>
                启动 CYBER-LIFE
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-xs font-mono text-muted-foreground"
        >
          A2A Hackathon // AI-Driven Interactive Cinema
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
