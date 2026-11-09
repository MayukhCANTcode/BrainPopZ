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
      desc: 'Generate 1 study set with Gemini AI',
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
      className="border-surface-border bg-gradient-to-br from-surface via-surface to-surface-elevated/40 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-lime/15 text-brand-lime flex items-center justify-center border border-brand-lime/30">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>Daily Quests</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-elevated text-brand-lime font-mono font-medium border border-surface-border">
                  {completedCount}/{quests.length}
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">Complete quests daily to boost your XP level</p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-gray-400 bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
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
                    ? 'bg-brand-lime/5 border-brand-lime/25'
                    : 'bg-midnight/50 border-surface-border hover:border-gray-700'
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
                          q.isDone ? 'text-gray-300 line-through' : 'text-white'
                        }`}
                      >
                        {q.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-brand-lime shrink-0">
                        +{q.xp} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{q.desc}</p>
                  </div>
                </div>

                {/* Status or Action */}
                <div className="shrink-0">
                  {q.isDone ? (
                    <div className="flex items-center gap-1 text-xs text-brand-lime font-medium px-2 py-1 rounded bg-brand-lime/10 border border-brand-lime/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Done</span>
                    </div>
                  ) : (
                    <button
                      onClick={q.action}
                      className="px-2.5 py-1 rounded-md bg-surface-elevated hover:bg-surface-active text-white border border-surface-border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{q.actionText}</span>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
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

