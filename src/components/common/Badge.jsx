import React from 'react';

/**
 * Whimsical, friendly Badge component for BrainPopZ.
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variantStyles = {
    default: 'bg-surface-secondary text-zinc-700 border-surface-border shadow-xs',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 font-bold uppercase tracking-wider',
    lavender: 'bg-[#EADEFA] text-[#6B21A8] border-[#D8B4FE] font-bold shadow-xs',
    neo: 'bg-white text-zinc-950 border border-black shadow-[1.5px_1.5px_0px_#000] font-bold',
    violet: 'bg-purple-50 text-purple-800 border-purple-200 font-semibold shadow-xs',
    lime: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold shadow-xs',
    orange: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold shadow-xs',
    dark: 'bg-midnight-ink text-white border-midnight-ink font-medium shadow-xs',
    outline: 'bg-transparent text-zinc-600 border-surface-border',
  };

  const dotColors = {
    default: 'bg-zinc-400',
    violet: 'bg-purple-600',
    lime: 'bg-emerald-600',
    orange: 'bg-amber-600',
    dark: 'bg-white',
    outline: 'bg-zinc-400',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold rounded-full',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold rounded-full',
    lg: 'text-xs px-3 py-1 gap-1.5 font-bold rounded-full',
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentDot = dotColors[variant] || dotColors.default;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center border tracking-tight transition-all duration-150 ${currentSize} ${currentVariant} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${currentDot}`}
        />
      )}
      {children}
    </span>
  );
}
