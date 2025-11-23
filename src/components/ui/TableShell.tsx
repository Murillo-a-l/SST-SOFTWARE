import React from 'react';
import { colors, typography } from '../../styles/tokens';

interface TableShellProps {
  children: React.ReactNode;
  className?: string;
}

export const tableHeaderCell = `px-4 py-2.5 text-left ${typography.label} text-[${colors.textSecondary}]`;
export const tableCell = `px-4 py-2.5 text-sm text-[${colors.textPrimary}]`;

export const TableShell: React.FC<TableShellProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-[0_6px_18px_rgba(12,26,45,0.06)] overflow-hidden ${className}`}
      style={{ borderColor: colors.borderSoft }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">{children}</table>
      </div>
    </div>
  );
};
