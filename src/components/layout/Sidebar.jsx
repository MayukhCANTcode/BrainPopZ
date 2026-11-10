import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Cpu,
  FileText,
  GraduationCap,
  Trophy,
  ListOrdered,
  Settings,
  Flame,
  X,
  LogOut,
  Zap,
} from 'lucide-react';
import Badge from '../common/Badge';
import Logo from '../common/Logo';
import MonthlyStreakHeatmap from '../dashboard/MonthlyStreakHeatmap';
import { getGamificationState, getLevelInfo } from '../../services/gamification';

/**
 * Minimalist, standard Sidebar navigation for BrainPopZ.
 * Styled after Claude Console, Linear, and modern developer interfaces.
 * Uses clean outline stroke icons matching standard design systems.
 */
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

  // Exact icons matching modern minimal design (Image 2 reference)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'ai-generator', label: 'AI Generator', icon: Cpu, badge: 'AI', badgeVariant: 'lime' },
    { id: 'decks', label: 'My Flashcards', icon: FileText, count: decksCount },
    { id: 'quizzes', label: 'Practice Quizzes', icon: GraduationCap },
    { id: 'achievements', label: 'Achievements', icon: Trophy, badge: `${gameState.unlockedAchievements?.length || 0}`, badgeVariant: 'violet' },
    { id: 'analytics', label: 'Study Analytics', icon: ListOrdered },
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
              <Logo size="sm" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-md text-zinc-400 hover:text-white hover:bg-surface-elevated cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          {/* Gamification Stats Header Pills - Minimal & restrained */}
          <div className="grid grid-cols-2 gap-1.5 px-1 mb-4">
            <div
              onClick={() => handleNav('achievements')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-surface-border text-zinc-300 cursor-pointer hover:border-zinc-700 hover:text-white transition-colors"
              title="Current Active Streak"
            >
              <Flame className="w-3.5 h-3.5 text-brand-orange shrink-0 stroke-[1.75]" />
              <div className="truncate flex items-baseline gap-1">
                <span className="font-mono font-medium text-xs text-white">{gameState.streak}</span>
                <span className="text-[10px] text-zinc-400">streak</span>
              </div>
            </div>

            <div
              onClick={() => handleNav('achievements')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-surface-border text-zinc-300 cursor-pointer hover:border-zinc-700 hover:text-white transition-colors"
              title="Total XP Earned"
            >
              <Zap className="w-3.5 h-3.5 text-brand-lime shrink-0 stroke-[1.75]" />
              <div className="truncate flex items-baseline gap-1">
                <span className="font-mono font-medium text-xs text-white">{gameState.xp}</span>
                <span className="text-[10px] text-zinc-400">XP</span>
              </div>
            </div>
          </div>

          {/* Navigation Links - Standard, minimal, outline icons */}
          <div className="space-y-0.5">
            <p className="px-2.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Platform
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer group ${
                    isActive
                      ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 stroke-[1.75] transition-colors ${
                        isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
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
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-elevated text-zinc-400 border border-surface-border font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Clean Live Daily Progress Card */}
          <div className="mt-5 px-3 py-2.5 rounded-xl bg-surface border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 flex items-center gap-1.5 text-xs font-medium">
                <Flame className="w-3.5 h-3.5 text-brand-orange shrink-0 stroke-[1.75]" />
                <span>Daily Cards</span>
              </span>
              <span className="text-white text-xs font-mono font-medium">
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

            <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-0.5">
              <span>Tier {levelInfo.level} • {levelInfo.title}</span>
              <button
                onClick={() => handleNav('achievements')}
                className="text-brand-violet-light hover:underline cursor-pointer"
              >
                Badges →
              </button>
            </div>
          </div>

          {/* LeetCode-style Monthly Streak Heatmap */}
          <MonthlyStreakHeatmap />
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
                <div className="w-7 h-7 rounded-full bg-brand-violet/20 text-brand-violet-light flex items-center justify-center font-medium text-xs border border-brand-violet/30 shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate group-hover:text-zinc-200 transition-colors">
                  {user?.name || 'Scholar'}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {user?.email || 'scholar@university.edu'}
                </p>
              </div>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out of Google"
                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-surface-elevated rounded-md transition-colors cursor-pointer shrink-0"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
