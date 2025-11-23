import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ className = '', children, ...rest }) => {
  return (
    <select
      className={`w-full rounded-lg border border-[#D5D8DC] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/40 focus:border-[#3A6EA5] shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
};
