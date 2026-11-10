import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Zap, Flame, BookOpen } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { getGamificationState, getLevelInfo } from '../../services/gamification';

export default function AnalyticsView({ decks = [] }) {
  const [period, setPeriod] = useState('month'); // week, month, all
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

  const subjectMastery = React.useMemo(() => {
    if (!decks || decks.length === 0) {
      return [];
    }

    const colorPalette = ['bg-brand-lime', 'bg-brand-violet', 'bg-brand-violet-light', 'bg-brand-orange', 'bg-cyan-400'];
    const subjectsMap = {};

    decks.forEach((deck) => {
      const subject = deck.subject || 'General Study';
      if (!subjectsMap[subject]) {
        subjectsMap[subject] = { total: 0, mastered: 0 };
      }
      subjectsMap[subject].total += deck.totalCards || deck.cards?.length || 1;
      subjectsMap[subject].mastered += deck.masteredCards || 0;
    });

    return Object.entries(subjectsMap).map(([name, stats], idx) => ({
      name,
      total: stats.total,
      mastered: stats.mastered,
      percentage: Math.min(100, Math.round((stats.mastered / (stats.total || 1)) * 100)),
      color: colorPalette[idx % colorPalette.length],
    }));
  }, [decks]);

  const totalCardsInLibrary = decks.reduce((sum, d) => sum + (d.cards ? d.cards.length : d.totalCards || 0), 0);
  const totalCardsMasteredInDecks = decks.reduce((sum, d) => sum + (d.masteredCards || 0), 0);
  const overallRetention = totalCardsInLibrary > 0
    ? Math.round((totalCardsMasteredInDecks / totalCardsInLibrary) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header with period toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-xl font-heading font-bold text-zinc-950 tracking-tight">
            Study Analytics
          </h1>
          <p className="text-xs text-zinc-500">
            Real retention rate, recall milestones, and subject mastery based on your active sessions.
          </p>
        </div>

        <div className="flex items-center p-0.5 rounded-lg bg-surface border border-surface-border text-xs shadow-xs">
          <button
            onClick={() => setPeriod('week')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              period === 'week'
                ? 'bg-brand-violet-lilac text-midnight-ink font-semibold'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              period === 'month'
                ? 'bg-brand-violet-lilac text-midnight-ink font-semibold'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              period === 'all'
                ? 'bg-brand-violet-lilac text-midnight-ink font-semibold'
                : 'text-zinc-500 hover:text-zinc-950'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card padding="p-4" className="border-surface-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs">Deck Mastery</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading text-zinc-950">
            {overallRetention}%
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
            {totalCardsMasteredInDecks} of {totalCardsInLibrary} cards
          </p>
        </Card>

        <Card padding="p-4" className="border-surface-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs">Study Streak</span>
            <Flame className="w-3.5 h-3.5 text-brand-orange" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading text-zinc-950">
            {gameState.streak} {gameState.streak === 1 ? 'Day' : 'Days'}
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
            {gameState.freezes} streak freezes saved
          </p>
        </Card>

        <Card padding="p-4" className="border-surface-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs">Total XP</span>
            <Zap className="w-3.5 h-3.5 text-brand-violet-dark" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading text-zinc-950">
            {gameState.xp}
          </div>
          <p className="text-[11px] text-brand-violet-dark mt-0.5 font-medium">
            {levelInfo.xpRemaining} XP to Tier {levelInfo.level + 1}
          </p>
        </Card>

        <Card padding="p-4" className="border-surface-border bg-surface shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs">Academic Level</span>
            <Award className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-heading text-zinc-950">
            Lvl {levelInfo.level}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate font-medium">
            {levelInfo.title}
          </p>
        </Card>
      </div>

      {/* Subject Breakdown Card */}
      <Card padding="p-5" className="border-surface-border bg-surface shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-950">
              Subject Mastery
            </h3>
            <p className="text-[11px] text-gray-400">Recall progress mapped by academic discipline</p>
          </div>
          {subjectMastery.length > 0 && (
            <Badge variant="default" size="sm">
              {subjectMastery.length} {subjectMastery.length === 1 ? 'Subject' : 'Subjects'}
            </Badge>
          )}
        </div>

        {subjectMastery.length > 0 ? (
          <div className="space-y-3.5">
            {subjectMastery.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-medium">{item.name}</span>
                  <span className="font-mono text-gray-400">
                    {item.mastered}/{item.total} cards ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#0A0A0F] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 flex flex-col items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-xs">No study sets created yet.</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Generate decks with Gemini AI to view discipline-specific analytics.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
