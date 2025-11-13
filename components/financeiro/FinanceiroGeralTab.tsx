import React, { useState, useMemo } from 'react';
import { DbData, ServicoPrestado, CatalogoServico, Cobranca } from '../../types';

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
        onDataChange,
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
        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col h-full">
            <div className="border-b border-gray-200 flex-shrink-0">
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
                {activeTab === 'nfe' && <PlaceholderTab title="Gerenciamento de Notas Fiscais" buttonText="+ Nova NFS-e" onAdd={onAddNFe}/>}
            </div>
        </div>
    );
};


// --- Sub-components for each tab ---

const ServicosPrestadosView: React.FC<any> = ({ servicosComNomes, searchTerm, setSearchTerm, onAddServico, onEditServico, onAddCobranca }) => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <input 
                type="text"
                placeholder="🔍 Buscar por serviço ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full sm:w-72"
            />
            <button onClick={onAddServico} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition">
                + Lançar Serviço
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {['Data', 'Empresa', 'Serviço', 'Valor', 'Status'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
                        <th className="relative px-4 py-2"><span className="sr-only">Ações</span></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {servicosComNomes.map((s: any) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{formatDate(s.dataRealizacao)}</td>
                            <td className="px-4 py-2 text-sm font-medium">{s.nomeEmpresa}</td>
                            <td className="px-4 py-2 text-sm">{s.nomeServico}</td>
                            <td className="px-4 py-2 text-sm">R$ {Number(s.valorCobrado).toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm">{s.status}</td>
                            <td className="px-4 py-2 text-right text-sm space-x-2">
                                <button onClick={() => onEditServico(s)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                <button onClick={onAddCobranca} className="text-blue-600 hover:text-blue-900">Gerar Cobrança</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {servicosComNomes.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum serviço encontrado.</p>}
        </div>
    </div>
);

const CatalogoView: React.FC<{catalogo: CatalogoServico[], searchTerm: string, setSearchTerm: (t: string) => void, onOpenCatalogoManager: () => void}> =
({ catalogo, searchTerm, setSearchTerm, onOpenCatalogoManager }) => (
     <div>
        <div className="flex justify-between items-center mb-4">
            <input
                type="text"
                placeholder="🔍 Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-full sm:w-72"
            />
            <button onClick={onOpenCatalogoManager} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition">
                Gerenciar Catálogo
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {['Código', 'Nome', 'Tipo', 'Preço Padrão'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {catalogo.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{s.codigoInterno || '-'}</td>
                            <td className="px-4 py-2 text-sm font-medium">{s.nome}</td>
                            <td className="px-4 py-2 text-sm">{s.tipo}</td>
                            <td className="px-4 py-2 text-sm">R$ {Number(s.precoPadrao).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {catalogo.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum serviço no catálogo.</p>}
        </div>
    </div>
);

const CobrancasView: React.FC<any> = ({ cobrancasComNomes, searchTerm, setSearchTerm, onAddCobranca, onEditCobranca }) => {
    const getStatusBadge = (status: string) => {
        const badges = {
            'PENDENTE': 'bg-yellow-100 text-yellow-800',
            'PAGA': 'bg-green-100 text-green-800',
            'VENCIDA': 'bg-red-100 text-red-800',
            'CANCELADA': 'bg-gray-100 text-gray-800'
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: string) => {
        const texts = {
            'PENDENTE': 'Pendente',
            'PAGA': 'Paga',
            'VENCIDA': 'Vencida',
            'CANCELADA': 'Cancelada'
        };
        return texts[status as keyof typeof texts] || status;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="🔍 Buscar por empresa ou status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg w-full sm:w-72"
                />
                <button onClick={onAddCobranca} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">
                    + Nova Cobrança
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Nº', 'Empresa', 'Emissão', 'Vencimento', 'Valor Total', 'Status'].map(h => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
                            <th className="relative px-4 py-2"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {cobrancasComNomes.map((c: any) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm font-mono">#{c.id}</td>
                                <td className="px-4 py-2 text-sm font-medium">{c.nomeEmpresa}</td>
                                <td className="px-4 py-2 text-sm">{formatDate(c.dataEmissao)}</td>
                                <td className="px-4 py-2 text-sm">{formatDate(c.dataVencimento)}</td>
                                <td className="px-4 py-2 text-sm font-semibold">R$ {Number(c.valorTotal).toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(c.status)}`}>
                                        {getStatusText(c.status)}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-right text-sm space-x-2">
                                    <button onClick={() => onEditCobranca(c)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {cobrancasComNomes.length === 0 && <p className="text-center py-8 text-gray-500">Nenhuma cobrança encontrada.</p>}
            </div>
        </div>
    );
};

const PlaceholderTab: React.FC<{title: string; buttonText: string; onAdd: () => void;}> = ({title, buttonText, onAdd}) => (
    <div className="text-center text-gray-500 py-16">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2">Esta funcionalidade está em desenvolvimento.</p>
        <button onClick={onAdd} className="mt-4 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition">
            {buttonText}
        </button>
    </div>
);

const SubTabButton: React.FC<{name: FinanceiroSubTab; label: string; activeTab: FinanceiroSubTab; setActiveTab: (tab: FinanceiroSubTab) => void;}> = 
({ name, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`${
            activeTab === name
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
    >
        {label}
    </button>
);