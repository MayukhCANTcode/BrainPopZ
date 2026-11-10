import React from 'react';

/**
 * Minimalist shadcn-style Card component for BrainPopZ.
 */
export default function Card({
  children,
  className = '',
  hoverEffect = false,
  variant = 'default',
  onClick,
  padding = 'p-5',
  as: Component = 'div',
  ...props
}) {
  const variantStyles = {
    default: 'bg-surface border border-surface-border rounded-2xl shadow-card',
    neo: 'bg-surface border-2 border-midnight-ink rounded-2xl shadow-neo',
    lavender: 'bg-[#EADEFA] border border-midnight-ink rounded-2xl shadow-neo-sm',
    tray: 'bg-[#F2EFE5] border border-surface-border rounded-2xl',
  };

  const hoverStyles = hoverEffect
    ? 'hover:-translate-y-1 transition-all duration-200 cursor-pointer'
    : 'transition-all duration-150';

  const baseVariant = variantStyles[variant] || variantStyles.default;

  return (
    <Component
      onClick={onClick}
      className={`${baseVariant} ${padding} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
