import React from 'react';

/**
 * Minimalist shadcn-style Badge component.
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variantStyles = {
    default: 'bg-surface-elevated text-gray-300 border-surface-border',
    violet: 'bg-brand-violet/10 text-brand-violet-light border-brand-violet/25',
    lime: 'bg-brand-lime/10 text-brand-lime border-brand-lime/25',
    orange: 'bg-brand-orange/10 text-brand-orange border-brand-orange/25',
    outline: 'bg-transparent text-gray-400 border-surface-border',
  };

  const dotColors = {
    default: 'bg-gray-400',
    violet: 'bg-brand-violet',
    lime: 'bg-brand-lime',
    orange: 'bg-brand-orange',
    outline: 'bg-gray-400',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5 font-medium',
    lg: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentDot = dotColors[variant] || dotColors.default;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-tight transition-colors ${currentSize} ${currentVariant} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${currentDot}`}
        />
      )}
      {children}
    </span>
  );
}
