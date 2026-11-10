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
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-900 flex items-center justify-center border border-purple-200">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight font-heading">
                Weekly Activity & Heatmap
              </h3>
              <p className="text-[11px] text-zinc-600">
                Active recall review volume over the past 7 days
              </p>
            </div>
          </div>
        </div>

        {/* Quick summary chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-2.5 py-1 rounded-lg bg-surface-secondary border border-surface-border flex items-center gap-1.5 text-xs shadow-xs">
            <span className="text-zinc-600 text-[11px]">Active Days:</span>
            <span className="font-mono font-bold text-zinc-900">{daysActive} / 7</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-surface-secondary border border-surface-border flex items-center gap-1.5 text-xs shadow-xs">
            <span className="text-zinc-600 text-[11px]">Cards:</span>
            <span className="font-mono font-bold text-emerald-800">+{totalWeeklyCards}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-surface-secondary border border-surface-border flex items-center gap-1.5 text-xs shadow-xs">
            <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
            <span className="font-mono font-bold text-zinc-900">+{totalWeeklyXp} XP</span>
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
                  ? 'bg-purple-50/70 border-purple-300 shadow-sm ring-1 ring-purple-200'
                  : 'bg-surface-secondary/60 border-surface-border hover:border-zinc-400'
              }`}
            >
              {/* Day label */}
              <div className="flex flex-col items-center mb-2">
                <span
                  className={`text-[11px] font-semibold ${
                    day.isToday ? 'text-purple-900' : 'text-zinc-600'
                  }`}
                >
                  {day.dayName}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {day.dayNumber}
                </span>
              </div>

              {/* Bar Column */}
              <div className="w-full flex flex-col items-center justify-end h-24 my-1">
                <div className="w-full max-w-[28px] bg-surface rounded-lg h-full flex items-end p-0.5 overflow-hidden border border-surface-border">
                  {hasActivity ? (
                    <div
                      className={`w-full rounded transition-all duration-500 ${
                        day.isToday
                          ? 'bg-purple-600'
                          : 'bg-emerald-600'
                      }`}
                      style={{ height: `${Math.max(16, heightPercent)}%` }}
                    />
                  ) : (
                    <div className="w-full h-1 bg-surface-border rounded-full" />
                  )}
                </div>
              </div>

              {/* Activity indicator tag */}
              <div className="mt-1 flex flex-col items-center text-center">
                <span
                  className={`text-[10px] font-mono font-medium ${
                    day.cards > 0 ? 'text-zinc-900' : 'text-zinc-400'
                  }`}
                >
                  {day.cards} cards
                </span>

                {day.isToday && (
                  <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-200 mt-0.5 uppercase tracking-wider">
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
        <div className="mt-4 p-3 rounded-xl bg-surface-secondary border border-surface-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-zinc-700">
              Your study streak starts today! Complete your first flashcard review or practice drill to light up your calendar.
            </p>
          </div>
          {onStartQuiz && (
            <button
              onClick={onStartQuiz}
              className="text-xs text-purple-800 font-semibold hover:underline shrink-0 cursor-pointer"
            >
              Start Drill →
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
