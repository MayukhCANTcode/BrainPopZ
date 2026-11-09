import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import LoginView from './components/auth/LoginView';
import DashboardView from './components/views/DashboardView';
import AIGeneratorView from './components/views/AIGeneratorView';
import DecksView from './components/views/DecksView';
import QuizzesView from './components/views/QuizzesView';
import AnalyticsView from './components/views/AnalyticsView';
import SettingsView from './components/views/SettingsView';
import AchievementsView from './components/views/AchievementsView';
import StudyModal from './components/dashboard/StudyModal';
import ShortcutsModal from './components/common/ShortcutsModal';
import { recentDecks } from './data/mockData';
import { getCurrentUser, loginWithGoogle, logoutUser } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeStudyDeck, setActiveStudyDeck] = useState(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [activeCustomQuiz, setActiveCustomQuiz] = useState(null);

  // Restore authenticated session from HTTP-only cookie on application mount
  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then((existingUser) => {
        if (isMounted) {
          setUser(existingUser);
          setIsRestoringSession(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsRestoringSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = async (credential) => {
    const authenticatedUser = await loginWithGoogle(credential);
    setUser(authenticatedUser);
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Initialize with localStorage if available (zero fake data for new users)
  const [decksList, setDecksList] = useState(() => {
    try {
      const saved = localStorage.getItem('brainpopz_decks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleLoadDemoDecks = () => {
    setDecksList(recentDecks);
  };

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

  const handleStartGeneratedQuiz = (quizQuestionsOrPayload, title) => {
    if (quizQuestionsOrPayload && !Array.isArray(quizQuestionsOrPayload) && quizQuestionsOrPayload.questions) {
      setActiveCustomQuiz({
        questions: quizQuestionsOrPayload.questions,
        title: quizQuestionsOrPayload.title || 'Custom Gemini AI Quiz',
      });
    } else if (Array.isArray(quizQuestionsOrPayload)) {
      setActiveCustomQuiz({
        questions: quizQuestionsOrPayload,
        title: title || 'Custom Gemini AI Quiz',
      });
    } else {
      setActiveCustomQuiz(null);
    }
    setCurrentTab('quizzes');
  };

  const handleToggleBookmark = (deckId) => {
    setDecksList((prev) =>
      prev.map((d) => (d.id === deckId ? { ...d, isBookmarked: !d.isBookmarked } : d))
    );
  };

  const handleUpdateDeck = (updatedDeck) => {
    setDecksList((prev) =>
      prev.map((d) => (d.id === updatedDeck.id ? updatedDeck : d))
    );
  };

  const handleAddNewDeck = (newDeckOrTopic) => {
    if (typeof newDeckOrTopic === 'string') {
      const createdDeck = {
        id: `deck-${Date.now()}`,
        title: newDeckOrTopic,
        subject: "AI Generated",
        totalCards: 5,
        masteredCards: 0,
        masteryPercentage: 0,
        lastStudied: "Just now",
        badgeColor: "violet",
        tags: ["Gemini 2.5", "Adaptive"],
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
            user={user}
            decks={decksList}
            onNavigate={(tab) => setCurrentTab(tab)}
            onStudyDeck={handleStudyDeck}
            onStartQuiz={handleStartGeneratedQuiz}
            onAddNewDeck={handleAddNewDeck}
            onLoadDemoPack={handleLoadDemoDecks}
            onToggleBookmark={handleToggleBookmark}
          />
        );
      case 'ai-generator':
        return (
          <AIGeneratorView
            onSaveDeck={handleAddNewDeck}
            onStartQuiz={handleStartGeneratedQuiz}
          />
        );
      case 'decks':
        return (
          <DecksView
            onNavigate={(tab) => setCurrentTab(tab)}
            onStudyDeck={handleStudyDeck}
            decks={decksList}
            onToggleBookmark={handleToggleBookmark}
            onUpdateDeck={handleUpdateDeck}
          />
        );
      case 'quizzes':
        return (
          <QuizzesView
            key={activeCustomQuiz?.title || (activeCustomQuiz?.questions ? 'custom' : 'default')}
            initialQuiz={activeCustomQuiz}
          />
        );
      case 'achievements':
        return <AchievementsView onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'analytics':
        return <AnalyticsView decks={decksList} />;
      case 'settings':
        return <SettingsView user={user} />;
      default:
        return (
          <DashboardView
            user={user}
            decks={decksList}
            onNavigate={(tab) => setCurrentTab(tab)}
            onStudyDeck={handleStudyDeck}
            onStartQuiz={handleStartGeneratedQuiz}
            onAddNewDeck={handleAddNewDeck}
            onLoadDemoPack={handleLoadDemoDecks}
            onToggleBookmark={handleToggleBookmark}
          />
        );
    }
  };

  // If not authenticated, render the dedicated BrainPopZ Login screen
  if (!user) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        isRestoringSession={isRestoringSession}
      />
    );
  }

  return (
    <>
      <MainLayout
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onQuickGenerate={() => setCurrentTab('ai-generator')}
        onStudyDeck={handleStudyDeck}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        user={user}
        onLogout={handleLogout}
        decks={decksList}
      >
        {renderActiveView()}
      </MainLayout>

      {/* Interactive Flashcard Study Session Modal */}
      {activeStudyDeck && (
        <StudyModal
          deck={activeStudyDeck}
          onClose={() => setActiveStudyDeck(null)}
          onUpdateDeck={handleUpdateDeck}
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
