import React from 'react';

/**
 * Minimalist, standard Button component for BrainPopZ.
 * Styled after Claude Console, Linear, and modern developer interfaces.
 * Replaces chunky 3D extrusions with clean, crisp geometry, tactile active states, and refined typography.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium tracking-tight transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    // Primary: Crisp solid white button with dark text (Claude Console standard CTA)
    primary:
      'bg-white text-zinc-950 hover:bg-zinc-200 border border-transparent shadow-xs',
    // Violet brand primary action
    violet:
      'bg-brand-violet text-midnight hover:bg-[#b8a1fc] border border-transparent shadow-xs font-semibold',
    // Lime success / reward action
    lime:
      'bg-brand-lime text-midnight hover:bg-[#d0fa7e] border border-transparent shadow-xs font-semibold',
    // Secondary: Dark card surface with subtle border
    secondary:
      'bg-surface-elevated hover:bg-surface-hover text-zinc-200 hover:text-white border border-surface-border shadow-xs',
    // Outline: Minimal transparent with subtle 1px border
    outline:
      'bg-transparent hover:bg-white/[0.06] text-zinc-300 hover:text-white border border-white/10',
    // Ghost: Transparent with hover highlight
    ghost:
      'bg-transparent hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-transparent',
    // Google: Official dark theme styling matching Claude Console
    google:
      'bg-[#1E1F2A] hover:bg-[#272938] text-white border border-white/10 font-medium shadow-xs',
    // Danger: Subtle red action
    danger:
      'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-9 px-4 text-xs gap-2 rounded-lg',
    lg: 'h-10 px-5 text-sm gap-2 rounded-lg',
    xl: 'h-11 px-6 text-sm font-semibold gap-2.5 rounded-xl',
    icon: 'h-9 w-9 p-0 rounded-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthStyle} ${className}`}
      {...props}
    >
      {LeftIcon && <LeftIcon className="w-3.5 h-3.5 shrink-0 stroke-[1.75]" />}
      <span>{children}</span>
      {RightIcon && <RightIcon className="w-3.5 h-3.5 shrink-0 stroke-[1.75]" />}
    </button>
  );
}
