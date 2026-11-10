import React from 'react';

/**
 * Reusable BrainPopZ Mascot Component.
 * Presents the official mascot with selective, delightful micro-animations
 * and optional speech bubbles for encouragement.
 */
export default function Mascot({
  size = 'md',
  animation = 'none', // 'none' | 'float' | 'bounce' | 'pulse'
  bubble = null,
  bubblePosition = 'top', // 'top' | 'right'
  className = '',
  alt = 'BrainPopZ Mascot',
}) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const animMap = {
    none: '',
    float: 'animate-float',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse-subtle',
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Optional Speech Bubble */}
      {bubble && (
        <div
          className={`absolute z-10 px-2.5 py-1 rounded-xl bg-surface-elevated border border-brand-violet/30 text-white text-[11px] font-medium shadow-lg whitespace-nowrap animate-fadeIn select-none ${
            bubblePosition === 'right'
              ? 'left-full ml-2 top-1/2 -translate-y-1/2'
              : 'bottom-full mb-2 left-1/2 -translate-x-1/2'
          }`}
        >
          {bubble}
          {/* Bubble tail */}
          <span
            className={`absolute w-2 h-2 bg-surface-elevated border-brand-violet/30 transform rotate-45 ${
              bubblePosition === 'right'
                ? '-left-1 top-1/2 -translate-y-1/2 border-l border-b'
                : '-bottom-1 left-1/2 -translate-x-1/2 border-r border-b'
            }`}
          />
        </div>
      )}

      {/* Mascot Image */}
      <img
        src="/brainpopz-logo.png"
        alt={alt}
        className={`object-contain select-none transition-transform ${sizeMap[size] || sizeMap.md} ${animMap[animation] || ''}`}
        draggable={false}
      />
    </div>
  );
}

