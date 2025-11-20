import React from 'react';

export const inputClasses =
  'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...rest }) => {
  return <input className={`${inputClasses} ${className}`} {...rest} />;
};
