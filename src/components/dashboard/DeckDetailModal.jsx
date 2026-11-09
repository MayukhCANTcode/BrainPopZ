import React, { useState } from 'react';
import { X, Play, Plus, Trash2, Search, Download, BookOpen, Check } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function DeckDetailModal({ deck, isOpen, onClose, onStartStudy, onUpdateDeck }) {
  const [searchCard, setSearchCard] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('Medium');
  const [copiedExport, setCopiedExport] = useState(false);

  if (!isOpen || !deck) return null;

  const cards = deck.cards || [];
  const filteredCards = cards.filter(
    (c) =>
      c.q.toLowerCase().includes(searchCard.toLowerCase()) ||
      c.a.toLowerCase().includes(searchCard.toLowerCase())
  );

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const updatedCards = [
      ...cards,
      {
        q: newQuestion.trim(),
        a: newAnswer.trim(),
        difficulty: newDifficulty,
      },
    ];

    if (onUpdateDeck) {
      onUpdateDeck({
        ...deck,
        cards: updatedCards,
        totalCards: updatedCards.length,
      });
    }

    setNewQuestion('');
    setNewAnswer('');
    setIsAddingCard(false);
  };

  const handleDeleteCard = (cardIndex) => {
    const updatedCards = cards.filter((_, idx) => idx !== cardIndex);
    if (onUpdateDeck) {
      onUpdateDeck({
        ...deck,
        cards: updatedCards,
        totalCards: updatedCards.length,
      });
    }
  };

  const handleExportMarkdown = () => {
    let md = `# ${deck.title}\nSubject: ${deck.subject}\nTotal Cards: ${cards.length}\n\n---\n\n`;
    cards.forEach((c, idx) => {
      md += `### Card ${idx + 1} (${c.difficulty || 'Medium'})\n**Q:** ${c.q}\n\n**A:** ${c.a}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cards.md`;
    link.click();
    URL.revokeObjectURL(url);

    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-surface border border-surface-border rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={deck.badgeColor || 'default'} size="sm">
                {deck.subject}
              </Badge>
              <span className="text-xs text-gray-400 font-mono">
                {cards.length} cards
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              {deck.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportMarkdown}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
              title="Export as Markdown"
            >
              {copiedExport ? (
                <Check className="w-4 h-4 text-brand-lime" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action & Search Bar */}
        <div className="p-3 sm:px-5 border-b border-surface-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-surface-elevated/40">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchCard}
              onChange={(e) => setSearchCard(e.target.value)}
              placeholder="Search cards in this deck..."
              className="w-full bg-surface border border-surface-border text-xs text-white placeholder-gray-400 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-brand-violet/60"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              leftIcon={Plus}
              onClick={() => setIsAddingCard(!isAddingCard)}
            >
              {isAddingCard ? 'Cancel' : 'Add Card'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Play}
              onClick={() => {
                onClose();
                onStartStudy(deck);
              }}
            >
              Study Now
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {/* Add New Card Form Drawer */}
          {isAddingCard && (
            <form
              onSubmit={handleAddCardSubmit}
              className="p-3.5 rounded-lg bg-surface-elevated border border-surface-border space-y-2.5 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Create New Card</span>
                <div className="flex items-center gap-1 text-[11px]">
                  {['Foundational', 'Medium', 'Hard'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewDifficulty(lvl)}
                      className={`px-2 py-0.5 rounded border text-[10px] transition-colors cursor-pointer ${
                        newDifficulty === lvl
                          ? 'bg-brand-violet/20 border-brand-violet text-brand-violet-light font-medium'
                          : 'border-surface-border text-gray-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Front: Question or concept..."
                className="w-full bg-surface border border-surface-border rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-violet/60"
                autoFocus
              />

              <textarea
                rows={2}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Back: Answer or explanation..."
                className="w-full bg-surface border border-surface-border rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-violet/60"
              />

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingCard(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newQuestion.trim() || !newAnswer.trim()}
                >
                  Save Card
                </Button>
              </div>
            </form>
          )}

          {/* Cards List */}
          {filteredCards.length > 0 ? (
            filteredCards.map((card, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-surface-elevated/60 border border-surface-border/80 group hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-medium text-gray-400">
                      #{idx + 1}
                    </span>
                    <Badge variant="default" size="sm">
                      {card.difficulty || 'Medium'}
                    </Badge>
                  </div>

                  <button
                    onClick={() => handleDeleteCard(idx)}
                    className="p-1 rounded text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-0.5">
                      Question
                    </span>
                    <p className="font-medium text-white leading-relaxed">{card.q}</p>
                  </div>
                  <div className="pt-1.5 border-t border-surface-border/50">
                    <span className="text-[10px] uppercase font-semibold text-brand-lime block mb-0.5">
                      Answer
                    </span>
                    <p className="text-gray-300 leading-relaxed">{card.a}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-gray-400">
              <BookOpen className="w-6 h-6 text-gray-500 mx-auto mb-2 opacity-50" />
              <p>No cards match your search "{searchCard}".</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-5 border-t border-surface-border flex items-center justify-between text-xs text-gray-400 bg-surface">
          <span>
            {cards.length} cards in deck • {deck.masteryPercentage || 0}% mastered
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

