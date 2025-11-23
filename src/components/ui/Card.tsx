import React from 'react';
import { tokens } from '../../styles/tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, actions, className = '', children, ...rest }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[${tokens.colors.borderSoft}] bg-white/85 shadow-[0_20px_60px_rgba(12,26,45,0.08)] backdrop-blur-lg ${className}`}
      {...rest}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(192,121,84,0.08),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(15,76,92,0.08),transparent_30%)]" />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#C07954]/60 to-transparent" />
      <div className="relative p-5">
        {(title || subtitle || actions) && (
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="space-y-1">
              {subtitle && <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B7A92]">{subtitle}</p>}
              {title && <h3 className="text-base font-semibold text-[#1F2A3D]">{title}</h3>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
