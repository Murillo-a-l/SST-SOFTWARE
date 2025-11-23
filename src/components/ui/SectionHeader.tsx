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
            <span className="h-px w-6 bg-gradient-to-r from-[${colors.accent.secondary}] via-[${colors.accent.primary}] to-transparent" aria-hidden />
            <p className={`${typography.mono} text-[${colors.accent.secondary}]`}>{label}</p>
          </div>
        )}
        {title && <h2 className={`${typography.title} text-[${colors.text.primary}] tracking-tight`}>{title}</h2>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
