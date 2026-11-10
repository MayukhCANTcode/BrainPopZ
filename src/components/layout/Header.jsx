import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Flame,
  X,
  BookOpen,
  Keyboard,
  Zap,
} from 'lucide-react';
import Button from '../common/Button';
import { notificationsList } from '../../data/mockData';
import { getGamificationState } from '../../services/gamification';

export default function Header({
  user,
  currentTab = 'dashboard',
  onOpenMobile,
  onQuickGenerate,
  onNavigate,
  onStudyDeck,
  onOpenShortcuts,
  decks = [],
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationsList);
  const [gameState, setGameState] = useState(() => getGamificationState());
  const searchInputRef = useRef(null);
  const notifRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

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
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        setIsSearchOpen(false);
        setIsNotifOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? decks.filter(
        (deck) =>
          deck.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deck.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (deck.tags && deck.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : [];

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header
      className={`sticky top-0 z-30 h-14 px-4 lg:px-6 flex items-center justify-between transition-all duration-300 ${
        isScrolled ? 'header-glass-scrolled' : 'header-glass-top'
      }`}
    >
      {/* Left side: Mobile menu toggle + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-surface-secondary border border-surface-border cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Search input (Desktop) */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks, topics, notes..."
            className="w-full bg-surface border border-surface-border text-xs text-zinc-950 placeholder-zinc-400 rounded-md pl-8 pr-10 py-1.5 focus:outline-none focus:border-brand-violet-dark focus:ring-1 focus:ring-brand-violet-lilac transition-colors shadow-xs"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded bg-surface-secondary border border-surface-border text-[10px] text-zinc-500 font-mono select-none">
              <span>⌘K</span>
            </div>
          )}

          {/* Search Dropdown Results */}
          {searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface border border-surface-border rounded-lg shadow-xl p-1.5 z-50 animate-fadeIn">
              <div className="px-2.5 py-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider flex justify-between">
                <span>Matching Decks ({searchResults.length})</span>
                <span className="text-[10px] lowercase text-zinc-400">esc</span>
              </div>
              {searchResults.length > 0 ? (
                <div className="space-y-0.5 mt-1 max-h-60 overflow-y-auto">
                  {searchResults.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => {
                        setSearchQuery('');
                        if (onStudyDeck) onStudyDeck(deck);
                      }}
                      className="w-full text-left p-2 rounded-md hover:bg-surface-secondary flex items-center justify-between group transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-brand-violet-dark" />
                        <div>
                          <p className="text-xs font-medium text-zinc-950 group-hover:text-brand-violet-dark">
                            {deck.title}
                          </p>
                          <span className="text-[10px] text-zinc-500">
                            {deck.subject} • {deck.cards ? deck.cards.length : deck.totalCards || 0} cards
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium">Study</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-zinc-500">
                  No matching flashcard decks found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile search button toggle */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="sm:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-surface-secondary border border-surface-border cursor-pointer"
          aria-label="Toggle Search"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Nav Links (Scaler Flow Style) */}
      <nav className="hidden xl:flex items-center gap-1">
        {[
          { id: 'dashboard', label: 'OVERVIEW' },
          { id: 'quizzes', label: 'PRACTICE DRILLS' },
          { id: 'decks', label: 'MY DECKS' },
          { id: 'analytics', label: 'ANALYTICS' },
          { id: 'achievements', label: 'REWARDS' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate && onNavigate(item.id)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
              currentTab === item.id
                ? 'bg-midnight-ink text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-surface-secondary'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right side: Streak indicator, Notifications, Hotkeys, Quick Action */}
      <div className="flex items-center gap-2">
        {/* Streak quick chip */}
        <button
          onClick={() => onNavigate && onNavigate('achievements')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-xs text-zinc-700 hover:border-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer shadow-xs"
          title="View Active Study Streak"
        >
          <Flame className="w-3.5 h-3.5 text-brand-orange shrink-0 stroke-[1.75]" />
          <span className="font-mono font-medium text-zinc-950">{gameState.streak}d</span>
          <span className="text-[10px] text-zinc-500">streak</span>
        </button>

        {/* XP quick chip */}
        <button
          onClick={() => onNavigate && onNavigate('achievements')}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-xs text-zinc-700 hover:border-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer shadow-xs"
          title="View Total XP Earned"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[1.75]" />
          <span className="font-mono font-medium text-zinc-950">{gameState.xp}</span>
          <span className="text-[10px] text-zinc-500">XP</span>
        </button>

        {/* Keyboard shortcuts trigger */}
        <button
          onClick={onOpenShortcuts}
          className="hidden sm:flex items-center p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-surface-secondary transition-colors cursor-pointer"
          title="Keyboard Shortcuts (?)"
          aria-label="View Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-surface-secondary transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-surface-border rounded-xl shadow-xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border mb-2">
                <span className="text-xs font-semibold text-zinc-950">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-brand-violet-dark hover:underline cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2 rounded-lg border text-xs transition-colors ${
                      n.unread
                        ? 'bg-brand-violet-lilac/30 border-[#C5AFFC]'
                        : 'bg-transparent border-surface-border/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-zinc-950 text-[11px]">{n.title}</span>
                      <span className="text-[9px] text-zinc-400">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA: Scaler Flow Royal Blue Button */}
        <Button
          variant="blue"
          size="sm"
          rightIcon={Sparkles}
          onClick={onQuickGenerate}
          className="rounded-lg shadow-sm font-semibold"
        >
          <span>Generate with AI →</span>
        </Button>

        {/* User Profile Avatar */}
        <button
          onClick={() => onNavigate && onNavigate('settings')}
          className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-brand-violet/40 transition-all cursor-pointer focus:outline-none shrink-0"
          title={user?.name ? `${user.name} (Settings)` : 'Account Settings'}
          aria-label="User Profile and Settings"
        >
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user?.name || 'User Profile'}
              className="w-7 h-7 rounded-full object-cover border border-surface-border bg-surface-elevated"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-violet/20 text-brand-violet-light flex items-center justify-center font-bold text-xs border border-brand-violet/30">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
        </button>
      </div>

      {/* Expandable Mobile Search bar */}
      {isSearchOpen && (
        <div className="sm:hidden absolute top-14 left-0 right-0 bg-midnight border-b border-surface-border p-2.5 z-40 animate-fadeIn">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flashcards, topics..."
              autoFocus
              className="w-full bg-surface border border-surface-border text-xs text-gray-200 placeholder-gray-400 rounded-md pl-8 pr-8 py-1.5 focus:outline-none focus:border-brand-violet"
            />
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
