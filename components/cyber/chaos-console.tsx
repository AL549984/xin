'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';

const GLITCH_CHARS = '01ABCDEF#$@&*<>[]/\\+-_';

interface GlitchTextProps {
  text: string;
}

function GlitchText({ text }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const glitchIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => () => {
    if (glitchIntervalRef.current !== null) {
      window.clearInterval(glitchIntervalRef.current);
    }
  }, []);

  const applyGlitch = () => {
    const characters = text.split('');
    const glitchRatio = 0.3 + Math.random() * 0.2;
    const replaceCount = Math.max(1, Math.floor(characters.length * glitchRatio));
    const indices = new Set<number>();

    while (indices.size < replaceCount) {
      indices.add(Math.floor(Math.random() * characters.length));
    }

    const nextCharacters = characters.map((character, index) => {
      if (!indices.has(index)) return character;
      if (character === ' ') return character;
      return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    });

    setDisplayText(nextCharacters.join(''));
  };

  const handleMouseEnter = () => {
    setIsGlitching(true);
    applyGlitch();

    if (glitchIntervalRef.current !== null) {
      window.clearInterval(glitchIntervalRef.current);
    }

    glitchIntervalRef.current = window.setInterval(() => {
      applyGlitch();
    }, 50);
  };

  const handleMouseLeave = () => {
    if (glitchIntervalRef.current !== null) {
      window.clearInterval(glitchIntervalRef.current);
      glitchIntervalRef.current = null;
    }

    setIsGlitching(false);
    setDisplayText(text);
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={[
        'block transition-all duration-75',
        isGlitching ? 'animate-pulse text-white brightness-150' : 'text-[#67e8f9]/75',
      ].join(' ')}
    >
      {displayText}
    </span>
  );
}

export function ChaosConsole() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [logLines, setLogLines] = useState<string[]>([
    '[SYSTEM] Neural link handshake established.',
    '[SYNC] Background telemetry stream online.',
    '[BUFFER] Awaiting next intervention payload.',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const logViewportRef = useRef<HTMLDivElement>(null);
  const { triggerChaos, phase } = useGameStore();

  const chaosCommands = [
    '金融崩溃',
    '记忆入侵',
    '身份泄露',
    '系统崩溃',
    '病毒感染',
  ];

  const logTemplates = [
    '[SYSTEM] Data packet received from neural relay.',
    '[SYNC] Memory shard indexed for background replication.',
    '[TRACE] Ghost signal rerouted through sector firewall.',
    '[CACHE] Predictive intent model refreshed successfully.',
    '[MONITOR] Synaptic jitter normalized within safe threshold.',
    '[ROUTE] Quantum uplink locked on fallback channel.',
    '[KERNEL] Shadow process acknowledged operator heartbeat.',
    '[ARCHIVE] Mnemonic fragments committed to cold storage.',
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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const nextLine = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      setLogLines((current) => {
        const nextLogs = [...current, nextLine];
        return nextLogs.slice(-24);
      });
    }, 2400);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const viewport = logViewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [logLines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && phase === 'playing') {
      setLogLines((current) => {
        const nextLogs = [...current, `[COMMAND] Intervention injected: ${input.trim()}`];
        return nextLogs.slice(-24);
      });
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
    <div className="relative h-full min-h-0 flex-1">
      {/* Console container */}
      <motion.div
        className="glass h-full min-h-0 overflow-hidden rounded-xl border border-[#00f2ff]/20 p-4 flex flex-col"
        whileHover={{ borderColor: 'rgba(0, 242, 255, 0.4)' }}
      >
        {/* Header */}
        <div className="mb-3 flex items-center gap-2 text-xs font-mono text-[#00f2ff]/50 flex-shrink-0">
          <Terminal className="w-3 h-3" />
          <span>CHAOS_INTERVENTION_CONSOLE</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>READY</span>
          </span>
        </div>

        <div
          ref={logViewportRef}
          className="min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-color:rgba(34,211,238,0.7)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-500/70 [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <div className="rounded-lg border border-[#00f2ff]/10 bg-background/30 p-3 font-mono">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-[#00f2ff]/45">
              <span>Neural Link Log</span>
              <span>Live Stream</span>
            </div>
            <div className="space-y-2 text-[11px] leading-relaxed text-muted-foreground">
              {logLines.map((line, index) => (
                <div
                  key={`${line}-${index}`}
                  className="border-l border-[#00f2ff]/15 pl-2 text-wrap break-words"
                >
                  <GlitchText text={line} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto flex-shrink-0 pt-3">
          {/* Input form */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2 rounded-lg border border-[#00f2ff]/10 bg-background/50 px-3 py-2 transition-colors focus-within:border-[#00f2ff]/40">
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
                className="rounded bg-[#ff0055]/20 p-1.5 text-[#ff0055] transition-colors hover:bg-[#ff0055]/30 disabled:opacity-30 disabled:cursor-not-allowed"
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
                  className="absolute bottom-full left-0 right-0 z-10 mb-2 overflow-hidden rounded-lg glass"
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      type="button"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-mono text-[#ff0055]/70 transition-colors hover:bg-[#ff0055]/10 hover:text-[#ff0055]"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {suggestion}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
