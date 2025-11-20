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
      className={`rounded-2xl border border-[${tokens.colors.borderSoft}] bg-white shadow-card p-4 ${className}`}
      {...rest}
    >
      {(title || subtitle || actions) && (
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {subtitle && <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">{subtitle}</p>}
            {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
