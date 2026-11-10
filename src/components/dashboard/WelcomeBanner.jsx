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
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h1 className="text-xl sm:text-2xl font-heading font-black text-zinc-950 tracking-tight">
            Ready to level up, <span className="font-serif italic font-normal text-brand-violet-dark">{firstName}</span>?
          </h1>
        </div>
        <p className="text-xs text-zinc-600 mt-1 max-w-xl">
          {todayQuote}
        </p>
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
