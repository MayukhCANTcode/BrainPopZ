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
} from 'lucide-react';
import Button from '../common/Button';
import { currentUser, notificationsList, recentDecks } from '../../data/mockData';

export default function Header({
  onOpenMobile,
  onQuickGenerate,
  onNavigate,
  onStudyDeck,
  onOpenShortcuts,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationsList);
  const searchInputRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

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
    ? recentDecks.filter(
        (deck) =>
          deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deck.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deck.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-midnight/90 backdrop-blur-md border-b border-surface-border px-4 lg:px-6 flex items-center justify-between">
      {/* Left side: Mobile menu toggle + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-surface-elevated border border-surface-border cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Search input (Desktop) */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks, topics, notes..."
            className="w-full bg-surface border border-surface-border text-xs text-gray-200 placeholder-gray-400 rounded-md pl-8 pr-10 py-1.5 focus:outline-none focus:border-brand-violet/60 focus:ring-1 focus:ring-brand-violet/50 transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1 py-0.5 rounded bg-surface-elevated border border-surface-border text-[10px] text-gray-400 font-mono select-none">
              <span>⌘K</span>
            </div>
          )}

          {/* Search Dropdown Results */}
          {searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface border border-surface-border rounded-lg shadow-xl p-1.5 z-50 animate-fadeIn">
              <div className="px-2.5 py-1 text-[10px] font-medium text-gray-400 uppercase tracking-wider flex justify-between">
                <span>Matching Decks ({searchResults.length})</span>
                <span className="text-[10px] lowercase text-gray-400">esc</span>
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
                      className="w-full text-left p-2 rounded-md hover:bg-surface-elevated flex items-center justify-between group transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-brand-violet" />
                        <div>
                          <p className="text-xs font-medium text-white group-hover:text-brand-violet-light">
                            {deck.title}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {deck.subject} • {deck.totalCards} cards
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-brand-lime font-medium">Study</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-gray-400">
                  No matching flashcard decks found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile search button toggle */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="sm:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-surface-elevated border border-surface-border cursor-pointer"
          aria-label="Toggle Search"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right side: Streak indicator, Notifications, Hotkeys, Quick Action */}
      <div className="flex items-center gap-2">
        {/* Streak quick chip */}
        <button
          onClick={() => onNavigate && onNavigate('analytics')}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand-orange/10 border border-brand-orange/20 text-xs text-brand-orange hover:bg-brand-orange/15 transition-colors cursor-pointer"
          title="View Study Streak"
        >
          <Flame className="w-3.5 h-3.5 fill-brand-orange" />
          <span className="font-medium">{currentUser.studyStreak}d streak</span>
        </button>

        {/* Keyboard shortcuts trigger */}
        <button
          onClick={onOpenShortcuts}
          className="hidden sm:flex items-center p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
          title="Keyboard Shortcuts (?)"
          aria-label="View Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-surface-elevated transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-lime" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-surface-border rounded-xl shadow-xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border mb-2">
                <span className="text-xs font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-brand-violet-light hover:underline cursor-pointer"
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
                        ? 'bg-surface-elevated border-brand-violet/20'
                        : 'bg-transparent border-surface-border/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-white text-[11px]">{n.title}</span>
                      <span className="text-[9px] text-gray-400">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={Sparkles}
          onClick={onQuickGenerate}
        >
          <span>Generate</span>
        </Button>
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
