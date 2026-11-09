import React from 'react';
import WelcomeBanner from '../dashboard/WelcomeBanner';
import HeroGenerator from '../dashboard/HeroGenerator';
import GamifiedStreakCard from '../dashboard/GamifiedStreakCard';
import DailyQuestCard from '../dashboard/DailyQuestCard';
import WeeklyActivityTracker from '../dashboard/WeeklyActivityTracker';
import GamifiedRecentDecks from '../dashboard/GamifiedRecentDecks';

export default function DashboardView({
  user,
  decks = [],
  onNavigate,
  onStudyDeck,
  onStartQuiz,
  onAddNewDeck,
  onLoadDemoPack,
  onToggleBookmark,
}) {
  return (
    <div className="space-y-6">
      {/* 1. Motivational Greeting Banner */}
      <WelcomeBanner
        user={user}
        onGenerateClick={() => onNavigate('ai-generator')}
        onStartPracticeClick={() => onNavigate('quizzes')}
      />

      {/* 2. Primary Prominence: Hero AI Study Generator */}
      <HeroGenerator
        onDeckGenerated={(deck) => {
          if (onAddNewDeck) onAddNewDeck(deck);
        }}
        onStudyGeneratedDeck={(deck) => {
          if (onStudyDeck) onStudyDeck(deck);
        }}
        onStartGeneratedQuiz={(questions, title) => {
          if (onStartQuiz) onStartQuiz({ questions, title });
        }}
      />

      {/* 3. Gamification Core Row: Duolingo-style Streaks & Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GamifiedStreakCard onOpenQuests={() => onNavigate('achievements')} />
        <DailyQuestCard
          onNavigate={onNavigate}
          onStartStudy={() => {
            if (decks.length > 0 && onStudyDeck) {
              onStudyDeck(decks[0]);
            } else {
              onNavigate('ai-generator');
            }
          }}
        />
      </div>

      {/* 4. Weekly Activity & Heatmap (Real 7-day study records) */}
      <WeeklyActivityTracker onStartQuiz={() => onNavigate('quizzes')} />

      {/* 5. Recent Study Sets (Real user decks with zero fake data and demo loader) */}
      <GamifiedRecentDecks
        decks={decks}
        onStudyDeck={onStudyDeck}
        onStartQuiz={(deck) => {
          if (deck.cards && onStartQuiz) {
            onStartQuiz({
              title: `${deck.title} (Recall Drill)`,
              questions: deck.cards.map((c, i) => ({
                id: `q-${i}`,
                question: c.q || c.question,
                options: [
                  c.a || c.answer,
                  'Opposing mechanism producing negative regulatory feedback.',
                  'Secondary metabolic pathway without direct signaling influence.',
                  'Incompatible hypothesis disproven by empirical observation.',
                ].sort(() => Math.random() - 0.5),
                correctAnswer: 0,
                explanation: c.a || c.answer,
              })),
            });
          }
        }}
        onViewAll={() => onNavigate('decks')}
        onToggleBookmark={onToggleBookmark}
        onLoadDemoPack={onLoadDemoPack}
        onNavigateToGenerator={() => onNavigate('ai-generator')}
      />
    </div>
  );
}
