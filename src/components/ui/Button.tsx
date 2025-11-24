import React from 'react';
import { colors, shadows } from '../../styles/tokens';

const baseStyles =
  'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const variants = {
  primary: {
    className: 'text-white hover:-translate-y-[1px]',
    style: {
      background: `linear-gradient(135deg, ${colors.accent.primary} 0%, ${colors.accent.primary} 70%, ${colors.accent.primary} 100%)`,
      boxShadow: shadows.elevated,
    },
  },
  secondary: {
    className: 'hover:-translate-y-[1px]',
    style: {
      backgroundColor: colors.background.surfaceMuted,
      color: colors.accent.primary,
      border: `1px solid ${colors.border.subtle}`,
      boxShadow: shadows.soft,
    },
  },
  ghost: {
    className: 'hover:-translate-y-[1px]',
    style: {
      backgroundColor: 'transparent',
      color: colors.accent.primary,
      border: `1px solid transparent`,
    },
  },
  danger: {
    className: 'text-white hover:-translate-y-[1px]',
    style: {
      backgroundColor: colors.status.danger,
      boxShadow: shadows.soft,
    },
  },
  outline: {
    className: 'hover:-translate-y-[1px]',
    style: {
      backgroundColor: 'transparent',
      color: colors.text.primary,
      border: `1px solid ${colors.border.subtle}`,
      boxShadow: shadows.soft,
    },
  },
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
  const variantStyles = variants[variant];

  return (
    <button
      className={`${baseStyles} ${variantStyles.className} ${sizes[size]} gap-2 ${className}`}
      style={variantStyles.style}
      {...rest}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      {children}
    </button>
  );
};
