import React from 'react';
import { colors, typography } from '../../styles/tokens';

interface SectionHeaderProps {
  label?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ label, title, actions }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1">
        {label && (
          <div className="flex items-center gap-3">
            <span
              className="h-px w-6"
              aria-hidden
              style={{
                background: `linear-gradient(to right, ${colors.accent.secondary} 0%, ${colors.accent.primary} 60%, transparent 100%)`,
              }}
            />
            <p
              className="text-[11px] uppercase tracking-[0.2em]"
              style={{ fontFamily: typography.fontMono, color: colors.accent.retro }}
            >
              {label}
            </p>
          </div>
        )}
        {title && (
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ color: colors.text.primary, fontFamily: typography.fontSans }}
          >
            {title}
          </h2>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
