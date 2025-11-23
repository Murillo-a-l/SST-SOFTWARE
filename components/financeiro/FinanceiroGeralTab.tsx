import React, { useState, useMemo } from 'react';
import { DbData, ServicoPrestado, CatalogoServico, Cobranca } from '../../types';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { TableShell, tableHeaderCell, tableCell } from '../../src/components/ui/TableShell';
import { SectionHeader } from '../../src/components/ui/SectionHeader';

interface FinanceiroGeralTabProps {
  data: DbData;
  servicosPrestados: ServicoPrestado[];
  cobrancas: Cobranca[];
  onDataChange: () => void;
  onAddServico: () => void;
  onEditServico: (servico: ServicoPrestado) => void;
  onAddCobranca: () => void;
  onEditCobranca: (cobranca: Cobranca) => void;
  onAddNFe: () => void;
  onOpenCatalogoManager: (initialName?: string) => void;
}

type FinanceiroSubTab = 'servicos' | 'catalogo' | 'cobrancas' | 'nfe';

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

export const FinanceiroGeralTab: React.FC<FinanceiroGeralTabProps> = (props) => {
  const {
    data,
    servicosPrestados,
    cobrancas,
    onAddServico,
    onEditServico,
    onAddCobranca,
    onEditCobranca,
    onAddNFe,
    onOpenCatalogoManager,
  } = props;

  const [activeTab, setActiveTab] = useState<FinanceiroSubTab>('servicos');
  const [searchTerm, setSearchTerm] = useState('');

  const servicosComNomes = useMemo(() => {
    return servicosPrestados
      .map(servico => {
        const empresa = (data.empresas || []).find(e => e.id === servico.empresaId);
        const servicoCatalogo = (data.catalogoServicos || []).find(cs => cs.id === servico.servicoId);
        return {
          ...servico,
          nomeEmpresa: empresa?.nomeFantasia || 'N/A',
          nomeServico: servicoCatalogo?.nome || 'N/A',
        };
      })
      .filter(s =>
        s.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nomeServico.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [servicosPrestados, data.empresas, data.catalogoServicos, searchTerm]);

  const filteredCatalogo = useMemo(() => {
    return (data.catalogoServicos || []).filter(s =>
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.catalogoServicos, searchTerm]);

  const cobrancasComNomes = useMemo(() => {
    return cobrancas
      .map(cobranca => {
        const empresa = (data.empresas || []).find(e => e.id === cobranca.empresaId);
        return {
          ...cobranca,
          nomeEmpresa: empresa?.nomeFantasia || 'N/A',
        };
      })
      .filter(c =>
        c.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [cobrancas, data.empresas, searchTerm]);

  return (
    <div className="space-y-4">
      <SectionHeader label="Financeiro" title="Visão Geral" />
      <Card className="flex flex-col">
        <div className="border-b border-[#D5D8DC] flex-shrink-0 px-2">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <SubTabButton name="servicos" label="Serviços Prestados" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SubTabButton name="catalogo" label="Catálogo" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SubTabButton name="cobrancas" label="Cobranças" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SubTabButton name="nfe" label="Notas Fiscais" activeTab={activeTab} setActiveTab={setActiveTab} />
          </nav>
        </div>
        <div className="pt-5 flex-grow overflow-y-auto">
          {activeTab === 'servicos' && (
            <ServicosPrestadosView
              servicosComNomes={servicosComNomes}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddServico={onAddServico}
              onEditServico={onEditServico}
              onAddCobranca={onAddCobranca}
            />
          )}
          {activeTab === 'catalogo' && (
            <CatalogoView
              catalogo={filteredCatalogo}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onOpenCatalogoManager={onOpenCatalogoManager}
            />
          )}
          {activeTab === 'cobrancas' && (
            <CobrancasView
              cobrancasComNomes={cobrancasComNomes}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddCobranca={onAddCobranca}
              onEditCobranca={onEditCobranca}
            />
          )}
          {activeTab === 'nfe' && <PlaceholderTab title="Gerenciamento de Notas Fiscais" buttonText="+ Nova NFS-e" onAdd={onAddNFe} />}
        </div>
      </Card>
    </div>
  );
};

// --- Sub-components for each tab ---

const SubTabButton: React.FC<{ name: FinanceiroSubTab; label: string; activeTab: FinanceiroSubTab; setActiveTab: (t: FinanceiroSubTab) => void }> = ({ name, label, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(name)}
    className={`${
      activeTab === name
        ? 'border-b-2 border-[#3A6EA5] text-[#2F5C8C]'
        : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
    } whitespace-nowrap py-3 px-1 font-medium text-sm`}
  >
    {label}
  </button>
);

const ServicosPrestadosView: React.FC<any> = ({ servicosComNomes, searchTerm, setSearchTerm, onAddServico, onEditServico, onAddCobranca }) => (
  <div className="space-y-3">
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
      <Input
        type="text"
        placeholder="Buscar por serviço ou empresa..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:w-72"
      />
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button variant="secondary" onClick={onAddCobranca}>+ Gerar Cobrança</Button>
        <Button onClick={onAddServico}>+ Lançar Serviço</Button>
      </div>
    </div>
    <TableShell>
      <thead className="bg-[#F1F3F5]">
        <tr>
          {['Data', 'Empresa', 'Serviço', 'Valor', 'Status'].map(h => <th key={h} className={tableHeaderCell}>{h}</th>)}
          <th className={tableHeaderCell}><span className="sr-only">Ações</span></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#E0E3E7]">
        {servicosComNomes.map((s: any) => (
          <tr key={s.id} className="hover:bg-[#F8FAFC]">
            <td className={`${tableCell} whitespace-nowrap`}>{formatDate(s.dataRealizacao)}</td>
            <td className={`${tableCell} whitespace-nowrap font-medium`}>{s.nomeEmpresa}</td>
            <td className={`${tableCell} whitespace-nowrap`}>{s.nomeServico}</td>
            <td className={`${tableCell} whitespace-nowrap`}>R$ {Number(s.valorCobrado).toFixed(2)}</td>
            <td className={`${tableCell} whitespace-nowrap`}>{s.status}</td>
            <td className={`${tableCell} whitespace-nowrap text-right`}>
              <div className="flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => onEditServico(s)}>Editar</Button>
                <Button variant="ghost" size="sm" onClick={onAddCobranca}>Cobrar</Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
    {servicosComNomes.length === 0 && <p className="text-center py-6 text-slate-500">Nenhum serviço encontrado.</p>}
  </div>
);

const CatalogoView: React.FC<{ catalogo: CatalogoServico[]; searchTerm: string; setSearchTerm: (t: string) => void; onOpenCatalogoManager: () => void }> =
({ catalogo, searchTerm, setSearchTerm, onOpenCatalogoManager }) => (
  <div className="space-y-3">
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
      <Input
        type="text"
        placeholder="Buscar por nome ou código..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:w-72"
      />
      <Button onClick={onOpenCatalogoManager}>Gerenciar Catálogo</Button>
    </div>
    <TableShell>
      <thead className="bg-[#F1F3F5]">
        <tr>
          {['Código', 'Nome', 'Tipo', 'Preço Padrão'].map(h => <th key={h} className={tableHeaderCell}>{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#E0E3E7]">
        {catalogo.map(s => (
          <tr key={s.id} className="hover:bg-[#F8FAFC]">
            <td className={tableCell}>{s.codigoInterno || '-'}</td>
            <td className={`${tableCell} font-medium`}>{s.nome}</td>
            <td className={tableCell}>{s.tipo}</td>
            <td className={tableCell}>R$ {Number(s.precoPadrao).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
    {catalogo.length === 0 && <p className="text-center py-6 text-slate-500">Nenhum serviço no catálogo.</p>}
  </div>
);

const CobrancasView: React.FC<any> = ({ cobrancasComNomes, searchTerm, setSearchTerm, onAddCobranca, onEditCobranca }) => {
  const getStatusBadge = (status: string) => {
    const badges = {
      'PENDENTE': 'warning',
      'PAGA': 'success',
      'VENCIDA': 'danger',
      'CANCELADA': 'neutral',
    } as const;
    return badges[status as keyof typeof badges] || 'neutral';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'PENDENTE': 'Pendente',
      'PAGA': 'Paga',
      'VENCIDA': 'Vencida',
      'CANCELADA': 'Cancelada',
    } as const;
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <Input
          type="text"
          placeholder="Buscar por empresa ou status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-72"
        />
        <Button onClick={onAddCobranca}>+ Nova Cobrança</Button>
      </div>
      <TableShell>
        <thead className="bg-[#F1F3F5]">
          <tr>
            {['Empresa', 'Data Emissão', 'Vencimento', 'Valor', 'Status'].map(h => <th key={h} className={tableHeaderCell}>{h}</th>)}
            <th className={tableHeaderCell}><span className="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E0E3E7]">
          {cobrancasComNomes.map((c: any) => (
            <tr key={c.id} className="hover:bg-[#F8FAFC]">
              <td className={`${tableCell} whitespace-nowrap font-medium`}>{c.nomeEmpresa}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{formatDate(c.dataEmissao)}</td>
              <td className={`${tableCell} whitespace-nowrap`}>{formatDate(c.dataVencimento)}</td>
              <td className={`${tableCell} whitespace-nowrap`}>R$ {Number(c.valorTotal).toFixed(2)}</td>
              <td className={`${tableCell} whitespace-nowrap`}>
                <Badge variant={getStatusBadge(c.status)}>{getStatusText(c.status)}</Badge>
              </td>
              <td className={`${tableCell} whitespace-nowrap text-right`}>
                <Button variant="secondary" size="sm" onClick={() => onEditCobranca(c)}>Editar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
      {cobrancasComNomes.length === 0 && <p className="text-center py-6 text-slate-500">Nenhuma cobrança encontrada.</p>}
    </div>
  );
};

const PlaceholderTab: React.FC<{ title: string; buttonText: string; onAdd: () => void }> = ({ title, buttonText, onAdd }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <Button onClick={onAdd}>{buttonText}</Button>
    </div>
    <Card className="text-sm text-slate-600">Em breve: listagem e gestão de NF-e.</Card>
  </div>
);
