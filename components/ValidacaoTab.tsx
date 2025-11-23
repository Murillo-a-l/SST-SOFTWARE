// @ts-nocheck
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { Funcionario, ExameRealizado } from '../types';
import { getValidationIssues } from '../services/dbService';
import { Button } from '../src/components/ui/Button';
import { TableShell, tableHeaderCell, tableCell } from '../src/components/ui/TableShell';
import { SectionHeader } from '../src/components/ui/SectionHeader';
import { Select } from '../components/common/Select';

interface ValidacaoTabProps {
  funcionarios: Funcionario[];
  exames: ExameRealizado[];
  onDataChange: () => void;
  onCorrect: (func: Funcionario) => void;
}

export const ValidacaoTab: React.FC<ValidacaoTabProps> = ({ funcionarios, exames, onDataChange, onCorrect }) => {
  const [filterProblem, setFilterProblem] = useState<string>('Todos');

  const issues = useMemo(() => getValidationIssues(funcionarios, exames), [funcionarios, exames]);

  const filteredIssues = useMemo(() => {
    if (filterProblem === 'Todos') {
      return issues;
    }
    return issues.filter(issue => issue.issues.some(p => p.startsWith(filterProblem)));
  }, [issues, filterProblem]);

  const handleCorrect = (funcionarioId: number) => {
    const funcionarioToCorrect = funcionarios.find(f => f.id === funcionarioId);
    if (funcionarioToCorrect) {
      onCorrect(funcionarioToCorrect);
    } else {
      toast.error("Funcionário não encontrado. Tente atualizar a lista.");
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader label="Qualidade de Dados" title="Validação" />
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label htmlFor="problem-filter" className="text-sm font-medium text-slate-700">Filtrar por problema:</label>
          <Select
            id="problem-filter"
            value={filterProblem}
            onChange={(e) => setFilterProblem(e.target.value)}
            className="w-48"
          >
            <option value="Todos">Todos</option>
            <option value="Sem CPF">Sem CPF</option>
            <option value="Sem Cargo">Sem Cargo</option>
            <option value="Sem Exame">Sem Exame</option>
          </Select>
        </div>
        <Button variant="secondary" onClick={onDataChange} className="w-full sm:w-auto">
          Atualizar
        </Button>
      </div>

      <TableShell>
        <thead className="bg-[#F1F3F5]">
          <tr>
            {['Matrícula', 'Nome', 'Problemas'].map(h => (
              <th key={h} className={tableHeaderCell}>{h}</th>
            ))}
            <th className={tableHeaderCell}><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {filteredIssues.map(issue => (
            <tr key={issue.funcionarioId} className="border-b border-[#ECECEC] hover:bg-[#FFF7E6]">
              <td className={`${tableCell} whitespace-nowrap`}>{issue.matricula || `ID:${issue.funcionarioId}`}</td>
              <td className={`${tableCell} whitespace-nowrap font-medium`}>{issue.nome}</td>
              <td className={`${tableCell} whitespace-nowrap text-[#8A1F1F] font-medium`}>{issue.issues.join(', ')}</td>
              <td className={`${tableCell} whitespace-nowrap text-right font-medium`}>
                <Button variant="secondary" size="sm" onClick={() => handleCorrect(issue.funcionarioId)}>Corrigir</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
      {filteredIssues.length === 0 && <p className="text-center py-8 text-slate-500">Nenhum problema encontrado.</p>}
    </div>
  );
};
