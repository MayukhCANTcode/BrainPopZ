import React, { useState } from 'react';
import { Search, Plus, Bookmark, Play, BookOpen, RotateCcw, Eye } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import DeckDetailModal from '../dashboard/DeckDetailModal';

export default function DecksView({ onNavigate, onStudyDeck, decks = [], onToggleBookmark, onUpdateDeck }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [inspectingDeck, setInspectingDeck] = useState(null);

  const subjects = ['All', 'Biology & Medicine', 'Computer Science', 'Chemistry', 'Artificial Intelligence'];

  const filteredDecks = decks.filter((deck) => {
    const matchesSearch =
      deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deck.tags && deck.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesSubject = selectedSubject === 'All' || deck.subject === selectedSubject;
    const matchesBookmark = !onlyBookmarked || deck.isBookmarked;

    return matchesSearch && matchesSubject && matchesBookmark;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('All');
    setOnlyBookmarked(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-xl font-heading font-extrabold text-zinc-950 tracking-tight">
            Flashcard Decks
          </h1>
          <p className="text-xs text-zinc-600">
            {decks.length} total decks in your study library. Click any deck to view and manage cards.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={Plus}
          onClick={() => onNavigate('ai-generator')}
        >
          New Deck
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter decks by title, topic, or tag..."
            className="w-full bg-surface border border-surface-border text-xs text-zinc-900 placeholder-zinc-400 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-violet/60"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 cursor-pointer ${
              onlyBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-surface border-surface-border text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Bookmark className={`w-3 h-3 ${onlyBookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
            <span>Bookmarked</span>
          </button>

          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-midnight-ink text-white border-midnight-ink font-semibold shadow-xs'
                  : 'bg-surface border-surface-border text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Decks Grid or Empty State */}
      {filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredDecks.map((deck) => (
            <Card
              key={deck.id}
              hoverEffect
              padding="p-4"
              onClick={() => setInspectingDeck(deck)}
              className="flex flex-col justify-between border-surface-border group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={deck.badgeColor || 'default'} size="sm">
                    {deck.subject}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleBookmark) onToggleBookmark(deck.id);
                    }}
                    className="p-1 rounded hover:bg-surface-elevated transition-colors cursor-pointer"
                    title={deck.isBookmarked ? 'Remove bookmark' : 'Bookmark deck'}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        deck.isBookmarked
                          ? 'fill-brand-orange text-brand-orange'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    />
                  </button>
                </div>

                <h3 className="font-medium text-sm text-white group-hover:text-brand-violet-light transition-colors mb-1.5 line-clamp-1">
                  {deck.title}
                </h3>

                <div className="flex flex-wrap gap-1 mb-3">
                  {deck.tags &&
                    deck.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-surface-elevated text-gray-400 border border-surface-border font-mono"
                      >
                        {t}
                      </span>
                    ))}
                </div>
              </div>

              <div className="pt-2.5 border-t border-surface-border">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span className="text-[11px]">
                    {deck.cards?.length || deck.totalCards} cards
                  </span>
                  <span className="text-[11px] font-mono text-gray-300">
                    {deck.masteryPercentage}%
                  </span>
                </div>
                <div className="w-full bg-surface-secondary h-1 rounded-full overflow-hidden mb-2.5">
                  <div
                    className="bg-brand-lime h-full rounded-full"
                    style={{ width: `${deck.masteryPercentage}%` }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    leftIcon={Eye}
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingDeck(deck);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    rightIcon={Play}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onStudyDeck) onStudyDeck(deck);
                    }}
                  >
                    Study
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card padding="p-8" className="text-center border-surface-border">
          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-semibold text-white mb-1">
            No Decks Found
          </h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto mb-3">
            No flashcard decks match your search or filter.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={RotateCcw}
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={() => onNavigate('ai-generator')}
            >
              Create Deck
            </Button>
          </div>
        </Card>
      )}

      {/* Deck Inspection and Card Management Modal */}
      {inspectingDeck && (
        <DeckDetailModal
          deck={inspectingDeck}
          isOpen={!!inspectingDeck}
          onClose={() => setInspectingDeck(null)}
          onStartStudy={onStudyDeck}
          onUpdateDeck={(updated) => {
            if (onUpdateDeck) onUpdateDeck(updated);
            setInspectingDeck(updated);
          }}
        />
      )}
    </div>
  );
}
