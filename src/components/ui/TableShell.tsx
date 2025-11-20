import React from 'react';

interface TableShellProps {
  children: React.ReactNode;
  className?: string;
}

export const tableHeaderCell =
  'px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7480]';
export const tableCell = 'px-4 py-2.5 text-sm text-slate-800';

export const TableShell: React.FC<TableShellProps> = ({ children, className = '' }) => {
  return (
    <div className={`rounded-2xl border border-[#E0E3E7] bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {children}
        </table>
      </div>
    </div>
  );
};
