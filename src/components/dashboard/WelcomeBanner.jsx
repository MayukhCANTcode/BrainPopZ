import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import Button from '../common/Button';
import { currentUser } from '../../data/mockData';

export default function WelcomeBanner({ onGenerateClick, onStartPracticeClick }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
          Welcome back, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
          Transform your notes into flashcards and maintain spaced repetition mastery.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={Play}
          onClick={onStartPracticeClick}
        >
          Daily Quiz
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={Sparkles}
          onClick={onGenerateClick}
        >
          Generate Deck
        </Button>
      </div>
    </div>
  );
}
