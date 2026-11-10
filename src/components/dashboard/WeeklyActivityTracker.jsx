import React, { useState, useEffect } from 'react';
import { Calendar, Zap, Flame } from 'lucide-react';
import Card from '../common/Card';
import { getGamificationState, getWeeklyActivityView } from '../../services/gamification';

export default function WeeklyActivityTracker({ onStartQuiz }) {
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

  const days = getWeeklyActivityView(gameState.dailyActivity || {});
  const totalWeeklyCards = days.reduce((sum, d) => sum + (d.cards || 0), 0);
  const totalWeeklyXp = days.reduce((sum, d) => sum + (d.xp || 0), 0);
  const daysActive = days.filter((d) => d.cards > 0 || d.quizzes > 0).length;

  const maxCardsInAWeek = Math.max(20, ...days.map((d) => d.cards || 0));

  return (
    <Card padding="p-5" className="border-surface-border">
      {/* Header and Weekly Totals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-violet/15 text-brand-violet flex items-center justify-center border border-brand-violet/30">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Weekly Activity & Heatmap
              </h3>
              <p className="text-[11px] text-gray-400">
                Active recall review volume over the past 7 days
              </p>
            </div>
          </div>
        </div>

        {/* Quick summary chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-surface-border flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 text-[11px]">Active Days:</span>
            <span className="font-mono font-semibold text-white">{daysActive} / 7</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-surface-border flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 text-[11px]">Cards:</span>
            <span className="font-mono font-semibold text-brand-lime">+{totalWeeklyCards}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-surface-border flex items-center gap-1.5 text-xs">
            <Zap className="w-3 h-3 text-brand-lime fill-brand-lime" />
            <span className="font-mono font-semibold text-white">+{totalWeeklyXp} XP</span>
          </div>
        </div>
      </div>

      {/* 7-Day Visual Bars & Pillars */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 py-2">
        {days.map((day) => {
          const heightPercent =
            day.cards > 0 ? Math.min(100, Math.round((day.cards / maxCardsInAWeek) * 100)) : 0;
          const hasActivity = day.cards > 0 || day.quizzes > 0;

          return (
            <div
              key={day.date}
              className={`flex flex-col items-center justify-between rounded-xl p-2 sm:p-2.5 transition-all border ${
                day.isToday
                  ? 'bg-surface-elevated border-brand-violet/50 shadow-md ring-1 ring-brand-violet/40'
                  : 'bg-midnight/40 border-surface-border hover:border-gray-700'
              }`}
            >
              {/* Day label */}
              <div className="flex flex-col items-center mb-2">
                <span
                  className={`text-[11px] font-semibold ${
                    day.isToday ? 'text-brand-violet-light' : 'text-gray-400'
                  }`}
                >
                  {day.dayName}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {day.dayNumber}
                </span>
              </div>

              {/* Bar Column */}
              <div className="w-full flex flex-col items-center justify-end h-24 my-1">
                <div className="w-full max-w-[28px] bg-surface rounded-lg h-full flex items-end p-0.5 overflow-hidden border border-surface-border/50">
                  {hasActivity ? (
                    <div
                      className={`w-full rounded transition-all duration-500 ${
                        day.isToday
                          ? 'bg-brand-violet'
                          : 'bg-brand-lime'
                      }`}
                      style={{ height: `${Math.max(16, heightPercent)}%` }}
                    />
                  ) : (
                    <div className="w-full h-1 bg-surface-border/40 rounded-full" />
                  )}
                </div>
              </div>

              {/* Activity indicator tag */}
              <div className="mt-1 flex flex-col items-center text-center">
                <span
                  className={`text-[10px] font-mono font-medium ${
                    day.cards > 0 ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {day.cards} cards
                </span>

                {day.isToday && (
                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-brand-violet/20 text-brand-violet-light border border-brand-violet/30 mt-0.5 uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Zero activity guidance or encouragement footer */}
      {totalWeeklyCards === 0 && (
        <div className="mt-4 p-3 rounded-xl bg-midnight/70 border border-surface-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-brand-orange shrink-0" />
            <p className="text-xs text-gray-300">
              Your study streak starts today! Complete your first flashcard review or practice drill to light up your calendar.
            </p>
          </div>
          {onStartQuiz && (
            <button
              onClick={onStartQuiz}
              className="text-xs text-brand-lime font-medium hover:underline shrink-0 cursor-pointer"
            >
              Start Drill →
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
