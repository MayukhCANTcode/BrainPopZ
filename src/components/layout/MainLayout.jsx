import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';

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
    <div className="min-h-screen bg-midnight text-gray-100 flex">
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
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
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

        {/* Floating Back to Top Button with Frosted Glass Blur */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-2.5 rounded-xl bg-surface/80 backdrop-blur-xl border border-surface-border text-gray-300 hover:text-white hover:bg-surface-elevated hover:border-gray-500 shadow-xl shadow-black/40 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-medium animate-fadeIn"
            aria-label="Scroll to top"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4 text-brand-lime" />
            <span className="hidden sm:inline font-mono text-[11px]">Top</span>
          </button>
        )}
      </div>
    </div>
  );
}
