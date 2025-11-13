
import React, { useMemo, useState } from 'react';
import type { Funcionario, ExameRealizado } from '../types';
import { getValidationIssues } from '../services/dbService';

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
      alert("Funcionário não encontrado. Tente atualizar a lista.");
    }
  };

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center space-x-2">
            <label htmlFor="problem-filter" className="font-medium">Filtrar por problema:</label>
            <select
                id="problem-filter"
                value={filterProblem}
                onChange={(e) => setFilterProblem(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
            >
                <option value="Todos">Todos</option>
                <option value="Sem CPF">Sem CPF</option>
                <option value="Sem Cargo">Sem Cargo</option>
                <option value="Sem Exame">Sem Exame</option>
            </select>
            </div>
            <button onClick={onDataChange} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition w-full sm:w-auto">
            🔄 Atualizar
            </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Matrícula', 'Nome', 'Problemas'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
              <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredIssues.map(issue => (
              <tr key={issue.funcionarioId} className="hover:bg-amber-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.matricula || `ID:${issue.funcionarioId}`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{issue.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                  {issue.issues.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleCorrect(issue.funcionarioId)} className="text-indigo-600 hover:text-indigo-900">Corrigir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredIssues.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum problema de validação encontrado!</p>}
      </div>
    </div>
  );
};