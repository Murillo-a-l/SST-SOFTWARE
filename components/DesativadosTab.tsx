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
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="🔍 Filtrar por nome, matrícula, cargo..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value.toLowerCase())}
          className="p-2 border border-gray-300 rounded-lg w-full sm:w-72"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Matrícula', 'Nome', 'CPF', 'Cargo', 'Setor', 'Data de Cadastro'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
              <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {desativados.map(func => (
              <tr key={func.id} className="hover:bg-gray-50 opacity-70">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{func.matricula || `ID:${func.id}`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{func.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{func.cpf || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{func.cargo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{func.setor || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(func.created_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => onReactivate(func.id, func.nome)} className="text-green-600 hover:text-green-900">Reativar</button>
                  <button onClick={() => onDelete(func.id, func.nome)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {desativados.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum funcionário desativado encontrado.</p>}
      </div>
    </div>
  );
};
