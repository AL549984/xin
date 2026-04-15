'use client';

import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import { InitScreen } from '@/components/cyber/init-screen';
import { GameInterface } from '@/components/cyber/game-interface';
import { SummaryScreen } from '@/components/cyber/summary-screen';
import { SoulBackupCard } from '@/components/cyber/soul-backup-card';

export default function CyberLifePage() {
  const { phase } = useGameStore();

  return (
    <AnimatePresence mode="wait">
      {phase === 'init' && <InitScreen key="init" />}
      {(phase === 'playing' || phase === 'chaos') && <GameInterface key="game" />}
      {phase === 'summary' && <SummaryScreen key="summary" />}
      {phase === 'ending' && <SoulBackupCard key="ending" />}
    </AnimatePresence>
  );
}
