import React from 'react';

export default function Logo({
  size = 'md',
  withText = true,
  className = '',
  badge = 'PRO',
}) {
  const sizeMap = {
    xs: { img: 'w-6 h-6 rounded-lg', text: 'text-xs', badge: 'text-[8px]' },
    sm: { img: 'w-8 h-8 rounded-xl', text: 'text-sm', badge: 'text-[9px]' },
    md: { img: 'w-9 h-9 rounded-xl', text: 'text-sm', badge: 'text-[9px]' },
    lg: { img: 'w-12 h-12 rounded-2xl', text: 'text-base', badge: 'text-[10px]' },
    xl: { img: 'w-16 h-16 rounded-3xl', text: 'text-xl', badge: 'text-xs' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Mascot Logo Icon */}
      <div
        className={`${current.img} overflow-hidden border border-brand-violet/30 shadow-md shadow-brand-violet/15 flex items-center justify-center bg-midnight shrink-0 relative group`}
      >
        <img
          src="/brainpopz-logo.png"
          alt="BrainPopZ Logo"
          className="w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            // Fallback to brain icon if image is missing
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Brand Text */}
      {withText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className={`font-heading font-black tracking-tight text-white ${current.text}`}>
              BrainPop<span className="text-brand-lime">Z</span>
            </span>
            {badge && (
              <span className={`text-brand-orange font-mono font-bold uppercase tracking-wider ${current.badge}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

