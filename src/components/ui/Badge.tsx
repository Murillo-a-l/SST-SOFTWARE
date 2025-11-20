import React from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'neutral';

const styles: Record<Variant, string> = {
  success: 'bg-[#E3F3EA] text-[#2F6E4A]',
  warning: 'bg-[#FFF7E6] text-[#8A5B2F]',
  danger: 'bg-[#FDECEC] text-[#8A1F1F]',
  neutral: 'bg-[#E8ECF0] text-[#2F5C8C]',
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
