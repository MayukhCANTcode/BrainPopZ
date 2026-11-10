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
    default: 'bg-surface-elevated text-gray-200 border-surface-border shadow-xs',
    violet: 'bg-brand-violet/15 text-brand-violet-light border-brand-violet/30 font-semibold shadow-xs',
    lime: 'bg-brand-lime/15 text-brand-lime border-brand-lime/30 font-semibold shadow-xs',
    orange: 'bg-brand-orange/15 text-brand-orange border-brand-orange/30 font-semibold shadow-xs',
    outline: 'bg-transparent text-gray-300 border-surface-border',
  };

  const dotColors = {
    default: 'bg-gray-400',
    violet: 'bg-brand-violet',
    lime: 'bg-brand-lime',
    orange: 'bg-brand-orange',
    outline: 'bg-gray-400',
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
