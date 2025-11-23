// @ts-nocheck
import React from 'react';
import { colors, shadows } from '../../styles/tokens';

const baseStyles =
  'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C07954]/60 focus-visible:ring-offset-white';

const variants = {
  primary:
    'bg-gradient-to-r from-[#0F4C5C] via-[#147D8C] to-[#0F4C5C] text-white shadow-[0_12px_24px_rgba(12,59,73,0.25)] hover:shadow-[0_16px_32px_rgba(12,59,73,0.3)] hover:-translate-y-[1px]',
  secondary:
    'bg-white/85 text-[#0F4C5C] border border-[#D4DCE6] shadow-[0_10px_22px_rgba(12,26,45,0.08)] hover:-translate-y-[1px] hover:bg-[#F7F9FC]',
  ghost:
    'text-[#0F4C5C] bg-[#F7F9FC] border border-transparent hover:border-[#E3E8F2] hover:bg-white hover:-translate-y-[1px]',
  danger: 'bg-[#D05C60] text-white shadow-[0_10px_22px_rgba(208,92,96,0.25)] hover:bg-[#b84e53] hover:-translate-y-[1px]',
  outline:
    'border border-[#D4DCE6] bg-transparent text-[#1F2A3D] hover:bg-white/70 hover:text-[#0F4C5C] hover:-translate-y-[1px] shadow-[0_8px_18px_rgba(12,26,45,0.08)]',
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
