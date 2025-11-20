import React from 'react';

interface SectionHeaderProps {
  label?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ label, title, actions }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {label && <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">{label}</p>}
        {title && <h2 className="text-lg font-semibold text-slate-800">{title}</h2>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
