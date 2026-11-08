import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import DashboardView from './components/views/DashboardView';
import AIGeneratorView from './components/views/AIGeneratorView';
import DecksView from './components/views/DecksView';
import QuizzesView from './components/views/QuizzesView';
import AnalyticsView from './components/views/AnalyticsView';
import SettingsView from './components/views/SettingsView';
import StudyModal from './components/dashboard/StudyModal';
import ShortcutsModal from './components/common/ShortcutsModal';
import { recentDecks } from './data/mockData';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeStudyDeck, setActiveStudyDeck] = useState(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Initialize with localStorage if available
  const [decksList, setDecksList] = useState(() => {
    try {
      const saved = localStorage.getItem('brainpopz_decks');
      return saved ? JSON.parse(saved) : recentDecks;
    } catch {
      return recentDecks;
    }
  });

  // Sync decksList to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('brainpopz_decks', JSON.stringify(decksList));
    } catch (e) {
      console.warn('Unable to persist decks to localStorage', e);
    }
  }, [decksList]);

  // Global hotkey '?' to open shortcuts modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStudyDeck = (deck) => {
    setActiveStudyDeck(deck);
  };

  const handleStartQuiz = () => {
    setCurrentTab('quizzes');
  };

  const handleToggleBookmark = (deckId) => {
    setDecksList((prev) =>
      prev.map((d) => (d.id === deckId ? { ...d, isBookmarked: !d.isBookmarked } : d))
    );
  };

  const handleAddNewDeck = (newDeckOrTopic) => {
    if (typeof newDeckOrTopic === 'string') {
      const createdDeck = {
        id: `deck-${Date.now()}`,
        title: newDeckOrTopic,
        subject: "General Studies",
        totalCards: 15,
        masteredCards: 0,
        masteryPercentage: 0,
        lastStudied: "Just now",
        badgeColor: "violet",
        tags: ["AI Generated", "New"],
        isBookmarked: false,
        cards: [
          {
            q: `What is the core premise of ${newDeckOrTopic}?`,
            a: `Key conceptual definition and essential principles for understanding ${newDeckOrTopic}.`,
            difficulty: "Medium"
          },
          {
            q: `How is ${newDeckOrTopic} tested in practical examinations?`,
            a: `Through problem solving, edge case analysis, and mechanistic proofs.`,
            difficulty: "Hard"
          }
        ]
      };
      setDecksList((prev) => [createdDeck, ...prev]);
    } else {
      setDecksList((prev) => [newDeckOrTopic, ...prev]);
    }
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(tab) => setCurrentTab(tab)}
            onStudyDeck={handleStudyDeck}
            onStartQuiz={handleStartQuiz}
            onAddNewDeck={handleAddNewDeck}
          />
        );
      case 'ai-generator':
        return <AIGeneratorView onSaveDeck={handleAddNewDeck} />;
      case 'decks':
        return (
          <DecksView
            onNavigate={(tab) => setCurrentTab(tab)}
            onStudyDeck={handleStudyDeck}
            decks={decksList}
            onToggleBookmark={handleToggleBookmark}
          />
        );
      case 'quizzes':
        return <QuizzesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onNavigate={(tab) => setCurrentTab(tab)}
            onStudyDeck={handleStudyDeck}
            onStartQuiz={handleStartQuiz}
            onAddNewDeck={handleAddNewDeck}
          />
        );
    }
  };

  return (
    <>
      <MainLayout
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onQuickGenerate={() => setCurrentTab('ai-generator')}
        onStudyDeck={handleStudyDeck}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      >
        {renderActiveView()}
      </MainLayout>

      {/* Interactive Flashcard Study Session Modal */}
      {activeStudyDeck && (
        <StudyModal
          deck={activeStudyDeck}
          onClose={() => setActiveStudyDeck(null)}
        />
      )}

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
}

export default App;
