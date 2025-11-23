import React from 'react';

export const inputClasses =
  'w-full rounded-2xl border border-[#D4DCE6] bg-white/85 px-3.5 py-2.5 text-sm text-[#1F2A3D] shadow-[0_12px_30px_rgba(12,26,45,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C5C]/25 focus-visible:border-[#0F4C5C] transition-all duration-200 backdrop-blur';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = '', ...rest }) => {
  return <input className={`${inputClasses} ${className}`} {...rest} />;
};
