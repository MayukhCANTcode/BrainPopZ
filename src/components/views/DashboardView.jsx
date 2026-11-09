import React from 'react';
import WelcomeBanner from '../dashboard/WelcomeBanner';
import StatsOverview from '../dashboard/StatsOverview';
import QuickGenerateCard from '../dashboard/QuickGenerateCard';
import RecentDecks from '../dashboard/RecentDecks';
import UpcomingReviews from '../dashboard/UpcomingReviews';

export default function DashboardView({ onNavigate, onStudyDeck, onStartQuiz, onAddNewDeck }) {
  return (
    <div className="space-y-6">
      <WelcomeBanner
        onGenerateClick={() => onNavigate('ai-generator')}
        onStartPracticeClick={() => onNavigate('quizzes')}
      />

      <StatsOverview />

      <QuickGenerateCard
        onTriggerGeneration={(topic) => {
          if (onAddNewDeck) {
            onAddNewDeck(topic);
          }
        }}
        onStudyDeck={onStudyDeck}
      />

      <RecentDecks
        onStudyDeck={onStudyDeck}
        onViewAll={() => onNavigate('decks')}
      />

      <UpcomingReviews onStartQuiz={onStartQuiz} />
    </div>
  );
}
