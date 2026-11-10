import React from 'react';

/**
 * Minimalist Skeleton loading placeholder for BrainPopZ.
 */
export default function Skeleton({ className = '', variant = 'rect' }) {
  const base = 'animate-pulse bg-white/[0.06] rounded-lg';
  const variants = {
    rect: '',
    circle: 'rounded-full',
    text: 'h-4 rounded',
  };

  return <div className={`${base} ${variants[variant] || ''} ${className}`} />;
}

