import React, { useState, useMemo } from 'react';
import type { Funcionario, ExameRealizado } from '../types';
import { Input } from '../src/components/ui/Input';
import { Button } from '../src/components/ui/Button';
import { Badge } from '../src/components/ui/Badge';
import { TableShell, tableHeaderCell, tableCell } from '../src/components/ui/TableShell';

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

  const getStatus = (vencimento: string | null): { text: StatusExame, variant: 'success' | 'warning' | 'danger' } => {
    if (!vencimento) return { text: 'Sem Exame', variant: 'warning' };
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVenc = new Date(vencimento + 'T00:00:00');
    const diffTime = dataVenc.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Atrasado', variant: 'danger' };
    if (diffDays <= 30) return { text: 'Vencendo', variant: 'warning' };
    return { text: 'Em Dia', variant: 'success' };
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
        status_variant: status.variant,
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="🔍 Buscar por nome, matrícula, CPF..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value.toLowerCase())}
            className="w-full sm:w-64"
            disabled={!hasSelectedEmpresa}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusExame)}
            className="rounded-lg border border-[#D5D8DC] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/40 focus:border-[#3A6EA5] shadow-sm"
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
            <Button onClick={onRegister} className="w-full sm:w-auto" icon={<span>👤</span>}>
                Cadastrar
            </Button>
            <Button variant="secondary" onClick={onRegisterExame} className="w-full sm:w-auto" icon={<span>➕</span>}>
              Registrar Exame
            </Button>
        </div>
      </div>

      <TableShell>
        <thead className="bg-[#F1F3F5]">
          <tr>
            {['Matrícula', 'Nome', 'Cargo', 'Tipo Exame', 'Data Exame', 'Próximo Venc.', 'Status'].map(h => (
              <th key={h} className={tableHeaderCell}>{h}</th>
            ))}
             <th className={tableHeaderCell}><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(func => (
            <tr key={func.id} className="border-b border-[#ECECEC] hover:bg-[#F8FAFC]">
              <td className={`${tableCell} whitespace-nowrap`}>{func.matricula || `ID:${func.id}`}</td>
              <td className={`${tableCell} whitespace-nowrap font-medium`}>{func.nome}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{func.cargo}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{func.tipo_exame}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{formatDate(func.data_exame)}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{formatDate(func.proximo_vencimento)}</td>
              <td className={`${tableCell} whitespace-nowrap`}> 
                <Badge variant={func.status_variant}>{func.status_exame}</Badge>
              </td>
              <td className={`${tableCell} whitespace-nowrap text-right font-medium space-x-2`}> 
                  <button onClick={() => onDetails(func)} className="text-slate-600 hover:text-slate-900 transition-colors">Detalhes</button>
                  <button onClick={() => onEdit(func)} className="text-[#2F5C8C] hover:underline">Editar</button>
                  <button onClick={() => onDeactivate(func.id)} className="text-[#F6B980] hover:text-[#8A5B2F]">Desativar</button>
                  <button onClick={() => onDelete(func.id, func.nome)} className="text-[#D97777] hover:underline">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
      {filteredData.length === 0 && (
          <div className="text-center py-8 text-slate-500 rounded-2xl border border-dashed border-[#E0E3E7] bg-white">
              {!hasSelectedEmpresa ? "Selecione uma empresa no menu superior para visualizar os funcionários." : "Nenhum funcionário encontrado para esta empresa e filtros."}
          </div>
      )}
    </div>
  );
};