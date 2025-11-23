import React from 'react';

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
            <span className="h-px w-6 bg-gradient-to-r from-[#C07954]/70 via-[#0F4C5C] to-transparent" aria-hidden />
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B7A92]">{label}</p>
          </div>
        )}
        {title && <h2 className="text-2xl font-semibold text-[#0F4C5C] tracking-tight">{title}</h2>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
