import React, { useState, useMemo } from 'react';
import type { Funcionario, ExameRealizado } from '../types';

interface FuncionariosTabProps {
  // empresas prop is no longer needed here as it's handled globally
  funcionarios: Funcionario[]; // This will be the pre-filtered list
  exames: ExameRealizado[];
  onRegister: () => void;
  onRegisterExame: () => void;
  onEdit: (func: Funcionario) => void;
  onDetails: (func: Funcionario) => void;
  onDeactivate: (id: number) => void;
  onDelete: (id: number, nome: string) => void;
  hasSelectedEmpresa: boolean;
}

type StatusExame = 'Todos' | 'Em Dia' | 'Vencendo' | 'Atrasado' | 'Sem Exame';

export const FuncionariosTab: React.FC<FuncionariosTabProps> = (props) => {
  const { 
    funcionarios, 
    exames, 
    onRegister, 
    onRegisterExame, 
    onEdit, 
    onDetails, 
    onDeactivate, 
    onDelete,
    hasSelectedEmpresa
  } = props;

  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusExame>('Todos');

  const getStatus = (vencimento: string | null): { text: StatusExame, color: string } => {
    if (!vencimento) return { text: 'Sem Exame', color: 'bg-gray-100 text-gray-800' };
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVenc = new Date(vencimento + 'T00:00:00');
    const diffTime = dataVenc.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Atrasado', color: 'bg-red-100 text-red-800' };
    if (diffDays <= 30) return { text: 'Vencendo', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Em Dia', color: 'bg-green-100 text-green-800' };
  };

  const filteredData = useMemo(() => {
    // The 'funcionarios' prop is already filtered by company from App.tsx
    const activeFuncionarios = (funcionarios || []).filter(f => f.ativo);

    const enrichedData = activeFuncionarios.map(func => {
      const ultimoExame = (exames || [])
        .filter(e => e.funcionario_id === func.id)
        .sort((a, b) => new Date(b.data_realizacao).getTime() - new Date(a.data_realizacao).getTime())[0];
      
      const status = getStatus(ultimoExame?.data_vencimento ?? null);

      return {
        ...func,
        tipo_exame: ultimoExame?.tipo_exame ?? 'N/A',
        data_exame: ultimoExame?.data_realizacao,
        proximo_vencimento: ultimoExame?.data_vencimento,
        status_exame: status.text,
        status_color: status.color,
      };
    });

    return enrichedData.filter(func => {
      const matchesText = filterText === '' || 
        func.nome.toLowerCase().includes(filterText) ||
        (func.matricula && func.matricula.toLowerCase().includes(filterText)) ||
        (func.cpf && func.cpf.toLowerCase().includes(filterText)) ||
        func.cargo.toLowerCase().includes(filterText);

      const matchesStatus = filterStatus === 'Todos' || func.status_exame === filterStatus;

      return matchesText && matchesStatus;
    });
  }, [funcionarios, exames, filterText, filterStatus]);
  
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="🔍 Buscar por nome, matrícula, CPF..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value.toLowerCase())}
            className="p-2 border border-gray-300 rounded-lg w-full sm:w-64"
            disabled={!hasSelectedEmpresa}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusExame)}
            className="p-2 border border-gray-300 rounded-lg"
            disabled={!hasSelectedEmpresa}
          >
            <option value="Todos">Todos os Status</option>
            <option value="Em Dia">Em Dia</option>
            <option value="Vencendo">Vencendo (30d)</option>
            <option value="Atrasado">Atrasados</option>
            <option value="Sem Exame">Sem Exame</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button onClick={onRegister} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition w-full sm:w-auto">
                👤+ Cadastrar
            </button>
            <button onClick={onRegisterExame} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition w-full sm:w-auto">
              ➕ Registrar Exame
            </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Matrícula', 'Nome', 'Cargo', 'Tipo Exame', 'Data Exame', 'Próximo Venc.', 'Status'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
               <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map(func => (
              <tr key={func.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{func.matricula || `ID:${func.id}`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{func.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{func.cargo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{func.tipo_exame}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(func.data_exame)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(func.proximo_vencimento)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${func.status_color}`}>
                    {func.status_exame}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => onDetails(func)} className="text-gray-600 hover:text-gray-900">Detalhes</button>
                    <button onClick={() => onEdit(func)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                    <button onClick={() => onDeactivate(func.id)} className="text-orange-600 hover:text-orange-900">Desativar</button>
                    <button onClick={() => onDelete(func.id, func.nome)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
                {!hasSelectedEmpresa ? "Selecione uma empresa no menu superior para visualizar os funcionários." : "Nenhum funcionário encontrado para esta empresa e filtros."}
            </div>
        )}
      </div>
    </div>
  );
};