import React from 'react';
import { colors, shadows, typography } from '../../styles/tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, actions, className = '', children, ...rest }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-[${colors.background.surface}] shadow-[${shadows.soft}] border-[${colors.border.subtle}] ${className}`}
      {...rest}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_12%_18%,rgba(207,121,84,0.06),transparent_32%),radial-gradient(circle_at_86%_0%,rgba(15,76,92,0.06),transparent_32%)]" />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(192,121,84,0.4)] to-transparent" />
      <div className="relative p-5">
        {(title || subtitle || actions) && (
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="space-y-1">
              {subtitle && <p className={`${typography.label} text-[${colors.text.secondary}]`}>{subtitle}</p>}
              {title && <h3 className={`${typography.title} text-[${colors.text.primary}]`}>{title}</h3>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
