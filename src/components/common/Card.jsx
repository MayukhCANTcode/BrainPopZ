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
    ? 'hover:border-surface-active transition-colors duration-150 cursor-pointer'
    : 'transition-colors duration-150';

  return (
    <Component
      onClick={onClick}
      className={`bg-surface border border-surface-border rounded-xl shadow-card ${padding} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
