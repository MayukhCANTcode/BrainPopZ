import React, { useState, useEffect } from 'react';
import { Flame, Shield, Zap, Sparkles } from 'lucide-react';
import Card from '../common/Card';
import Mascot from '../common/Mascot';
import { getGamificationState, getLevelInfo } from '../../services/gamification';

export default function GamifiedStreakCard({ onOpenQuests }) {
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

  const levelInfo = getLevelInfo(gameState.xp);
  const dailyProgressPercent = Math.min(
    100,
    Math.round((gameState.cardsReviewedToday / (gameState.dailyGoalTarget || 20)) * 100)
  );

  const hasStreak = gameState.streak > 0;

  return (
    <Card
      padding="p-5"
      className="relative overflow-hidden border-surface-border bg-surface flex flex-col justify-between"
    >
      <div>
        {/* Header: Flame streak & Freeze Shield pill */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 relative ${
                hasStreak
                  ? 'bg-brand-orange/15 border-brand-orange/40 shadow-sm ring-1 ring-brand-orange/30'
                  : 'bg-surface-elevated border-surface-border text-gray-500'
              }`}
            >
              <Flame
                className={`w-6 h-6 transition-transform duration-300 ${
                  hasStreak
                    ? 'text-brand-orange fill-brand-orange animate-flame scale-110'
                    : 'text-gray-500'
                }`}
              />
              {hasStreak && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-orange" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-heading font-black text-white tracking-tight">
                  {gameState.streak}
                </span>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  {gameState.streak === 1 ? 'Day Streak' : 'Days Streak'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {hasStreak
                  ? 'The flame is burning! Keep learning today.'
                  : 'Start your streak today with a quick drill!'}
              </p>
            </div>
          </div>

          {/* Streak Freeze Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-medium cursor-help"
            title="Streak Freezes automatically protect your streak if you miss a day."
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-mono font-semibold">{gameState.freezes}</span>
            <span className="hidden sm:inline text-[11px]">Freezes</span>
          </div>
        </div>

        {/* Level & XP Progression */}
        <div className="p-3 rounded-xl bg-midnight/60 border border-surface-border mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-brand-violet/20 text-brand-violet-light font-bold text-[10px] uppercase tracking-wide border border-brand-violet/30">
                Lvl {levelInfo.level}
              </span>
              <span className="text-white font-semibold text-xs tracking-tight">
                {levelInfo.title}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <Zap className="w-3.5 h-3.5 text-brand-lime fill-brand-lime" />
              <span className="text-white font-mono font-bold">{gameState.xp}</span>
              <span className="text-gray-400 text-[11px]">/ {levelInfo.maxXp} XP</span>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="w-full bg-surface h-2 rounded-full overflow-hidden p-0.5 border border-surface-border">
            <div
              className="bg-brand-violet h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${levelInfo.percentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1.5">
            <span>{levelInfo.percentage}% to Level {levelInfo.level + 1}</span>
            <span>{levelInfo.xpRemaining} XP to unlock next tier</span>
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300 font-medium flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
              <span>Today's Study Goal</span>
            </span>
            <span className="font-mono text-xs text-white font-semibold">
              {gameState.cardsReviewedToday} / {gameState.dailyGoalTarget || 20} cards
            </span>
          </div>

          <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-surface-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dailyProgressPercent >= 100
                  ? 'bg-brand-lime shadow-lg shadow-brand-lime/20'
                  : 'bg-brand-orange'
              }`}
              style={{ width: `${dailyProgressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
            <div className="flex items-center gap-1.5">
              {dailyProgressPercent >= 100 ? (
                <>
                  <Mascot size="xs" animation="bounce" />
                  <span className="text-brand-lime font-semibold">🎉 Daily goal crushed! Streak protected.</span>
                </>
              ) : (
                <span>
                  🔥 {(gameState.dailyGoalTarget || 20) - gameState.cardsReviewedToday} more cards to hit today's target
                </span>
              )}
            </div>
            {onOpenQuests && (
              <button
                onClick={onOpenQuests}
                className="text-brand-violet-light hover:text-white transition-colors cursor-pointer text-[11px] font-semibold shrink-0"
              >
                View Quests →
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

