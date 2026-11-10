import React from 'react';

/**
 * Minimalist shadcn-style Card component for BrainPopZ.
 */
export default function Card({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  padding = 'p-5',
  as: Component = 'div',
  ...props
}) {
  const hoverStyles = hoverEffect
    ? 'hover:border-brand-violet/35 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-200 cursor-pointer'
    : 'transition-all duration-150';

  return (
    <Component
      onClick={onClick}
      className={`bg-surface border border-surface-border rounded-2xl shadow-card ${padding} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
