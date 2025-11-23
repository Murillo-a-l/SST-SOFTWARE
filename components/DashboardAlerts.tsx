import React, { useState, useMemo } from 'react';
import { DocumentoEmpresa, Empresa, DocumentoTipo, DocumentoStatus } from '../types';
import { Card } from '../src/components/ui/Card';
import { Input } from '../src/components/ui/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../src/components/ui/Badge';

interface DashboardAlertsProps {
  documentos: DocumentoEmpresa[];
  empresas: Empresa[];
  documentoTipos: DocumentoTipo[];
}

const getEmpresaNome = (empresaId: number, empresas: Empresa[]): string => {
  return empresas.find(e => e.id === empresaId)?.nomeFantasia || 'Empresa desconhecida';
};

const getDaysDiff = (dataFim: string | null): { diff: number; text: string } => {
  if (!dataFim) return { diff: Infinity, text: '' };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataStr = dataFim.split('T')[0];
  const dataVenc = new Date(dataStr + 'T00:00:00');
  const diffTime = dataVenc.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { diff: diffDays, text: `Vencido há ${Math.abs(diffDays)} dias` };
  if (diffDays === 0) return { diff: diffDays, text: `Vence hoje` };
  return { diff: diffDays, text: `Vence em ${diffDays} dias` };
};

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ documentos, empresas, documentoTipos }) => {
  const [filterStatus, setFilterStatus] = useState<DocumentoStatus | 'TODOS'>('TODOS');
  const [filterType, setFilterType] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const alerts = useMemo(() => {
    return documentos
      .filter(d => d.status === 'VENCENDO' || d.status === 'VENCIDO')
      .filter(d => filterStatus === 'TODOS' || d.status === filterStatus)
      .filter(d => filterType === 'TODOS' || d.tipo === filterType)
      .filter(d => {
        const empresaNome = getEmpresaNome(d.empresaId, empresas).toLowerCase();
        const docNome = d.nome.toLowerCase();
        const term = searchTerm.toLowerCase();
        return empresaNome.includes(term) || docNome.includes(term);
      })
      .map(d => ({
        ...d,
        diffInfo: getDaysDiff(d.dataFim),
      }))
      .sort((a, b) => a.diffInfo.diff - b.diffInfo.diff)
      .slice(0, 20);
  }, [documentos, empresas, filterStatus, filterType, searchTerm]);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Alertas</p>
          <h3 className="text-lg font-semibold text-slate-800">Documentos críticos</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[#F9FAFB] border border-[#E0E3E7] rounded-xl">
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome ou empresa..."
        />
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
          <option value="TODOS">Todos os Status</option>
          <option value="VENCENDO">Apenas Vencendo</option>
          <option value="VENCIDO">Apenas Vencidos</option>
        </Select>
        <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="TODOS">Todos os Tipos</option>
          {documentoTipos.map(t => (
            <option key={t.id} value={t.nome}>
              {t.nome}
            </option>
          ))}
        </Select>
      </div>

      {alerts.length > 0 ? (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {alerts.map(alert => (
            <li
              key={alert.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[#E0E3E7] bg-[#FFF7E6] px-4 py-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#8A5B2F]">{alert.nome}</p>
                <p className="text-xs text-[#6B7480]">
                  {getEmpresaNome(alert.empresaId, empresas)} • {alert.tipo}
                </p>
                <p className="text-xs text-[#8A5B2F]">{alert.diffInfo.text}</p>
              </div>
              <Badge variant={alert.status === 'VENCIDO' ? 'danger' : 'warning'}>
                {alert.status === 'VENCIDO' ? 'Vencido' : 'Vencendo'}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">Nenhum documento crítico no momento.</p>
      )}
    </Card>
  );
};
