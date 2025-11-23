import React from 'react';
import { colors, shadows } from '../../styles/tokens';

export const inputClasses = `w-full rounded-2xl border border-[${colors.border.subtle}] bg-[${colors.background.surface}] px-3.5 py-2.5 text-sm text-[${colors.text.primary}] shadow-[${shadows.soft}] focus:outline-none focus-visible:ring-2 focus-visible:ring-[${colors.accent.primary}]/30 focus-visible:border-[${colors.accent.primary}] transition-colors duration-200`;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...rest }) => {
  return <input className={`${inputClasses} ${className}`} {...rest} />;
};
