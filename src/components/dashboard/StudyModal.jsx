import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, RotateCw, ChevronRight, ChevronLeft, RotateCcw, Award } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Confetti from '../common/Confetti';
import { recordCompletedActivity } from '../../services/gamification';
import { playCardFlipSound, playCelebrationSound } from '../../services/soundEffects';

export default function StudyModal({ deck, onClose, onUpdateDeck }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cardRatings, setCardRatings] = useState({});

  // Use deck's specific cards or default high-yield cards
  const cards = deck?.cards && deck.cards.length > 0
    ? deck.cards
    : [
        {
          q: `What is the core principle underlying ${deck?.title || 'this topic'}?`,
          a: "A foundational concept requiring both structural understanding and mechanistic application to synthesize exam-level answers.",
          difficulty: "Medium"
        },
        {
          q: "How does this concept apply in complex real-world or theoretical scenarios?",
          a: "It acts as a primary constraint that coordinates sub-components into a unified, high-reliability architecture.",
          difficulty: "Hard"
        }
      ];

  const currentCard = cards[currentIndex] || cards[0];

  const toggleFlip = useCallback(() => {
    playCardFlipSound();
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback((rating = 'good') => {
    setIsFlipped(false);
    setCardRatings((prev) => ({ ...prev, [currentIndex]: rating }));
    setCurrentIndex((prev) => {
      if (prev + 1 < cards.length) {
        return prev + 1;
      } else {
        setIsCompleted(true);
        return prev;
      }
    });
  }, [cards.length, currentIndex]);

  const activityRecordedRef = useRef(false);

  // Persist updated mastery and study timestamp to deck on completion
  useEffect(() => {
    if (isCompleted && onUpdateDeck && deck && !activityRecordedRef.current) {
      activityRecordedRef.current = true;
      const goodOrEasyCount = Object.values(cardRatings).filter(
        (r) => r === 'good' || r === 'easy'
      ).length;
      const effectiveMastered = Math.max(deck.masteredCards || 0, goodOrEasyCount);
      const newPercentage = Math.round((effectiveMastered / (cards.length || 1)) * 100);
      onUpdateDeck({
        ...deck,
        lastStudied: 'Just now',
        masteredCards: effectiveMastered,
        masteryPercentage: Math.min(100, newPercentage),
      });

      // Record study activity in gamification engine!
      recordCompletedActivity({
        type: 'flashcards',
        cardsReviewed: cards.length,
      });

      playCelebrationSound();
    }
  }, [isCompleted, onUpdateDeck, deck, cardRatings, cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const handleRestart = () => {
    activityRecordedRef.current = false;
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  // Keyboard navigation support: Space, ArrowRight, ArrowLeft, Escape, 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (isCompleted) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (isFlipped) {
        if (e.key === '1') handleNext('hard');
        if (e.key === '2') handleNext('good');
        if (e.key === '3') handleNext('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isCompleted, isFlipped, onClose, toggleFlip]);

  if (!deck) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative flex flex-col justify-between min-h-[480px] max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Badge variant="default" size="sm">
              {deck.subject}
            </Badge>
            <span className="text-xs text-gray-400">
              {!isCompleted ? `Card ${currentIndex + 1} of ${cards.length}` : 'Completed'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
            aria-label="Close Study Session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Normal Study State */}
        {!isCompleted ? (
          <>
            {/* 3D Flippable Card Area */}
            <div className="perspective-1000 my-4 flex-1 min-h-[280px] sm:min-h-[320px]">
              <div
                onClick={toggleFlip}
                className={`w-full h-full relative preserve-3d transition-transform duration-300 cursor-pointer rounded-2xl select-none ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front Face: Question */}
                <div className="absolute inset-0 backface-hidden p-5 sm:p-6 rounded-2xl bg-surface-elevated border border-surface-border hover:border-gray-600 flex flex-col justify-between items-center text-center overflow-hidden shadow-inner">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-violet-light px-2.5 py-0.5 rounded-full bg-brand-violet/10 border border-brand-violet/25">
                      Question
                    </span>
                    {currentCard.difficulty && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        • {currentCard.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Scrollable / Flexible Question Area */}
                  <div className="flex-1 w-full my-auto py-3 overflow-y-auto flex items-center justify-center">
                    <p className="text-sm sm:text-base font-medium text-white max-w-md leading-relaxed break-words px-2">
                      {currentCard.question || currentCard.q}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400 shrink-0">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Space or click to flip</span>
                  </div>
                </div>

                {/* Back Face: Answer */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 p-5 sm:p-6 rounded-2xl bg-surface-elevated border border-brand-lime/30 flex flex-col justify-between items-center text-center overflow-hidden shadow-inner">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-lime px-2.5 py-0.5 rounded-full bg-brand-lime/10 border border-brand-lime/25">
                      Answer
                    </span>
                  </div>

                  {/* Scrollable / Flexible Answer Area */}
                  <div className="flex-1 w-full my-auto py-3 overflow-y-auto flex items-center justify-center">
                    <p className="text-sm sm:text-base font-medium text-gray-100 max-w-md leading-relaxed break-words px-2">
                      {currentCard.answer || currentCard.a}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-lime shrink-0">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Space or click to view question</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom controls */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={ChevronLeft}
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                Prev
              </Button>

              {/* Recall rating buttons shown when flipped */}
              {isFlipped ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleNext('hard')}
                    className="px-2.5 py-1 rounded-md bg-brand-orange/10 text-brand-orange border border-brand-orange/20 text-xs font-medium hover:bg-brand-orange/20 transition-colors cursor-pointer"
                    title="Press 1"
                  >
                    1 • Hard
                  </button>
                  <button
                    onClick={() => handleNext('good')}
                    className="px-2.5 py-1 rounded-md bg-brand-violet/10 text-brand-violet-light border border-brand-violet/20 text-xs font-medium hover:bg-brand-violet/20 transition-colors cursor-pointer"
                    title="Press 2"
                  >
                    2 • Good
                  </button>
                  <button
                    onClick={() => handleNext('easy')}
                    className="px-2.5 py-1 rounded-md bg-brand-lime/10 text-brand-lime border border-brand-lime/20 text-xs font-medium hover:bg-brand-lime/20 transition-colors cursor-pointer"
                    title="Press 3"
                  >
                    3 • Easy
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  Flip card to rate recall
                </span>
              )}

              <Button
                variant="primary"
                size="sm"
                rightIcon={ChevronRight}
                onClick={() => handleNext('good')}
              >
                {currentIndex + 1 === cards.length ? 'Finish' : 'Next'}
              </Button>
            </div>
          </>
        ) : (
          /* Completion State */
          <div className="py-6 flex flex-col items-center justify-center text-center flex-1 space-y-3 animate-fadeIn relative">
            <Confetti trigger={isCompleted} count={60} />
            <div className="w-12 h-12 rounded-xl bg-surface-elevated text-brand-lime flex items-center justify-center border border-surface-border">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">
                Study Session Complete
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 max-w-xs">
                You reviewed all {cards.length} cards in "{deck.title}".
              </p>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-center">
                <span className="text-[10px] text-gray-400 block">Reviewed</span>
                <span className="text-sm font-semibold text-brand-lime">+{cards.length} cards</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-center">
                <span className="text-[10px] text-gray-400 block">Streak</span>
                <span className="text-sm font-semibold text-brand-orange">+25 XP</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={RotateCcw}
                onClick={handleRestart}
              >
                Study Again
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
