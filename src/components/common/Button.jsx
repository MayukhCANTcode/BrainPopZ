import React from 'react';

/**
 * Whimsical, tactile 3D Button component for BrainPopZ.
 * Features Duolingo-inspired physical push mechanics with dynamic box-shadows.
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
    'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-100 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/50 disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0 disabled:active:shadow-none active:translate-y-[2.5px]';

  const variants = {
    primary:
      'bg-brand-violet text-midnight hover:bg-[#b8a1fc] shadow-[0_3px_0_0_#7551DC] active:shadow-[0_0.5px_0_0_#7551DC] border border-brand-violet/40',
    lime:
      'bg-brand-lime text-midnight hover:bg-[#d0fa7e] shadow-[0_3px_0_0_#89BC27] active:shadow-[0_0.5px_0_0_#89BC27] border border-brand-lime/40',
    secondary:
      'bg-surface-elevated text-gray-100 hover:bg-[#2b3046] hover:text-white shadow-[0_3px_0_0_#141724] active:shadow-[0_0.5px_0_0_#141724] border border-surface-border',
    outline:
      'bg-surface/80 text-gray-200 hover:bg-surface-elevated hover:text-white shadow-[0_3px_0_0_#11121A] active:shadow-[0_0.5px_0_0_#11121A] border border-surface-border',
    ghost:
      'bg-transparent text-gray-400 hover:bg-surface-elevated hover:text-white border border-transparent active:scale-95 active:translate-y-0',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-9 px-4 text-xs font-semibold gap-2 rounded-xl',
    lg: 'h-11 px-5 text-sm font-bold gap-2.5 rounded-xl',
    icon: 'h-9 w-9 p-0 rounded-xl',
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
      {LeftIcon && <LeftIcon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
      {RightIcon && <RightIcon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}
