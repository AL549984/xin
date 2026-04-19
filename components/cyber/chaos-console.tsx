'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const GLITCH_CHARS = '01ABCDEF#$@&*<>[]/\\+-_';
const MAX_LOG_LINES = 10;

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
  const [logLines, setLogLines] = useState<string[]>([
    '[SYSTEM] Neural link handshake established.',
    '[SYNC] Background telemetry stream online.',
    '[BUFFER] Awaiting next intervention payload.',
  ]);
  const logViewportRef = useRef<HTMLDivElement>(null);

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
    const intervalId = window.setInterval(() => {
      const nextLine = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      setLogLines((current) => {
        const nextLogs = [...current, nextLine];
        return nextLogs.slice(-MAX_LOG_LINES);
      });
    }, 2400);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const viewport = logViewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [logLines]);

  return (
    <div className="relative h-[600px] max-h-[calc(100dvh-8.5rem)] min-h-[22rem] overflow-hidden">
      {/* Console container */}
      <motion.div
        className="glass h-full overflow-hidden rounded-xl border border-[#00f2ff]/20 p-4 flex flex-col"
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
      </motion.div>
    </div>
  );
}
