import React from 'react';

/**
 * Minimalist shadcn-style Button component for BrainPopZ.
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
    'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-violet/50 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none rounded-lg cursor-pointer';

  const variants = {
    primary:
      'bg-brand-violet text-midnight font-semibold hover:bg-brand-violet-hover shadow-subtle border border-brand-violet/30',
    lime:
      'bg-brand-lime text-midnight font-semibold hover:bg-brand-lime-hover shadow-subtle border border-brand-lime/30',
    secondary:
      'bg-surface-elevated text-gray-200 border border-surface-border hover:bg-surface-hover hover:text-white',
    outline:
      'bg-transparent text-gray-300 border border-surface-border hover:bg-surface-elevated hover:text-white',
    ghost:
      'bg-transparent text-gray-400 hover:bg-surface-elevated hover:text-white border border-transparent',
  };

  const sizes = {
    sm: 'h-7 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-xs gap-2',
    lg: 'h-10 px-4 text-sm gap-2',
    icon: 'h-8 w-8 p-0',
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
