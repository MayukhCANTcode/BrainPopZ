import React from 'react';
import { Bookmark, Play, ArrowRight, Sparkles, Plus, BrainCircuit } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Mascot from '../common/Mascot';

export default function GamifiedRecentDecks({
  decks = [],
  onStudyDeck,
  onStartQuiz,
  onViewAll,
  onToggleBookmark,
  onLoadDemoPack,
  onNavigateToGenerator,
}) {
  const hasDecks = decks && decks.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-heading font-extrabold text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Continue Learning</span>
            {hasDecks && (
              <span className="text-[10px] font-mono text-zinc-600 bg-surface-secondary px-2 py-0.5 rounded-full border border-surface-border">
                {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-600">
            Recently studied decks in your active spaced recall queue
          </p>
        </div>

        {hasDecks && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-brand-violet-dark hover:text-black flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View all in library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* When Empty: Warm Mascot empty state with Starter Pack Loader */}
      {!hasDecks ? (
        <Card padding="p-8 sm:p-10" className="border-surface-border text-center flex flex-col items-center justify-center bg-surface shadow-xs">
          <div className="mb-4">
            <Mascot size="lg" animation="float" />
          </div>

          <h3 className="text-base sm:text-lg font-heading font-extrabold text-zinc-950 mb-1.5">
            Your Study Shelf is Ready!
          </h3>
          <p className="text-xs text-zinc-600 max-w-md mb-5 leading-relaxed">
            You don't have any saved flashcard decks yet. Enter any concept above to generate adaptive cards with Google Gemini AI, or load a curated starter pack.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={Sparkles}
              onClick={onNavigateToGenerator}
            >
              Generate with Gemini AI
            </Button>

            {onLoadDemoPack && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={Plus}
                onClick={onLoadDemoPack}
              >
                Load Starter Pack (3 Decks)
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* Populated Decks Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {decks.slice(0, 6).map((deck) => {
            const mastery = deck.masteryPercentage || 0;
            const cardCount = deck.cards ? deck.cards.length : deck.totalCards || 0;
            const mastered = deck.masteredCards || 0;

            return (
              <Card
                key={deck.id}
                hoverEffect
                padding="p-4"
                className="flex flex-col justify-between group border-surface-border bg-surface transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={deck.badgeColor || 'violet'} size="sm">
                      {deck.subject || 'Active Recall'}
                    </Badge>

                    {onToggleBookmark && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(deck.id);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-brand-orange transition-colors cursor-pointer"
                        title={deck.isBookmarked ? 'Remove bookmark' : 'Bookmark deck'}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            deck.isBookmarked
                              ? 'fill-brand-orange text-brand-orange'
                              : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  <h3 className="font-semibold text-xs sm:text-sm text-zinc-950 group-hover:text-purple-700 transition-colors line-clamp-1 mb-2">
                    {deck.title}
                  </h3>

                  {deck.tags && deck.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {deck.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-surface-secondary text-zinc-600 border border-surface-border font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer with mastery progress and CTAs */}
                <div className="pt-3 border-t border-surface-border space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">
                        {mastered} / {cardCount} cards mastered
                      </span>
                      <span className="font-semibold text-zinc-700 font-mono">
                        {mastery}%
                      </span>
                    </div>

                    <div className="w-full bg-[#0A0A0F] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          mastery >= 80 ? 'bg-brand-lime' : 'bg-brand-violet'
                        }`}
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      leftIcon={Play}
                      onClick={() => onStudyDeck && onStudyDeck(deck)}
                    >
                      Study
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 px-2.5"
                      title="Test via Quiz Drill"
                      onClick={() => {
                        if (onStartQuiz && deck.cards) {
                          // Adapt flashcards to a quick drill if needed
                          onStartQuiz(deck);
                        } else if (onStudyDeck) {
                          onStudyDeck(deck);
                        }
                      }}
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

