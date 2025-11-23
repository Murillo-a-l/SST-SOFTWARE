// @ts-nocheck
import React from 'react';

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30';

const variants = {
  primary: 'bg-primary text-white hover:bg-primaryDark shadow-sm hover:-translate-y-[1px]',
  secondary: 'bg-bgMuted text-slate-800 border border-border hover:bg-[#E4E7EB]',
  ghost: 'text-slate-700 hover:bg-[#F1F3F5] border border-transparent',
  danger: 'bg-danger text-white hover:bg-[#c44f4f]',
  outline: 'border border-border bg-white text-slate-800 hover:bg-[#F9FAFB] hover:text-slate-900',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
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
