import React from 'react';
import { colors, shadows } from '../../styles/tokens';

interface TableShellProps {
  children: React.ReactNode;
  className?: string;
}

export const tableHeaderCell = `px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.18em]`;
export const tableCell = `px-4 py-2.5 text-sm`;

export const TableShell: React.FC<TableShellProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`rounded-2xl border overflow-hidden ${className}`}
      style={{ borderColor: colors.border.subtle, backgroundColor: colors.background.surface, boxShadow: shadows.soft }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full" style={{ color: colors.text.primary }}>
          {children}
        </table>
      </div>
    </div>
  );
};
