import React, { useState } from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';
import Button from '../common/Button';

const motivationalQuotes = [
  'Consistency beats intensity. A 5-minute study session keeps your recall sharp!',
  'Your neurons build stronger connections every time you retrieve a concept.',
  'Spaced repetition is the secret super-power of top learners.',
  'Small daily habits compound into academic mastery.',
];

export default function WelcomeBanner({
  user,
  onGenerateClick,
  onStartPracticeClick,
}) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar';
  const [dayIndex] = useState(() => new Date().getDate());
  const todayQuote = motivationalQuotes[dayIndex % motivationalQuotes.length];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-border">
      <div className="flex items-start sm:items-center gap-3.5">
        <img
          src="/brainpopz-logo.png"
          alt="BrainPopZ Mascot"
          className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-surface-border bg-surface-elevated shadow-md hover:scale-105 transition-transform cursor-pointer"
          title="BrainPopZ Learning Buddy"
        />
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
              Ready to level up, <span className="text-brand-lime font-bold">{firstName}</span>?
            </h1>
            <span className="text-base animate-bounce">⚡</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 max-w-xl leading-relaxed">
            {todayQuote}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          leftIcon={BrainCircuit}
          onClick={onStartPracticeClick}
        >
          Practice Drills
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={Sparkles}
          onClick={onGenerateClick}
        >
          AI Study Studio
        </Button>
      </div>
    </div>
  );
}
