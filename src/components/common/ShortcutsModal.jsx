import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import Button from './Button';

export default function ShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘K / Ctrl+K', description: 'Focus global search' },
    { key: 'Space / Enter', description: 'Flip active flashcard' },
    { key: '→ (Right Arrow)', description: 'Next card' },
    { key: '← (Left Arrow)', description: 'Previous card' },
    { key: '1, 2, 3', description: 'Rate recall (1: Hard, 2: Good, 3: Easy)' },
    { key: '?', description: 'Toggle keyboard shortcuts' },
    { key: 'Esc', description: 'Close active modal / dismiss search' },
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-surface border border-surface-border rounded-xl w-full max-w-md p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-surface-elevated text-gray-300 flex items-center justify-center border border-surface-border">
              <Keyboard className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5 mb-4">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated/60 border border-surface-border/50 text-xs"
            >
              <span className="text-gray-300 text-[11px]">{sc.description}</span>
              <kbd className="px-2 py-0.5 rounded bg-surface border border-surface-border text-[10px] font-mono font-medium text-white shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
