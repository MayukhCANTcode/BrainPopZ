import React, { useState } from 'react';
import { Bookmark, Play, Clock, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { recentDecks as initialDecks } from '../../data/mockData';

export default function RecentDecks({ onStudyDeck, onViewAll }) {
  const [decks, setDecks] = useState(initialDecks);

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === id ? { ...deck, isBookmarked: !deck.isBookmarked } : deck
      )
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950 tracking-tight">
            Recent Flashcard Decks
          </h2>
          <p className="text-xs text-zinc-500">
            Decks in active review and spaced repetition queue.
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-medium text-brand-violet-dark hover:text-zinc-950 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {decks.map((deck) => {
          return (
            <Card
              key={deck.id}
              hoverEffect
              padding="p-4"
              className="flex flex-col justify-between group border-surface-border bg-surface shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={deck.badgeColor} size="sm">
                    {deck.subject}
                  </Badge>

                  <button
                    onClick={(e) => toggleBookmark(deck.id, e)}
                    className="p-1 rounded text-zinc-400 hover:text-brand-orange transition-colors cursor-pointer"
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
                </div>

                <h3 className="font-medium text-sm text-zinc-950 group-hover:text-brand-violet-dark transition-colors line-clamp-1 mb-2">
                  {deck.title}
                </h3>

                <div className="flex flex-wrap gap-1 mb-3">
                  {deck.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-surface-secondary text-zinc-600 border border-surface-border font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress & Study Button Footer */}
              <div className="pt-2.5 border-t border-surface-border">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-500 text-[11px]">
                    {deck.masteredCards}/{deck.totalCards} cards
                  </span>
                  <span className="font-medium text-[11px] text-zinc-700">
                    {deck.masteryPercentage}%
                  </span>
                </div>

                {/* Thin minimal progress bar */}
                <div className="w-full bg-surface-secondary h-1 rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      deck.masteryPercentage >= 85
                        ? 'bg-emerald-500'
                        : deck.masteryPercentage >= 70
                        ? 'bg-brand-violet-dark'
                        : 'bg-brand-orange'
                    }`}
                    style={{ width: `${deck.masteryPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <Clock className="w-3 h-3" />
                    <span>{deck.lastStudied}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={Play}
                    onClick={() => onStudyDeck && onStudyDeck(deck)}
                  >
                    Study
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
