'use client';

import { create } from 'zustand';
import type { GameState, ChaosEvent, PlayerStats, StoryChoice, EndingData } from './game-types';
import { mockScenes, chaosEventResponses, endings } from './game-types';

interface GameStore extends GameState {
  // Actions
  initializeGame: (keywords: string[], scenes?: SceneData[]) => void;
  nextScene: () => void;
  makeChoice: (choice: StoryChoice) => void;
  triggerChaos: (eventName: string) => void;
  updateStats: (changes: Partial<PlayerStats>) => void;
  setGlitchActive: (active: boolean) => void;
  setSystemBreach: (breach: boolean) => void;
  preloadNextVideo: () => void;
  onVideoReady: () => void;
  endGame: () => void;
  resetGame: () => void;
  proceedToEnding: () => void;
}

const initialStats: PlayerStats = {
  wealth: 50,
  sanity: 75,
  synchRate: 60,
};

const initialState: GameState = {
  phase: 'init',
  keywords: [],
  scenes: mockScenes,
  currentScene: null,
  stats: initialStats,
  chaosLevel: 0,
  chaosEvents: [],
  narrativeHistory: [],
  systemBreach: false,
  glitchActive: false,
  videoStatus: 'loading',
  nextVideoStatus: 'idle',
  isRenderingGlitch: false,
  isTransitioning: false,
  choiceHistory: [],
  ending: null,
};

/** 根据玩家的选择历史与最终属性值计算结局 */
function calculateEnding(choiceHistory: string[], stats: PlayerStats, chaosLevel: number): EndingData {
  // 理智过低 → 精神崩溃结局（最优先）
  if (stats.sanity < 20) return endings.breakdown;

  // 按最终场景选择判断主线结局
  if (choiceHistory.includes('choice_5a')) return endings.expose;
  if (choiceHistory.includes('choice_5c')) return endings.revolution;
  if (choiceHistory.includes('choice_5b')) {
    // 财富充足才能谈判成功
    return stats.wealth >= 50 ? endings.deal : endings.deal_fail;
  }

  // 兜底：混沌值高 → 革命；否则幸存
  return chaosLevel >= 60 ? endings.revolution : endings.deal;
}

export const useGameStore = create<GameStore>((set, get) => {
  /**
   * 完成场景转换：切换到下一幕并重启视频加载周期。
   * 在视频预加载完成后由 makeChoice（顺滑路径）或
   * preloadNextVideo（故障等待路径）调用。
   */
  function advanceToNextScene() {
    const { currentScene, narrativeHistory, scenes, stats, chaosLevel, choiceHistory } = get();
    if (!currentScene) return;

    const currentIndex = scenes.findIndex(s => s.id === currentScene.id);

    // 最后一幕结束 → 进入 summary 总结分析阶段
    if (currentIndex === scenes.length - 1) {
      set({
        phase: 'summary',
        isRenderingGlitch: false,
        isTransitioning: false,
      });
      return;
    }

    const nextIndex = currentIndex + 1;
    const next = scenes[nextIndex];

    set({
      currentScene: next,
      narrativeHistory: [...narrativeHistory, next.narrativeText],
      isRenderingGlitch: false,
      isTransitioning: false,
      videoStatus: 'loading',
      nextVideoStatus: 'idle',
    });
    // 由 CinematicCanvas 图片 onLoad 事件驱动 videoStatus → 'ready'
  }

  return {
    ...initialState,

    initializeGame: (keywords: string[], customScenes?: SceneData[]) => {
      const scenes = customScenes ?? mockScenes;
      set({
        phase: 'playing',
        keywords,
        scenes,
        currentScene: scenes[0],
        stats: initialStats,
        chaosLevel: 0,
        chaosEvents: [],
        narrativeHistory: [scenes[0].narrativeText],
        videoStatus: 'loading',
        nextVideoStatus: 'idle',
        isRenderingGlitch: false,
        isTransitioning: false,
        choiceHistory: [],
        ending: null,
      });
      // 由 CinematicCanvas 图片 onLoad 事件驱动 videoStatus → 'ready'
    },

    onVideoReady: () => {
      if (get().videoStatus === 'ready') return;
      set({ videoStatus: 'ready' });
      get().preloadNextVideo();
    },

    preloadNextVideo: () => {
      set({ nextVideoStatus: 'preloading' });

      // 模拟 API 调用延迟（3-8 秒）
      const delay = 3000 + Math.random() * 5000;
      setTimeout(() => {
        set({ nextVideoStatus: 'ready' });

        // 若玩家已在等待（故障渲染遮罩正在显示），稍后自动跳转
        if (get().isRenderingGlitch) {
          setTimeout(() => advanceToNextScene(), 800);
        }
      }, delay);
    },

    nextScene: () => {
      advanceToNextScene();
    },

    makeChoice: (choice: StoryChoice) => {
      const { stats, narrativeHistory, chaosLevel, nextVideoStatus, isTransitioning } = get();
      // 防多次点击：转场中直接忽略
      if (isTransitioning) return;

      // 应用属性变化
      const newStats = { ...stats };
      if (choice.statImpact) {
        if (choice.statImpact.wealth !== undefined) {
          newStats.wealth = Math.max(0, Math.min(100, newStats.wealth + choice.statImpact.wealth));
        }
        if (choice.statImpact.sanity !== undefined) {
          newStats.sanity = Math.max(0, Math.min(100, newStats.sanity + choice.statImpact.sanity));
        }
        if (choice.statImpact.synchRate !== undefined) {
          newStats.synchRate = Math.max(0, Math.min(100, newStats.synchRate + choice.statImpact.synchRate));
        }
      }

      // 混沌值累加
      let newChaosLevel = chaosLevel;
      if (choice.type === 'critical') newChaosLevel += 10;
      if (choice.type === 'chaos') newChaosLevel += 25;
      newChaosLevel = Math.min(100, newChaosLevel);

      set({
        stats: newStats,
        chaosLevel: newChaosLevel,
        narrativeHistory: [...narrativeHistory, `> ${choice.text}`],
        choiceHistory: [...get().choiceHistory, choice.id],
        glitchActive: true,
        isTransitioning: true,
      });

      // 故障动效持续 500ms
      setTimeout(() => set({ glitchActive: false }), 500);

      if (nextVideoStatus === 'ready') {
        // 顺滑路径：视频已预加载，直接切换
        setTimeout(() => advanceToNextScene(), 600);
      } else {
        // 等待路径：视频未就绪，展示 FUI 故障渲染遮罩
        // 注意：在 600ms 延迟窗口内 preloadNextVideo 的定时器可能已触发并把
        // nextVideoStatus 设为 'ready'，但此时 isRenderingGlitch 还是 false，
        // 导致 preloadNextVideo 跳过了 advanceToNextScene 的调用。
        // 修复：设置遮罩后立即检查最新状态，若已就绪则主动调度跳转。
        setTimeout(() => {
          set({ isRenderingGlitch: true });
          if (get().nextVideoStatus === 'ready') {
            setTimeout(() => advanceToNextScene(), 800);
          }
        }, 600);
      }
    },

    triggerChaos: (eventName: string) => {
      const { chaosEvents, chaosLevel, narrativeHistory, stats } = get();

      const newEvent: ChaosEvent = {
        id: `chaos_${Date.now()}`,
        name: eventName,
        timestamp: Date.now(),
        impact: chaosEventResponses[eventName] || `[系统错误: 检测到 ${eventName}]`,
      };

      const newStats = {
        wealth: Math.max(0, stats.wealth - 15),
        sanity: Math.max(0, stats.sanity - 10),
        synchRate: Math.max(0, stats.synchRate - 5),
      };

      set({
        phase: 'chaos',
        systemBreach: true,
        glitchActive: true,
        chaosEvents: [...chaosEvents, newEvent],
        chaosLevel: Math.min(100, chaosLevel + 20),
        narrativeHistory: [...narrativeHistory, newEvent.impact],
        stats: newStats,
      });

      setTimeout(() => {
        set({ phase: 'playing', systemBreach: false, glitchActive: false });
      }, 2000);
    },

    updateStats: (changes: Partial<PlayerStats>) => {
      const { stats } = get();
      set({
        stats: {
          wealth: changes.wealth !== undefined ? Math.max(0, Math.min(100, changes.wealth)) : stats.wealth,
          sanity: changes.sanity !== undefined ? Math.max(0, Math.min(100, changes.sanity)) : stats.sanity,
          synchRate: changes.synchRate !== undefined ? Math.max(0, Math.min(100, changes.synchRate)) : stats.synchRate,
        },
      });
    },

    setGlitchActive: (active: boolean) => set({ glitchActive: active }),

    setSystemBreach: (breach: boolean) => set({ systemBreach: breach }),

    endGame: () => {
      // 手动结束时直接计算结局，跳过 summary 总结页
      const { choiceHistory, stats, chaosLevel, narrativeHistory } = get();
      const ending = calculateEnding(choiceHistory, stats, chaosLevel);
      set({
        phase: 'ending',
        ending,
        narrativeHistory: [...narrativeHistory, ending.narrativeText],
      });
    },

    proceedToEnding: () => {
      const { choiceHistory, stats, chaosLevel, narrativeHistory } = get();
      const ending = calculateEnding(choiceHistory, stats, chaosLevel);
      set({
        phase: 'ending',
        ending,
        narrativeHistory: [...narrativeHistory, ending.narrativeText],
      });
    },

    resetGame: () => set(initialState),
  };
});
