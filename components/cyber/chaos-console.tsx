'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';

export function ChaosConsole() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { triggerChaos, phase } = useGameStore();

  const chaosCommands = [
    '金融崩溃',
    '记忆入侵',
    '身份泄露',
    '系统崩溃',
    '病毒感染',
  ];

  useEffect(() => {
    if (input.length > 0) {
      const filtered = chaosCommands.filter(cmd => 
        cmd.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && phase === 'playing') {
      triggerChaos(input.trim());
      setInput('');
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Console container */}
      <motion.div
        className="glass rounded-xl p-4 border border-[#00f2ff]/20"
        whileHover={{ borderColor: 'rgba(0, 242, 255, 0.4)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 text-xs font-mono text-[#00f2ff]/50">
          <Terminal className="w-3 h-3" />
          <span>CHAOS_INTERVENTION_CONSOLE</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>READY</span>
          </span>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2 border border-[#00f2ff]/10 focus-within:border-[#00f2ff]/40 transition-colors">
            <span className="text-[#00f2ff] font-mono text-sm">
              [INT_COMMAND_BYPASS {'>'} ]
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入混沌事件..."
              className="flex-1 bg-transparent outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground"
              disabled={phase !== 'playing'}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={!input.trim() || phase !== 'playing'}
              className="p-1.5 rounded bg-[#ff0055]/20 text-[#ff0055] hover:bg-[#ff0055]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 glass rounded-lg overflow-hidden z-10"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-mono text-left hover:bg-[#ff0055]/10 text-[#ff0055]/70 hover:text-[#ff0055] transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {suggestion}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Helper text */}
        <div className="mt-3 text-xs font-mono text-muted-foreground">
          按 Enter 注入混沌事件，打断当前叙事流
        </div>
      </motion.div>
    </div>
  );
}
