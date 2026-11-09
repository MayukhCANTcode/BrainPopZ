import React, { useState } from 'react';
import { CheckCircle2, Minus, Plus, RotateCcw, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { currentUser } from '../../data/mockData';
import {
  getGamificationState,
  saveGamificationState,
  getInitialGamificationState,
} from '../../services/gamification';

export default function SettingsView({ user, onResetDecks }) {
  const [dailyGoal, setDailyGoal] = useState(() => {
    try {
      const gState = getGamificationState();
      return gState.dailyGoalTarget || 20;
    } catch {
      return 20;
    }
  });

  const [spacedRepetition, setSpacedRepetition] = useState(() => {
    try {
      const saved = localStorage.getItem('brainpopz_settings');
      return saved ? JSON.parse(saved).spacedRepetition ?? true : true;
    } catch {
      return true;
    }
  });

  const [soundEffects, setSoundEffects] = useState(() => {
    try {
      const saved = localStorage.getItem('brainpopz_settings');
      return saved ? JSON.parse(saved).soundEffects ?? false : false;
    } catch {
      return false;
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleSave = () => {
    try {
      localStorage.setItem(
        'brainpopz_settings',
        JSON.stringify({ dailyGoal, spacedRepetition, soundEffects })
      );

      // Sync daily goal with gamification service
      const gState = getGamificationState();
      saveGamificationState({ ...gState, dailyGoalTarget: dailyGoal });
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetGamification = () => {
    if (window.confirm('Are you sure you want to reset your streak, XP, and badges to 0?')) {
      saveGamificationState(getInitialGamificationState());
      setResetMessage('Gamification metrics reset to clean baseline.');
      setTimeout(() => setResetMessage(''), 3500);
    }
  };

  const handleClearAllDecks = () => {
    if (window.confirm('Are you sure you want to remove all saved decks from your library?')) {
      try {
        localStorage.removeItem('brainpopz_decks');
        if (onResetDecks) onResetDecks();
        setResetMessage('All study sets cleared from local library.');
        setTimeout(() => setResetMessage(''), 3500);
      } catch (err) {
        console.warn('Failed to clear decks', err);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="pb-4 border-b border-surface-border">
        <h1 className="text-xl font-heading font-bold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-gray-400">
          Manage your study targets, repetition algorithms, and account preferences.
        </p>
      </div>

      <Card padding="p-5" className="border-surface-border space-y-5">
        {/* Profile section */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-surface-border">
          <img
            src={user?.picture || currentUser.avatarUrl}
            alt={user?.name || currentUser.name}
            className="w-12 h-12 rounded-full object-cover border border-surface-border bg-surface-elevated"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = currentUser.avatarUrl;
            }}
          />
          <div>
            <h2 className="text-sm font-semibold text-white">
              {user?.name || currentUser.name}
            </h2>
            <p className="text-xs text-gray-400">{user?.email || currentUser.email}</p>
            <div className="mt-1">
              <Badge variant={user?.id ? 'lime' : 'default'} size="sm">
                {user?.id ? 'Verified Google Scholar' : currentUser.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Study Configuration
          </h3>

          {/* Daily Goal Control */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-surface-border">
            <div>
              <p className="text-xs font-medium text-white">
                Daily Flashcard Goal
              </p>
              <p className="text-[11px] text-gray-400">
                Target cards to review per day.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDailyGoal((prev) => Math.max(5, prev - 5))}
                className="w-7 h-7 rounded bg-surface border border-surface-border flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
                aria-label="Decrease daily goal"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-mono font-medium text-white min-w-[55px] text-center">
                {dailyGoal} cards
              </span>
              <button
                type="button"
                onClick={() => setDailyGoal((prev) => Math.min(100, prev + 5))}
                className="w-7 h-7 rounded bg-surface border border-surface-border flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
                aria-label="Increase daily goal"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Spaced repetition toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-surface-border">
            <div>
              <p className="text-xs font-medium text-white">
                Spaced Repetition Engine (SM-2)
              </p>
              <p className="text-[11px] text-gray-400">
                Calculates review intervals based on difficulty ratings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSpacedRepetition(!spacedRepetition)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                spacedRepetition ? 'bg-brand-violet' : 'bg-surface'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                  spacedRepetition ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound effects toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-surface-border">
            <div>
              <p className="text-xs font-medium text-white">
                Audio Cues
              </p>
              <p className="text-[11px] text-gray-400">
                Auditory feedback on flip and correct drill responses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSoundEffects(!soundEffects)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                soundEffects ? 'bg-brand-violet' : 'bg-surface'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                  soundEffects ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated border border-surface-border">
            <div>
              <p className="text-xs font-medium text-white">
                Theme
              </p>
              <p className="text-[11px] text-gray-400">
                Duolingo-inspired playful dark theme.
              </p>
            </div>
            <span className="text-xs text-brand-lime font-mono font-medium">Midnight Colorful</span>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-2.5 rounded-lg bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Data Management & Testing Utilities */}
      <Card padding="p-5" className="border-surface-border space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
          <AlertTriangle className="w-4 h-4 text-brand-orange" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Data Management & Baseline Reset
          </h3>
        </div>

        <p className="text-xs text-gray-400">
          Reset local study metrics or clear stored flashcard sets. Useful for verifying fresh user onboarding.
        </p>

        {resetMessage && (
          <div className="p-2.5 rounded-lg bg-brand-orange/10 border border-brand-orange/25 text-brand-orange text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{resetMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            leftIcon={RotateCcw}
            onClick={handleResetGamification}
          >
            Reset Streak & XP (Clean Slate)
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-red-400 border-red-500/30 hover:bg-red-500/10"
            onClick={handleClearAllDecks}
          >
            Clear Stored Decks
          </Button>
        </div>
      </Card>
    </div>
  );
}
