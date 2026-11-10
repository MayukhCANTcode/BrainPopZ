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
    // Primary: Scaler Flow Soft Lavender CTA button with deep ink text
    primary:
      'bg-brand-violet-lilac text-midnight-ink hover:bg-brand-violet-lilacHover border border-[#C5AFFC] shadow-xs font-semibold',
    // Flow Blue: Scaler Flow Royal Blue Action button
    blue:
      'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-blue-800 shadow-sm font-semibold',
    // Neo-brutalist white with solid black drop shadow
    neo:
      'bg-white text-midnight-ink hover:bg-zinc-50 border-2 border-midnight-ink shadow-neo-sm font-bold',
    // Neo-brutalist lavender with solid black drop shadow
    neoLavender:
      'bg-[#EADEFA] text-midnight-ink hover:bg-[#D9C4F7] border-2 border-midnight-ink shadow-neo-sm font-bold',
    // Dark: Deep midnight ink button (high contrast)
    dark:
      'bg-midnight-ink text-white hover:bg-[#20222C] border border-midnight-ink shadow-xs font-medium',
    // Violet brand primary action
    violet:
      'bg-brand-violet text-midnight-ink hover:bg-[#9E7DF7] border border-transparent shadow-xs font-semibold',
    // Lime / Emerald success action
    lime:
      'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 shadow-xs font-semibold',
    // Secondary: Warm card surface with subtle border
    secondary:
      'bg-surface hover:bg-surface-secondary text-zinc-800 border border-surface-border shadow-xs',
    // Outline: Warm minimal outline with subtle 1px border
    outline:
      'bg-white/70 hover:bg-surface-secondary text-zinc-700 hover:text-zinc-950 border border-surface-border shadow-xs',
    // Ghost: Transparent with hover highlight
    ghost:
      'bg-transparent hover:bg-black/[0.04] text-zinc-600 hover:text-zinc-950 border border-transparent',
    // Google: Official Google styling
    google:
      'bg-white hover:bg-zinc-50 text-zinc-800 border border-surface-border font-medium shadow-xs',
    // Danger: Subtle red action
    danger:
      'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-xs',
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
