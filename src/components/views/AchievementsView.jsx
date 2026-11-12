import React, { useState, useEffect } from 'react';
import {
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  Trophy,
  Target,
  BookOpen,
  Shield,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import {
  getGamificationState,
  getLevelInfo,
  ACHIEVEMENTS_LIST,
  ALL_LEVELS,
} from '../../services/gamification';

const renderBadgeIcon = (id) => {
  switch (id) {
    case 'first_spark':
      return <Zap className="w-6 h-6 text-zinc-900 dark:text-zinc-100 stroke-[1.75]" />;
    case 'streak_3':
      return <Flame className="w-6 h-6 text-zinc-900 dark:text-zinc-100 stroke-[1.75]" />;
    case 'streak_7':
      return <Trophy className="w-6 h-6 text-zinc-900 dark:text-zinc-100 stroke-[1.75]" />;
    case 'quiz_ace':
      return <Target className="w-6 h-6 text-zinc-900 dark:text-zinc-100 stroke-[1.75]" />;
    case 'century_club':
      return <BookOpen className="w-6 h-6 text-zinc-900 dark:text-zinc-100 stroke-[1.75]" />;
    case 'freeze_shield':
      return <Shield className="w-6 h-6 text-zinc-900 dark:text-zinc-100 stroke-[1.75]" />;
    default:
      return <Trophy className="w-6 h-6 text-zinc-900 dark:text-zinc-100 stroke-[1.75]" />;
  }
};

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
          <h1 className="text-xl font-heading font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Achievements & Badges</span>
            <Badge variant="lime" size="sm">
              {unlockedIds.length} / {ACHIEVEMENTS_LIST.length} Unlocked
            </Badge>
          </h1>
          <p className="text-xs text-zinc-500">
            Earn experience points, maintain study streaks, and unlock prestigious academic milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/30 text-xs font-semibold text-brand-orange">
            <Flame className="w-4 h-4 fill-brand-orange" />
            <span>{gameState.streak}d Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>{gameState.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Level Summary Banner */}
      <Card variant="neo" padding="p-6 sm:p-7" className="relative overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EADEFA] text-midnight-ink flex items-center justify-center font-heading font-black text-2xl border-2 border-midnight-ink shadow-neo-sm">
              {levelInfo.level}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Current Rank
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Tier {levelInfo.level} of 8
                </span>
              </div>
              <h2 className="text-xl font-heading font-bold text-zinc-950 tracking-tight">
                {levelInfo.title}
              </h2>
              <p className="text-xs text-zinc-500">
                Total XP accumulated: <span className="text-zinc-950 font-mono font-semibold">{gameState.xp} XP</span>
              </p>
            </div>
          </div>

          {/* XP Progress Bar to next level */}
          <div className="w-full md:max-w-xs space-y-2">
            <div className="flex justify-between text-xs text-zinc-700">
              <span className="font-medium">Progress to Tier {levelInfo.level + 1}</span>
              <span className="font-mono font-semibold text-emerald-700">{levelInfo.percentage}%</span>
            </div>

            <div className="w-full bg-surface-secondary h-2.5 rounded-full overflow-hidden border border-surface-border p-0.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.percentage}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-500 text-right">
              {levelInfo.xpRemaining > 0
                ? `${levelInfo.xpRemaining} XP required for next rank`
                : 'Maximum rank achieved!'}
            </p>
          </div>
        </div>
      </Card>

      {/* Academic Rank Ladder (All 8 Tiers) */}
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Academic Rank Ladder</span>
            <Badge variant="blue" size="sm">
              Tier {levelInfo.level} of 8
            </Badge>
          </h3>
          <p className="text-xs text-zinc-500">
            Earn study XP to advance your rank and unlock automatic streak freeze protections
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ALL_LEVELS.map((lvl) => {
            const isCompleted = gameState.xp >= lvl.maxXp;
            const isCurrent = gameState.xp >= lvl.minXp && (gameState.xp < lvl.maxXp || lvl.level === 8);
            const xpNeeded = Math.max(0, lvl.minXp - gameState.xp);

            return (
              <Card
                key={lvl.level}
                padding="p-3.5"
                className={`relative flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-2 border-midnight-ink bg-white shadow-neo-sm ring-2 ring-blue-500/20'
                    : isCompleted
                    ? 'border border-surface-border bg-surface shadow-xs opacity-90'
                    : 'border border-surface-border bg-surface-secondary/40 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-surface-secondary text-zinc-600 border border-surface-border'
                      }`}
                    >
                      Tier {lvl.level}
                    </span>

                    {isCurrent ? (
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        Current
                      </span>
                    ) : isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                        <Lock className="w-3 h-3" />
                        <span>{xpNeeded} XP left</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-bold text-xs sm:text-sm text-zinc-950 truncate mb-1">
                    {lvl.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-mono mb-2">
                    {lvl.level === 8 ? `${lvl.minXp}+ XP` : `${lvl.minXp} – ${lvl.maxXp} XP`}
                  </p>
                </div>

                <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500">Reward</span>
                  <span className="font-semibold text-zinc-900">{lvl.reward}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">
            Milestone Badges
          </h3>
          <p className="text-xs text-zinc-500">
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
                className={`relative overflow-hidden transition-all ${
                  isUnlocked
                    ? 'border-2 border-midnight-ink bg-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px]'
                    : 'border border-surface-border bg-surface-secondary/40 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-transform ${
                      isUnlocked
                        ? 'bg-amber-50 dark:bg-zinc-800 border-midnight-ink shadow-[1px_1px_0px_#111218] scale-105'
                        : 'bg-surface-secondary border-surface-border opacity-50'
                    }`}
                  >
                    {renderBadgeIcon(badge.id)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-xs sm:text-sm text-zinc-950 truncate">
                        {badge.name}
                      </h4>
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-800 font-medium px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono px-1.5 py-0.5 rounded bg-surface border border-surface-border shrink-0">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed mb-2">
                      {badge.description}
                    </p>

                    {/* Requirement tag */}
                    <div className="text-[10px] font-mono text-zinc-500">
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
