import React from 'react';
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
} from 'lucide-react';
import Badge from '../common/Badge';
import { currentUser } from '../../data/mockData';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai-generator', label: 'AI Generator', icon: Sparkles, badge: 'New', badgeVariant: 'lime' },
  { id: 'decks', label: 'My Flashcards', icon: Layers, count: 12 },
  { id: 'quizzes', label: 'Practice Quizzes', icon: BrainCircuit },
  { id: 'analytics', label: 'Study Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  currentTab = 'dashboard',
  onSelectTab,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const handleNav = (id) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

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
          <div className="flex items-center justify-between mb-6 px-2">
            <button
              onClick={() => handleNav('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
              title="Go to BrainPopZ Dashboard"
            >
              <div className="w-7 h-7 rounded-lg bg-brand-violet/15 text-brand-violet flex items-center justify-center border border-brand-violet/25">
                <BrainCircuit className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-sm tracking-tight text-white">
                  BrainPop<span className="text-brand-lime">Z</span>
                </span>
                <span className="text-[9px] text-gray-500 font-mono">v1.0</span>
              </div>
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

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <p className="px-2.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
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
                      ? 'bg-surface-elevated text-white border border-surface-border'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-surface-elevated/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-brand-violet' : 'text-gray-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <Badge variant={item.badgeVariant || 'violet'} size="sm">
                      {item.badge}
                    </Badge>
                  )}

                  {item.count && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-elevated text-gray-400 border border-surface-border font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Minimalist Study Status Line */}
          <div className="mt-8 px-2.5 py-3 rounded-lg bg-surface border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                <Flame className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
                <span>Daily Cards</span>
              </span>
              <span className="text-white text-[11px] font-medium font-mono">
                {currentUser.dailyGoalProgress}/{currentUser.dailyGoalTarget}
              </span>
            </div>
            <div className="w-full bg-[#0A0A0F] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-lime h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(currentUser.dailyGoalProgress / currentUser.dailyGoalTarget) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 pt-0.5">
              <span>{currentUser.creditsRemaining} AI credits left</span>
              <button
                onClick={() => handleNav('ai-generator')}
                className="text-brand-violet-light hover:underline cursor-pointer"
              >
                Top up →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-surface-border bg-midnight">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNav('settings')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none min-w-0"
              title="User Settings"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-surface-border shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate group-hover:text-brand-violet-light transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </button>

            <button
              onClick={() => handleNav('settings')}
              title="Account Settings"
              className="p-1 text-gray-400 hover:text-white rounded-md transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
