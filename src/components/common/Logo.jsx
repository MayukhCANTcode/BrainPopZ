import React from 'react';

export default function Logo({
  size = 'md',
  withText = true,
  className = '',
}) {
  const sizeMap = {
    xs: { img: 'w-6 h-6 rounded-lg', text: 'text-xs' },
    sm: { img: 'w-8 h-8 rounded-xl', text: 'text-sm' },
    md: { img: 'w-9 h-9 rounded-xl', text: 'text-sm' },
    lg: { img: 'w-12 h-12 rounded-2xl', text: 'text-base' },
    xl: { img: 'w-16 h-16 rounded-3xl', text: 'text-xl' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Mascot Logo Icon */}
      <div
        className={`${current.img} overflow-hidden border border-surface-border shadow-sm flex items-center justify-center bg-midnight shrink-0 relative group hover:scale-105 transition-transform duration-200`}
      >
        <img
          src="/brainpopz-logo.png"
          alt="BrainPopZ Logo"
          className="w-full h-full object-cover object-top scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Brand Text */}
      {withText && (
        <span className={`font-heading font-black tracking-tight text-zinc-950 ${current.text}`}>
          BrainPop<span className="text-brand-violet-dark">Z</span>
        </span>
      )}
    </div>
  );
}
