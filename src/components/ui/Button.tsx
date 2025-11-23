// @ts-nocheck
import React from 'react';
import { colors, shadows } from '../../styles/tokens';

const baseStyles =
  'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

const variants = {
  primary: `bg-gradient-to-r from-[${colors.accent.primary}] via-[${colors.accent.primary}] to-[${colors.accent.primary}] text-white shadow-[${shadows.elevated}] focus-visible:ring-[${colors.accent.secondary}] focus-visible:ring-offset-white hover:-translate-y-[1px]`,
  secondary: `bg-[${colors.background.surface}] text-[${colors.accent.primary}] border border-[${colors.border.subtle}] shadow-[${shadows.soft}] focus-visible:ring-[${colors.accent.primary}] focus-visible:ring-offset-white hover:bg-[${colors.background.surfaceMuted}] hover:-translate-y-[1px]`,
  ghost: `bg-[${colors.background.surfaceMuted}] text-[${colors.accent.primary}] border border-transparent focus-visible:ring-[${colors.accent.primary}] focus-visible:ring-offset-white hover:border-[${colors.border.subtle}] hover:bg-white hover:-translate-y-[1px]`,
  danger: `bg-[${colors.status.danger}] text-white shadow-[${shadows.soft}] focus-visible:ring-[${colors.status.danger}] focus-visible:ring-offset-white hover:-translate-y-[1px]`,
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}) => {
  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} gap-2 ${className}`} {...rest}>
      {icon && <span className="h-4 w-4">{icon}</span>}
      {children}
    </button>
  );
};
