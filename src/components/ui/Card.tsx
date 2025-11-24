import React from 'react';
import { colors, shadows } from '../../styles/tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, actions, className = '', children, ...rest }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white ${className}`}
      style={{ borderColor: colors.border.subtle, boxShadow: shadows.soft, backgroundColor: colors.background.surface }}
      {...rest}
    >
      <div className="relative p-5">
        {(title || subtitle || actions) && (
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="space-y-1">
              {subtitle && (
                <p
                  className="text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: colors.text.secondary }}
                >
                  {subtitle}
                </p>
              )}
              {title && (
                <h3
                  className="text-base font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {title}
                </h3>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
