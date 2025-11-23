// @ts-nocheck
import React, { useState, useMemo } from 'react';
import type { Funcionario, ExameRealizado } from '../types';
import { Input } from '../src/components/ui/Input';
import { Button } from '../src/components/ui/Button';
import { Badge } from '../src/components/ui/Badge';
import { TableShell, tableHeaderCell, tableCell } from '../src/components/ui/TableShell';
import { Select } from '../components/common/Select';
import { SectionHeader } from '../src/components/ui/SectionHeader';

interface FuncionariosTabProps {
  funcionarios: Funcionario[];
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

export const FuncionariosTab: React.FC<FuncionariosTabProps> = ({
  funcionarios,
  exames,
  onRegister,
  onRegisterExame,
  onEdit,
  onDetails,
  onDeactivate,
  onDelete,
  hasSelectedEmpresa,
}) => {
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusExame>('Todos');

  const getStatus = (vencimento: string | null): { text: StatusExame; variant: 'success' | 'warning' | 'danger' } => {
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
      const matchesText =
        filterText === '' ||
        func.nome.toLowerCase().includes(filterText) ||
        (func.matricula && func.matricula.toLowerCase().includes(filterText)) ||
        (func.cpf && func.cpf.toLowerCase().includes(filterText)) ||
        func.cargo.toLowerCase().includes(filterText);

      const matchesStatus = filterStatus === 'Todos' || func.status_exame === filterStatus;

      return matchesText && matchesStatus;
    });
  }, [funcionarios, exames, filterText, filterStatus]);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader label="Recursos Humanos" title="Funcionários" />
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Buscar por nome, matrícula, CPF..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value.toLowerCase())}
            className="w-full sm:w-64"
            disabled={!hasSelectedEmpresa}
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusExame)}
            disabled={!hasSelectedEmpresa}
            className="w-48"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Em Dia">Em Dia</option>
            <option value="Vencendo">Vencendo (30d)</option>
            <option value="Atrasado">Atrasados</option>
            <option value="Sem Exame">Sem Exame</option>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="secondary" onClick={onRegisterExame} disabled={!hasSelectedEmpresa}>Registrar Exame</Button>
          <Button onClick={onRegister} disabled={!hasSelectedEmpresa}>Cadastrar Funcionário</Button>
        </div>
      </div>

      <TableShell>
        <thead className="bg-[#F1F3F5]">
          <tr>
            <th className={tableHeaderCell}>Funcionário</th>
            <th className={tableHeaderCell}>Cargo</th>
            <th className={tableHeaderCell}>Último Exame</th>
            <th className={tableHeaderCell}>Próximo Vencimento</th>
            <th className={tableHeaderCell}>Status</th>
            <th className={tableHeaderCell}>Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E0E3E7]">
          {filteredData.map((func) => (
            <tr key={func.id} className="hover:bg-[#F8FAFC]">
              <td className={`${tableCell} whitespace-nowrap`}>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800">{func.nome}</span>
                  <span className="text-xs text-slate-500">{func.matricula ?? 'Sem matrícula'}</span>
                </div>
              </td>
              <td className={`${tableCell} whitespace-nowrap`}>{func.cargo}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{formatDate(func.data_exame)}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{formatDate(func.proximo_vencimento)}</td>
              <td className={`${tableCell} whitespace-nowrap`}>
                <Badge variant={func.status_variant}>{func.status_exame}</Badge>
              </td>
              <td className={`${tableCell} whitespace-nowrap`}>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onDetails(func)}>Detalhes</Button>
                  <Button variant="secondary" size="sm" onClick={() => onEdit(func)}>Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => onDeactivate(func.id)}>Desativar</Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(func.id, func.nome)}>Excluir</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>

      {!hasSelectedEmpresa && (
        <p className="text-xs text-slate-500">Selecione uma empresa para visualizar os funcionários.</p>
      )}
    </div>
  );
};
