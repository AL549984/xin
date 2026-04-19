'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';

export function NarrativeDisplay() {
  const { currentScene, narrativeHistory, glitchActive, systemBreach, setTTSSpeaking } = useGameStore();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Play local narration audio for the current scene
  const playNarration = () => {
    const audio = audioRef.current;
    if (!audio || !currentScene) return;

    // Audio file path: /narration/scene_<id>.mp3
    const src = `/narration/${currentScene.id}.mp3`;
    audio.src = src;
    setTTSSpeaking(true);

    audio.play().catch(() => {
      // File may not exist yet — silently skip
      setTTSSpeaking(false);
    });

    audio.onended = () => setTTSSpeaking(false);
    audio.onerror = () => setTTSSpeaking(false);
  };

  // Typewriter effect + narration audio sync
  useEffect(() => {
    if (!currentScene) return;
    
    setIsTyping(true);
    setDisplayedText('');
    const text = currentScene.narrativeText;
    let index = 0;

    // Start audio first
    playNarration();

    // Delay typewriter so audio leads by 1.5s
    const startDelay = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 200);

      // Store interval id for cleanup
      cleanupRef.current = () => clearInterval(typeInterval);
    }, 1500);

    const cleanupRef = { current: () => {} };

    return () => {
      clearTimeout(startDelay);
      cleanupRef.current();
    };
  }, [currentScene]);

  return (
    <div className="relative">
      {/* Main narrative container */}
      <motion.div
        className={`glass rounded-xl p-4 md:p-6 ${glitchActive ? 'rgb-split' : ''}`}
        animate={systemBreach ? { 
          borderColor: ['rgba(0,242,255,0.2)', 'rgba(255,0,85,0.8)', 'rgba(0,242,255,0.2)'],
        } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 text-xs font-mono text-[#00f2ff]/50">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isTyping ? 'bg-[#00f2ff] animate-pulse' : 'bg-[#00f2ff]/30'}`} />
            {isTyping ? '传输中...' : '传输完成'}
          </span>
          <span className="text-[#00f2ff]/30">|</span>
          <span>NEURAL_STREAM</span>
        </div>

        {/* Narrative text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene?.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-mono text-sm md:text-base leading-relaxed text-foreground min-h-[120px] overflow-y-auto hide-scrollbar"
          >
            {displayedText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-[#00f2ff] ml-1"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Narrative history (scrollable) */}
        {narrativeHistory.length > 1 && (
          <div className="mt-4 pt-4 border-t border-[#00f2ff]/10">
            <div className="text-xs font-mono text-[#00f2ff]/30 mb-2">// 记忆日志</div>
            <div className="max-h-24 overflow-y-auto hide-scrollbar space-y-2">
              {narrativeHistory.slice(0, -1).map((text, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 0.5, x: 0 }}
                  className="text-xs text-muted-foreground font-mono truncate"
                >
                  {text.startsWith('>') ? (
                    <span className="text-[#ffd700]">{text}</span>
                  ) : text.startsWith('[') ? (
                    <span className="text-[#ff0055]">{text}</span>
                  ) : (
                    text
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Hidden audio element for TTS */}
      <audio ref={audioRef} />
    </div>
  );
}
