import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  BrainCircuit,
  BarChart3,
  Settings,
  Flame,
  X,
  LogOut,
  Award,
  Zap,
} from 'lucide-react';
import Badge from '../common/Badge';
import Logo from '../common/Logo';
import { getGamificationState, getLevelInfo } from '../../services/gamification';

export default function Sidebar({
  currentTab = 'dashboard',
  onSelectTab,
  isMobileOpen = false,
  onCloseMobile,
  user,
  onLogout,
  decksCount = 0,
}) {
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

  const levelInfo = getLevelInfo(gameState.xp);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-generator', label: 'AI Generator', icon: Sparkles, badge: 'AI', badgeVariant: 'lime' },
    { id: 'decks', label: 'My Flashcards', icon: Layers, count: decksCount },
    { id: 'quizzes', label: 'Practice Quizzes', icon: BrainCircuit },
    { id: 'achievements', label: 'Achievements', icon: Award, badge: `${gameState.unlockedAchievements?.length || 0}`, badgeVariant: 'violet' },
    { id: 'analytics', label: 'Study Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (id) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const dailyGoalPercent = Math.min(
    100,
    Math.round((gameState.cardsReviewedToday / (gameState.dailyGoalTarget || 20)) * 100)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-midnight border-r border-surface-border flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4">
          {/* Logo & Close for mobile */}
          <div className="flex items-center justify-between mb-4 px-2">
            <button
              onClick={() => handleNav('dashboard')}
              className="text-left group cursor-pointer focus:outline-none"
              title="Go to BrainPopZ Dashboard"
            >
              <Logo size="sm" badge="PRO" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-surface-elevated cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Gamification Stats Header Pills */}
          <div className="grid grid-cols-2 gap-1.5 px-2 mb-4">
            <div
              onClick={() => handleNav('achievements')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange cursor-pointer hover:bg-brand-orange/15 transition-colors"
              title="Current Active Streak"
            >
              <Flame className="w-3.5 h-3.5 fill-brand-orange shrink-0" />
              <div className="truncate">
                <span className="font-mono font-bold text-xs">{gameState.streak}</span>
                <span className="text-[10px] ml-1 text-brand-orange/80">streak</span>
              </div>
            </div>

            <div
              onClick={() => handleNav('achievements')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-lime/10 border border-brand-lime/20 text-brand-lime cursor-pointer hover:bg-brand-lime/15 transition-colors"
              title="Total XP Earned"
            >
              <Zap className="w-3.5 h-3.5 fill-brand-lime shrink-0" />
              <div className="truncate">
                <span className="font-mono font-bold text-xs">{gameState.xp}</span>
                <span className="text-[10px] ml-1 text-brand-lime/80">XP</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <p className="px-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Platform
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-surface-elevated text-white border border-surface-border shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-surface-elevated/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-brand-violet-light' : 'text-gray-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <Badge variant={item.badgeVariant || 'violet'} size="sm">
                      {item.badge}
                    </Badge>
                  )}

                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-elevated text-gray-400 border border-surface-border font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Duolingo-style Live Daily Progress Card */}
          <div className="mt-6 px-3 py-3 rounded-xl bg-surface border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 flex items-center gap-1.5 text-xs font-medium">
                <Flame className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
                <span>Daily Cards</span>
              </span>
              <span className="text-white text-xs font-bold font-mono">
                {gameState.cardsReviewedToday}/{gameState.dailyGoalTarget || 20}
              </span>
            </div>

            <div className="w-full bg-[#0A0A0F] h-1.5 rounded-full overflow-hidden border border-surface-border/40">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  dailyGoalPercent >= 100 ? 'bg-brand-lime' : 'bg-brand-orange'
                }`}
                style={{ width: `${dailyGoalPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-400 pt-0.5">
              <span>Tier {levelInfo.level} • {levelInfo.title}</span>
              <button
                onClick={() => handleNav('achievements')}
                className="text-brand-violet-light hover:underline cursor-pointer"
              >
                Badges →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-surface-border bg-midnight">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => handleNav('settings')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none min-w-0"
              title="User Settings"
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user?.name || 'User Profile'}
                  className="w-7 h-7 rounded-full object-cover border border-surface-border shrink-0 bg-surface-elevated"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-brand-violet/20 text-brand-violet-light flex items-center justify-center font-bold text-xs border border-brand-violet/30 shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate group-hover:text-brand-violet-light transition-colors">
                  {user?.name || 'Scholar'}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user?.email || 'scholar@university.edu'}
                </p>
              </div>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out of Google"
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-surface-elevated rounded-md transition-colors cursor-pointer shrink-0"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
