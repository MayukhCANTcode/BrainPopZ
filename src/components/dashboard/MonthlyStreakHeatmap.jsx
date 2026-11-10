import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flame } from 'lucide-react';
import { getGamificationState, getLocalDateString } from '../../services/gamification';

/**
 * LeetCode-inspired Monthly Streak Heatmap Component.
 * Visualizes daily study consistency, cards reviewed, and streak momentum.
 */
export default function MonthlyStreakHeatmap({ className = '' }) {
  const [gameState, setGameState] = useState(() => getGamificationState());
  const [viewDate, setViewDate] = useState(() => new Date());
  const [hoveredDay, setHoveredDay] = useState(null);

  // Sync with real-time gamification activity updates
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

  const [todayStr] = useState(() => getLocalDateString());
  const [today] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  // Month navigation
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
    setHoveredDay(null);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
    setHoveredDay(null);
  };

  const handleResetToToday = () => {
    setViewDate(new Date());
    setHoveredDay(null);
  };

  // Month labels and grid computation
  const monthName = viewDate.toLocaleString('default', { month: 'short' });

  const { days, activeDaysCount, totalCardsInMonth } = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarCells = [];

    // Leading empty cells for days before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      calendarCells.push({ isPadding: true, key: `pad-lead-${i}` });
    }

    let activeCount = 0;
    let cardSum = 0;

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(dayNum).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const isToday = dateStr === todayStr;
      const isFuture = new Date(year, month, dayNum) > today;

      const record = gameState.dailyActivity?.[dateStr] || { cards: 0, quizzes: 0, xp: 0 };
      
      // If it's today, merge real-time cardsReviewedToday if greater
      let cards = record.cards || 0;
      if (isToday && gameState.cardsReviewedToday > cards) {
        cards = gameState.cardsReviewedToday;
      }
      const quizzes = record.quizzes || 0;
      const xp = record.xp || 0;

      const totalActivity = cards + quizzes;
      if (totalActivity > 0) {
        activeCount++;
        cardSum += cards;
      }

      // LeetCode-style activity tiers
      let level = 0;
      if (totalActivity > 0) {
        if (cards >= 15 || quizzes >= 3) {
          level = 3; // Goal met / High activity
        } else if (cards >= 6 || quizzes >= 1) {
          level = 2; // Moderate activity
        } else {
          level = 1; // Light activity
        }
      }

      calendarCells.push({
        isPadding: false,
        key: dateStr,
        dateStr,
        dayNum,
        cards,
        quizzes,
        xp,
        level,
        isToday,
        isFuture,
      });
    }

    // Trailing empty cells to keep a tidy grid (multiple of 7)
    const remaining = (7 - (calendarCells.length % 7)) % 7;
    for (let i = 0; i < remaining; i++) {
      calendarCells.push({ isPadding: true, key: `pad-trail-${i}` });
    }

    return {
      days: calendarCells,
      activeDaysCount: activeCount,
      totalCardsInMonth: cardSum,
    };
  }, [year, month, gameState, todayStr, today]);

  const weekDayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div
      className={`mt-3 p-3 rounded-xl bg-surface border border-surface-border text-xs relative select-none ${className}`}
    >
      {/* Header: Title, Active Count, & Month Controls */}
      <div className="flex items-center justify-between gap-1 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-zinc-950 truncate text-[11px] tracking-tight">
            {monthName} {year}
          </span>
          {!isCurrentMonth && (
            <button
              onClick={handleResetToToday}
              className="px-1.5 py-0.2 rounded bg-surface-secondary hover:bg-surface text-[9px] text-brand-violet-dark border border-surface-border transition-colors cursor-pointer"
              title="Return to current month"
            >
              Today
            </button>
          )}
        </div>

        {/* Month Navigation Arrows */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded text-zinc-500 hover:text-zinc-950 hover:bg-surface-secondary transition-colors cursor-pointer"
            aria-label="Previous month"
            title="Previous month"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded text-zinc-500 hover:text-zinc-950 hover:bg-surface-secondary transition-colors cursor-pointer"
            aria-label="Next month"
            title="Next month"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-center">
        {weekDayHeaders.map((day, idx) => (
          <span
            key={`header-${idx}`}
            className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Heatmap Grid Cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell) => {
          if (cell.isPadding) {
            return (
              <div
                key={cell.key}
                className="aspect-square rounded-[3px] bg-transparent"
              />
            );
          }

          // Warm Ivory + Emerald Activity Scale
          let cellStyle = 'bg-surface-secondary text-zinc-600 border border-surface-border/60';

          if (cell.level === 1) {
            cellStyle =
              'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold shadow-xs';
          } else if (cell.level === 2) {
            cellStyle =
              'bg-emerald-300 text-emerald-950 border border-emerald-400 font-bold shadow-xs';
          } else if (cell.level === 3) {
            cellStyle =
              'bg-emerald-500 text-white border border-emerald-600 font-black shadow-xs';
          }

          if (cell.isFuture) {
            cellStyle = 'bg-surface-secondary/40 text-zinc-400 border border-surface-border/30 opacity-40';
          }

          const ringStyle = cell.isToday
            ? 'ring-1.5 ring-brand-violet-dark ring-offset-1 ring-offset-surface'
            : '';

          return (
            <div
              key={cell.key}
              onMouseEnter={() => setHoveredDay(cell)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`aspect-square rounded-[3px] flex items-center justify-center text-[9px] transition-all duration-150 relative cursor-pointer group ${cellStyle} ${ringStyle} ${
                !cell.isFuture ? 'hover:scale-110 hover:z-10' : ''
              }`}
            >
              <span>{cell.dayNum}</span>

              {/* Indicator dot on today if 0 cards yet */}
              {cell.isToday && cell.level === 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand-violet-dark animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Hover Tooltip Banner */}
      <div className="mt-2 min-h-[22px] px-2 py-1 rounded-md bg-surface-secondary/80 border border-surface-border flex items-center justify-between text-[10px]">
        {hoveredDay ? (
          <>
            <span className="text-gray-300 font-medium truncate">
              {monthName} {hoveredDay.dayNum}:
            </span>
            <span
              className={`font-mono font-semibold ${
                hoveredDay.cards > 0 ? 'text-brand-lime' : 'text-gray-400'
              }`}
            >
              {hoveredDay.cards > 0
                ? `${hoveredDay.cards} cards${hoveredDay.quizzes > 0 ? ` • ${hoveredDay.quizzes}q` : ''}`
                : 'No activity'}
            </span>
          </>
        ) : (
          <>
            <span className="text-gray-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-brand-orange shrink-0" />
              <span>Active:</span>
              <strong className="text-white font-mono">{activeDaysCount}d</strong>
            </span>
            <span className="text-gray-400">
              Total: <strong className="text-brand-lime font-mono">{totalCardsInMonth}</strong>
            </span>
          </>
        )}
      </div>

      {/* LeetCode Heatmap Legend */}
      <div className="mt-2 pt-2 border-t border-surface-border/50 flex items-center justify-between text-[9px] text-gray-400">
        <span className="tracking-tight">Monthly Streak</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="w-2 h-2 rounded-[2px] bg-[#181A26] border border-surface-border/40" />
          <div className="w-2 h-2 rounded-[2px] bg-brand-lime/25 border border-brand-lime/30" />
          <div className="w-2 h-2 rounded-[2px] bg-brand-lime/60 border border-brand-lime/70" />
          <div className="w-2 h-2 rounded-[2px] bg-brand-lime border border-brand-lime" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
