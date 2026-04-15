'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Plus, X, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
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
    // 从响应文本中提取 JSON 块（防止 API 返回带警告前缀的非纯 JSON）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const data = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(data?.scenes) || data.scenes.length < 3) {
      throw new Error('Invalid scene structure');
    }
    return data.scenes as SceneData[];
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('场景生成失败，回退默认场景:', err);
    return null;
  }
}

export function InitScreen() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'generating' | 'booting'>('generating');
  const { initializeGame } = useGameStore();

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
    const customScenes = await generateScenes(keywords);
    setLoadingStage('booting');
    await new Promise(resolve => setTimeout(resolve, 800));
    initializeGame(keywords, customScenes ?? undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen overflow-y-auto bg-[#020202] flex items-center justify-center p-4 md:p-8 relative"
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
        className="w-full max-w-2xl"
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
              建议关键词：
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedKeywords
                .filter(k => !keywords.includes(k))
                .slice(0, 6)
                .map((keyword) => (
                  <motion.button
                    key={keyword}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addKeyword(keyword)}
                    disabled={keywords.length >= 5}
                    className="px-3 py-1 bg-background/30 border border-[#00f2ff]/10 rounded-full text-xs font-mono text-muted-foreground hover:text-[#00f2ff] hover:border-[#00f2ff]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
