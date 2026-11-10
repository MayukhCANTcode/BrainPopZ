import React, { useState, useEffect } from 'react';
import { Layers, Flame, Target, Zap } from 'lucide-react';
import Card from '../common/Card';
import { getGamificationState } from '../../services/gamification';

/**
 * Real-time Metric Overview Cards for BrainPopZ.
 * Displays authentic user statistics without fabricated data.
 */
export default function StatsOverview() {
  const [gameState, setGameState] = useState(() => getGamificationState());

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) {
        setGameState(e.detail);
      } else {
        setGameState(getGamificationState());
      }
    };

    window.addEventListener('brainpopz_gamification_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('brainpopz_gamification_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const stats = [
    {
      id: 'mastered',
      label: 'Cards Mastered',
      value: gameState.totalCardsMastered,
      caption: gameState.totalCardsMastered > 0 ? 'Verified recall mastery' : 'Start your first deck',
      icon: Layers,
      color: 'text-brand-lime',
      badgeBg: 'bg-brand-lime/10 border-brand-lime/25 text-brand-lime',
    },
    {
      id: 'streak',
      label: 'Daily Streak',
      value: gameState.streak > 0 ? `${gameState.streak}d` : '0d',
      caption: gameState.streak > 0 ? 'Momentum burning!' : 'Study today to start',
      icon: Flame,
      color: 'text-brand-orange',
      badgeBg: 'bg-brand-orange/10 border-brand-orange/25 text-brand-orange',
    },
    {
      id: 'accuracy',
      label: 'Quiz Accuracy',
      value:
        gameState.totalQuizzesTaken > 0
          ? `${Math.round((gameState.totalCorrectAnswers / (gameState.totalQuizzesTaken * 5)) * 100)}%`
          : '—',
      caption:
        gameState.totalQuizzesTaken > 0
          ? `Across ${gameState.totalQuizzesTaken} drills`
          : 'No drills completed yet',
      icon: Target,
      color: 'text-brand-violet-light',
      badgeBg: 'bg-brand-violet/10 border-brand-violet/25 text-brand-violet-light',
    },
    {
      id: 'xp',
      label: 'Total Experience',
      value: `${gameState.xp} XP`,
      caption: 'Knowledge compounding',
      icon: Zap,
      color: 'text-brand-lime',
      badgeBg: 'bg-brand-lime/10 border-brand-lime/25 text-brand-lime',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.id} padding="p-4" hoverEffect className="border-surface-border bg-surface shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold text-zinc-700">
                {stat.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${stat.badgeBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-black font-heading text-zinc-950 tracking-tight">
              {stat.value}
            </div>

            <div className="mt-1 text-[11px] text-zinc-500">
              {stat.caption}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
