import React from 'react';
import { Bookmark, Play, ArrowRight, BookOpen, Sparkles, Plus, BrainCircuit } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

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
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Recent Flashcard Decks</span>
            <span className="text-[10px] font-mono text-gray-400 bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
              {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
            </span>
          </h2>
          <p className="text-xs text-gray-400">
            Decks in active review and spaced repetition queue
          </p>
        </div>

        {hasDecks && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-brand-violet-light hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View all in library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* When Empty: Duolingo-style warm empty state with Demo Pack Loader */}
      {!hasDecks ? (
        <Card padding="p-8" className="border-surface-border text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-elevated text-brand-violet flex items-center justify-center border border-surface-border mb-3 shadow-inner">
            <BookOpen className="w-7 h-7 stroke-[1.8]" />
          </div>

          <h3 className="text-base font-semibold text-white mb-1">
            Your Study Bookshelf is Ready
          </h3>
          <p className="text-xs text-gray-400 max-w-md mb-5 leading-relaxed">
            You don't have any flashcard sets saved yet. Generate an adaptive deck on any topic using Google Gemini AI, or load our starter pack to test right away.
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

                  <h3 className="font-semibold text-xs sm:text-sm text-white group-hover:text-brand-violet-light transition-colors line-clamp-1 mb-2">
                    {deck.title}
                  </h3>

                  {deck.tags && deck.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {deck.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-gray-400 border border-surface-border font-mono"
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
                      <span className="text-gray-400">
                        {mastered} / {cardCount} cards mastered
                      </span>
                      <span className="font-semibold text-gray-300 font-mono">
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
