import React from 'react';
import { inputClasses } from '../../src/components/ui/Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ className = '', children, ...rest }) => {
  return (
    <select
      className={`${inputClasses} pr-10 bg-white/90 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
};
