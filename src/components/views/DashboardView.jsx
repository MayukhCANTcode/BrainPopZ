import React from 'react';
import HeroGenerator from '../dashboard/HeroGenerator';
import WeeklyActivityTracker from '../dashboard/WeeklyActivityTracker';
import GamifiedRecentDecks from '../dashboard/GamifiedRecentDecks';
import GamifiedStreakCard from '../dashboard/GamifiedStreakCard';
import DailyQuestCard from '../dashboard/DailyQuestCard';
import RecommendedPractice from '../dashboard/RecommendedPractice';

export default function DashboardView({
  user: _user,
  decks = [],
  onNavigate,
  onStudyDeck,
  onStartQuiz,
  onAddNewDeck,
  onLoadDemoPack,
  onToggleBookmark,
}) {
  return (
    <div className="space-y-8">
      {/* 1. Primary Prominence: Hero AI Study Studio ("Turn your notes into knowledge") */}
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

      {/* 2. Weekly Activity — 7-day real activity visualization */}
      <WeeklyActivityTracker onStartQuiz={() => onNavigate('quizzes')} />

      {/* 3. Continue Learning — Recently studied decks or welcoming empty shelf */}
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

      {/* 4. Today's Goal & Daily Quests */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-heading font-bold text-white tracking-tight">
            Today's Target & Quests
          </h2>
          <p className="text-xs text-gray-400">
            Keep your active streak alive and level up your memory rank
          </p>
        </div>
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
      </div>

      {/* 5. Recommended Practice — Curated high-yield topics & quizzes */}
      <RecommendedPractice
        onStartQuiz={onStartQuiz}
        onSelectTopic={(_topicPrompt) => {
          onNavigate('ai-generator');
        }}
      />
    </div>
  );
}
