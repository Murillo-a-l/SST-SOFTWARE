import React, { useMemo, useState } from 'react';
import type { Funcionario } from '../types';
import { Input } from '../src/components/ui/Input';
import { TableShell, tableHeaderCell, tableCell } from '../src/components/ui/TableShell';

interface DesativadosTabProps {
  funcionarios: Funcionario[];
  onReactivate: (id: number, nome: string) => void;
  onDelete: (id: number, nome: string) => void;
}

export const DesativadosTab: React.FC<DesativadosTabProps> = ({ funcionarios, onReactivate, onDelete }) => {
  const [filterText, setFilterText] = useState('');

  const desativados = useMemo(() => {
    return funcionarios
      .filter(f => !f.ativo)
      .filter(f => 
        filterText === '' || 
        f.nome.toLowerCase().includes(filterText) ||
        (f.matricula && f.matricula.toLowerCase().includes(filterText)) ||
        f.cargo.toLowerCase().includes(filterText)
      );
  }, [funcionarios, filterText]);
  
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="🔍 Filtrar por nome, matrícula, cargo..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value.toLowerCase())}
          className="w-full sm:w-72"
        />
      </div>

      <TableShell>
        <thead className="bg-[#F1F3F5]">
          <tr>
            {['Matrícula', 'Nome', 'CPF', 'Cargo', 'Setor', 'Data de Cadastro'].map(h => (
              <th key={h} className={tableHeaderCell}>{h}</th>
            ))}
            <th className={tableHeaderCell}><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {desativados.map(func => (
            <tr key={func.id} className="border-b border-[#ECECEC] hover:bg-[#F8FAFC]">
              <td className={`${tableCell} whitespace-nowrap`}>{func.matricula || `ID:${func.id}`}</td>
              <td className={`${tableCell} whitespace-nowrap font-medium`}>{func.nome}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{func.cpf || 'N/A'}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{func.cargo}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{func.setor || 'N/A'}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{formatDate(func.created_at)}</td>
              <td className={`${tableCell} whitespace-nowrap text-right font-medium space-x-2`}>
                <button onClick={() => onReactivate(func.id, func.nome)} className="text-[#2F6E4A] hover:underline">Reativar</button>
                <button onClick={() => onDelete(func.id, func.nome)} className="text-[#D97777] hover:underline">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
      {desativados.length === 0 && <p className="text-center py-8 text-slate-500">Nenhum funcionário desativado encontrado.</p>}
    </div>
  );
};
