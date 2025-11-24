import React from 'react';
import { colors } from '../../styles/tokens';

export const inputClasses =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...rest }) => {
  return (
    <input
      className={`${inputClasses} ${className}`}
      style={{
        borderColor: colors.border.subtle,
        backgroundColor: colors.background.surface,
        color: colors.text.primary,
        boxShadow: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.accent.primary;
        e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}20`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = colors.border.subtle;
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...rest}
    />
  );
};
