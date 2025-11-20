import React, { useMemo, useState } from 'react';
import type { Funcionario } from '../types';

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
          className="w-full sm:w-72 rounded-lg border border-[#D5D8DC] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/40 focus:border-[#3A6EA5]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E0E3E7] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#F1F3F5]">
              <tr>
                {['Matrícula', 'Nome', 'CPF', 'Cargo', 'Setor', 'Data de Cadastro'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7480]">{h}</th>
                ))}
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7480]"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {desativados.map(func => (
                <tr key={func.id} className="border-b border-[#ECECEC] hover:bg-[#F8FAFC]">
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-800">{func.matricula || `ID:${func.id}`}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-slate-800">{func.nome}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-800">{func.cpf || 'N/A'}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-800">{func.cargo}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-800">{func.setor || 'N/A'}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-800">{formatDate(func.created_at)}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => onReactivate(func.id, func.nome)} className="text-[#2F6E4A] hover:underline">Reativar</button>
                    <button onClick={() => onDelete(func.id, func.nome)} className="text-[#D97777] hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {desativados.length === 0 && <p className="text-center py-8 text-slate-500">Nenhum funcionário desativado encontrado.</p>}
      </div>
    </div>
  );
};
