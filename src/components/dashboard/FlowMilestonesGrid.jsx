import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Flame,
  MessageSquare,
  Video,
  FileText,
  Clock,
  Check,
} from 'lucide-react';
import Card from '../common/Card';
import { getGamificationState, getLevelInfo } from '../../services/gamification';

/**
 * Scaler Flow-style Rewards & Milestone Grid.
 * Faithfully matches the editorial neo-brutalist aesthetic:
 * - 1st Place / Streak featured card with bold solid black drop shadow
 * - 2nd & 3rd Place cards with clean borders and checkmark lists
 * - Horizontal soft lavender highlight banner ("Pitch at the finale" style)
 * - Bottom warm stone tray ("PLUS" benefits)
 */
export default function FlowMilestonesGrid({ decks = [], onStartDrill }) {
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
  const totalCardsInDecks = decks.reduce(
    (sum, d) => sum + (d.cards ? d.cards.length : d.totalCards || 0),
    0
  );
  const totalMastered = Math.max(
    gameState.totalCardsMastered,
    decks.reduce((sum, d) => sum + (d.masteredCards || 0), 0)
  );

  return (
    <div className="space-y-4">
      {/* Editorial Title Section */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-2">
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-zinc-950 tracking-tight">
          Mastery & Recall Milestones
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1 leading-relaxed">
          The real prize is understanding concepts millions of learners struggle with. Along the way, level up your memory rank.
        </p>
      </div>

      {/* 3 Milestone Cards (1st Place Featured + 2nd & 3rd Place) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* 1ST PLACE / ACTIVE STREAK (Neo-brutalist solid black drop shadow) */}
        <Card
          variant="neo"
          padding="p-6"
          className="flex flex-col justify-between transition-transform hover:-translate-y-1 bg-white"
        >
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  1ST TIER · STREAK
                </span>
                <div className="text-3xl sm:text-4xl font-heading font-black text-zinc-950 tracking-tight flex items-center gap-2">
                  <Flame className="w-8 h-8 text-brand-orange fill-brand-orange/20" />
                  <span>{gameState.streak}d</span>
                </div>
              </div>

              {/* Doodle Trophy with stars */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-surface border-2 border-midnight-ink flex items-center justify-center shadow-[2px_2px_0px_#111218]">
                  <Trophy className="w-7 h-7 text-zinc-800" />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-800 py-3 border-t border-surface-border">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-950 shrink-0 stroke-[2.5]" />
                <span>
                  {gameState.streak > 0
                    ? 'Active daily momentum burning strong'
                    : 'Complete 1 drill today to start your streak'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-950 shrink-0 stroke-[2.5]" />
                <span>{gameState.freezes} Streak Freeze protection equipped</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border/60 text-[11px] text-zinc-500">
            Highest total momentum score
          </div>
        </Card>

        {/* 2ND PLACE / CARDS MASTERED */}
        <Card
          padding="p-6"
          className="flex flex-col justify-between transition-transform hover:-translate-y-1 bg-white border border-[#E7E2D6]"
        >
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  2ND TIER · MASTERY
                </span>
                <div className="text-3xl sm:text-4xl font-heading font-black text-zinc-950 tracking-tight">
                  {totalMastered} Cards
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-surface border border-surface-border flex items-center justify-center shrink-0">
                <Medal className="w-7 h-7 text-zinc-700" />
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-800 py-3 border-t border-surface-border">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-950 shrink-0 stroke-[2.5]" />
                <span>SM-2 spaced repetition decay guard active</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-950 shrink-0 stroke-[2.5]" />
                <span>
                  {totalCardsInDecks > 0
                    ? `${totalCardsInDecks} total cards in library`
                    : 'Synthesize your first topic with AI'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border/60 text-[11px] text-zinc-500">
            Second-highest recall retention
          </div>
        </Card>

        {/* 3RD PLACE / EXPERIENCE XP */}
        <Card
          padding="p-6"
          className="flex flex-col justify-between transition-transform hover:-translate-y-1 bg-white border border-[#E7E2D6]"
        >
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                  3RD TIER · LEVEL
                </span>
                <div className="text-3xl sm:text-4xl font-heading font-black text-zinc-950 tracking-tight">
                  {gameState.xp} XP
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-surface border border-surface-border flex items-center justify-center shrink-0">
                <Award className="w-7 h-7 text-zinc-700" />
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-800 py-3 border-t border-surface-border">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-950 shrink-0 stroke-[2.5]" />
                <span>
                  Tier {levelInfo.level} · {levelInfo.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-zinc-950 shrink-0 stroke-[2.5]" />
                <span>{levelInfo.xpRemaining} XP to unlock next rank</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border/60 text-[11px] text-zinc-500">
            Third-highest velocity score
          </div>
        </Card>
      </div>

      {/* Horizontal Soft Lavender Highlight Banner ("Pitch at the finale" style) */}
      <div className="bg-[#EADEFA] border-2 border-midnight-ink rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-neo-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/80 border border-midnight-ink flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-sm sm:text-base text-zinc-950 mr-2">
              Daily Recall Challenge
            </span>
            <span className="text-xs text-purple-900/80">
              Complete 1 practice quiz today to test diagnostic accuracy under pressure
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-zinc-950 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
            <span>+35 XP reward & Streak Shield</span>
          </span>
          <button
            onClick={onStartDrill}
            className="px-4 py-2 rounded-xl bg-midnight-ink text-white font-semibold text-xs hover:bg-black transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            Start Drill →
          </button>
        </div>
      </div>

      {/* Bottom Warm Stone Tray ("PLUS" style) */}
      <div className="bg-[#F2EFE5] border border-surface-border rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-white/90 border border-stone-300 text-stone-700 font-bold text-[10px] tracking-wider uppercase">
            PLUS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface border border-surface-border flex items-center justify-center shrink-0">
              <Video className="w-4 h-4 text-zinc-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-950">YouTube Transcripts</div>
              <p className="text-[11px] text-zinc-600">Auto-convert video lectures into recall decks</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface border border-surface-border flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-zinc-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-950">PDF Lecture Slides</div>
              <p className="text-[11px] text-zinc-600">Upload course slides & extract exam questions</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface border border-surface-border flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-zinc-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-950">Timed Speed Quizzes</div>
              <p className="text-[11px] text-zinc-600">15s countdown with instant scientific rationale</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
