import React, { useState, useEffect } from 'react';
import { Zap, Flame, CheckCircle2, Lock } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import {
  getGamificationState,
  getLevelInfo,
  ACHIEVEMENTS_LIST,
} from '../../services/gamification';

export default function AchievementsView() {
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
  const unlockedIds = gameState.unlockedAchievements || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-xl font-heading font-bold text-white tracking-tight flex items-center gap-2">
            <span>Achievements & Badges</span>
            <Badge variant="lime" size="sm">
              {unlockedIds.length} / {ACHIEVEMENTS_LIST.length} Unlocked
            </Badge>
          </h1>
          <p className="text-xs text-gray-400">
            Earn experience points, maintain study streaks, and unlock prestigious academic milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/30 text-xs font-semibold text-brand-orange">
            <Flame className="w-4 h-4 fill-brand-orange" />
            <span>{gameState.streak}d Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-lime/10 border border-brand-lime/30 text-xs font-semibold text-brand-lime">
            <Zap className="w-4 h-4 fill-brand-lime" />
            <span>{gameState.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Level Summary Banner */}
      <Card padding="p-6" className="relative overflow-hidden border-surface-border bg-gradient-to-r from-surface via-surface to-brand-violet/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-violet-light flex items-center justify-center text-midnight font-heading font-black text-2xl shadow-lg shadow-brand-violet/20 border border-white/20">
              {levelInfo.level}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-brand-violet-light uppercase tracking-wider">
                  Current Rank
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Tier {levelInfo.level} of 8
                </span>
              </div>
              <h2 className="text-xl font-heading font-bold text-white tracking-tight">
                {levelInfo.title}
              </h2>
              <p className="text-xs text-gray-400">
                Total XP accumulated: <span className="text-white font-mono font-semibold">{gameState.xp} XP</span>
              </p>
            </div>
          </div>

          {/* XP Progress Bar to next level */}
          <div className="w-full md:max-w-xs space-y-2">
            <div className="flex justify-between text-xs text-gray-300">
              <span className="font-medium">Progress to Tier {levelInfo.level + 1}</span>
              <span className="font-mono font-semibold text-brand-lime">{levelInfo.percentage}%</span>
            </div>

            <div className="w-full bg-midnight h-2.5 rounded-full overflow-hidden border border-surface-border p-0.5">
              <div
                className="bg-gradient-to-r from-brand-violet to-brand-lime h-full rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.percentage}%` }}
              />
            </div>

            <p className="text-[11px] text-gray-400 text-right">
              {levelInfo.xpRemaining > 0
                ? `${levelInfo.xpRemaining} XP required for next rank`
                : 'Maximum rank achieved!'}
            </p>
          </div>
        </div>
      </Card>

      {/* Badges Grid */}
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Milestone Badges
          </h3>
          <p className="text-xs text-gray-400">
            Complete active recall drills and maintain your habit to unlock each milestone
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS_LIST.map((badge) => {
            const isUnlocked = unlockedIds.includes(badge.id);

            return (
              <Card
                key={badge.id}
                padding="p-4"
                className={`relative overflow-hidden border transition-all ${
                  isUnlocked
                    ? 'border-brand-lime/30 bg-gradient-to-b from-surface to-brand-lime/5 shadow-md'
                    : 'border-surface-border bg-surface/50 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border transition-transform ${
                      isUnlocked
                        ? 'bg-surface-elevated border-brand-lime/40 shadow-inner scale-105'
                        : 'bg-midnight/70 border-surface-border grayscale opacity-60'
                    }`}
                  >
                    <span>{badge.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-xs sm:text-sm text-white truncate">
                        {badge.name}
                      </h4>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] text-brand-lime font-medium px-1.5 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/25 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-gray-500 font-mono px-1.5 py-0.5 rounded bg-surface-elevated border border-surface-border shrink-0">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed mb-2">
                      {badge.description}
                    </p>

                    {/* Requirement tag */}
                    <div className="text-[10px] font-mono text-gray-500">
                      {badge.reqXp && `Requires ${badge.reqXp} XP`}
                      {badge.reqStreak && `Requires ${badge.reqStreak}-day streak`}
                      {badge.reqCards && `Requires ${badge.reqCards} cards mastered`}
                      {badge.special === 'perfect_quiz' && 'Requires 100% quiz score'}
                      {badge.special === 'has_freeze' && 'Included with streak protection'}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
