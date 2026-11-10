import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, ChevronRight, Sparkles, Brain, Layers } from 'lucide-react';
import Card from '../common/Card';
import { getGamificationState } from '../../services/gamification';

export default function DailyQuestCard({ onNavigate, onStartStudy }) {
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

  const quests = [
    {
      id: 'quest-gen',
      title: 'Synthesize Topic',
      desc: 'Generate 1 study set with AI',
      icon: Sparkles,
      iconColor: 'text-brand-violet-light',
      bgIcon: 'bg-brand-violet/15 border-brand-violet/30',
      xp: 25,
      isDone: gameState.totalCardsMastered > 0 || gameState.xp >= 20,
      actionText: 'Generate',
      action: () => onNavigate && onNavigate('ai-generator'),
    },
    {
      id: 'quest-cards',
      title: 'Recall Mastery',
      desc: 'Review 10 flashcards in study mode',
      icon: Layers,
      iconColor: 'text-brand-lime',
      bgIcon: 'bg-brand-lime/15 border-brand-lime/30',
      xp: 20,
      progress: Math.min(10, gameState.cardsReviewedToday),
      maxProgress: 10,
      isDone: gameState.cardsReviewedToday >= 10,
      actionText: 'Study',
      action: () => {
        if (onStartStudy) onStartStudy();
        else if (onNavigate) onNavigate('decks');
      },
    },
    {
      id: 'quest-quiz',
      title: 'Quiz Sharpshooter',
      desc: 'Complete 1 multiple-choice practice drill',
      icon: Brain,
      iconColor: 'text-brand-orange',
      bgIcon: 'bg-brand-orange/15 border-brand-orange/30',
      xp: 35,
      isDone: gameState.totalQuizzesTaken > 0,
      actionText: 'Drill',
      action: () => onNavigate && onNavigate('quizzes'),
    },
  ];

  const completedCount = quests.filter((q) => q.isDone).length;

  return (
    <Card
      padding="p-5"
      className="border-surface-border bg-surface flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center border border-emerald-500/30">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-950 tracking-tight flex items-center gap-1.5">
                <span>Daily Quests</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-secondary text-emerald-700 font-mono font-medium border border-surface-border">
                  {completedCount}/{quests.length}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500">Complete quests daily to boost your XP level</p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-zinc-500 bg-surface-secondary px-2 py-0.5 rounded border border-surface-border">
            Resets Midnight
          </span>
        </div>

        {/* Quests List */}
        <div className="space-y-2 mt-2">
          {quests.map((q) => {
            const Icon = q.icon;

            return (
              <div
                key={q.id}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  q.isDone
                    ? 'bg-emerald-500/5 border-emerald-500/25'
                    : 'bg-surface-secondary/60 border-surface-border hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${q.bgIcon}`}
                  >
                    <Icon className={`w-4 h-4 ${q.iconColor}`} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold truncate ${
                          q.isDone ? 'text-zinc-400 line-through' : 'text-zinc-950'
                        }`}
                      >
                        {q.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 shrink-0">
                        +{q.xp} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate">{q.desc}</p>
                  </div>
                </div>

                {/* Status or Action */}
                <div className="shrink-0">
                  {q.isDone ? (
                    <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Done</span>
                    </div>
                  ) : (
                    <button
                      onClick={q.action}
                      className="px-2.5 py-1 rounded-md bg-surface hover:bg-surface-secondary text-zinc-900 border border-surface-border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>{q.actionText}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-500" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

