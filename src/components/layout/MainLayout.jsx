import React, { useState, useEffect } from 'react';
import { ArrowUp, Flame, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { getGamificationState } from '../../services/gamification';

export default function MainLayout({
  children,
  currentTab = 'dashboard',
  onSelectTab,
  onQuickGenerate,
  onStudyDeck,
  onOpenShortcuts,
  user,
  onLogout,
  decks = [],
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [gameState, setGameState] = useState(() => getGamificationState());

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) {
        setGameState(e.detail);
      } else {
        setGameState(getGamificationState());
      }
    };

    window.addEventListener('brainpopz_gamification_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('brainpopz_gamification_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-midnight bg-dot-grid-subtle text-zinc-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        user={user}
        onLogout={onLogout}
        decksCount={decks.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 pb-20 sm:pb-16">
        {/* Top Header */}
        <Header
          user={user}
          onOpenMobile={() => setIsMobileOpen(true)}
          onQuickGenerate={onQuickGenerate}
          onNavigate={onSelectTab}
          onStudyDeck={onStudyDeck}
          onOpenShortcuts={onOpenShortcuts}
          decks={decks}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        {/* Floating Scaler Flow-Style Status Pill Dock */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto bg-midnight-ink text-white border border-zinc-700/60 rounded-full pl-4 pr-2 py-1.5 flex items-center gap-3 shadow-dock backdrop-blur-md animate-fadeIn">
            {/* Dot Matrix Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500 tracking-widest text-[9px]">••••••</span>
              <span className="text-zinc-400 font-sans text-[11px] uppercase tracking-wider font-semibold hidden sm:inline">Active Streak</span>
              <span className="flex items-center gap-1 text-brand-orange font-bold text-xs">
                <Flame className="w-3.5 h-3.5 fill-brand-orange/30" />
                <span>{gameState.streak}d</span>
              </span>
            </div>

            {/* Scaler Flow-Style Lavender CTA Button */}
            <button
              onClick={onQuickGenerate}
              className="px-3 py-1 rounded-full bg-brand-violet-lilac hover:bg-brand-violet-lilacHover text-midnight-ink font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Create new active recall deck with Gemini AI"
            >
              <Sparkles className="w-3 h-3 text-purple-700" />
              <span>Generate now</span>
              <span className="text-sm leading-none font-bold">→</span>
            </button>
          </div>
        </div>

        {/* Floating Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-2.5 rounded-xl bg-white/90 backdrop-blur-xl border border-surface-border text-zinc-700 hover:text-zinc-950 hover:bg-surface-secondary shadow-lg transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-medium animate-fadeIn"
            aria-label="Scroll to top"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4 text-brand-orange" />
            <span className="hidden sm:inline font-mono text-[11px]">Top</span>
          </button>
        )}
      </div>
    </div>
  );
}
