import React, { useState, useMemo } from 'react';
import { Empresa, DbData, User } from '../types';
import { GerenciadorDocumentos } from './GerenciadorDocumentos';

interface EmpresasTabProps {
    data: DbData;
    currentUser: User;
    onAdd: () => void;
    onEdit: (empresa: Empresa) => void;
    onAddDocument: (empresa: Empresa, pastaId: number | null) => void;
    onEditDocument: (empresa: Empresa, pastaId: number | null, documento: any) => void;
    onAddPasta: (empresaId: number, parentId: number | null, pasta?: any) => void;
    onDataChange: () => void;
    setConfirmation: (confirmation: any) => void;
}

type DetailTab = 'info' | 'docs';

export const EmpresasTab: React.FC<EmpresasTabProps> = (props) => {
    const { data, currentUser, onAdd, onEdit, onAddDocument, onEditDocument, onAddPasta, onDataChange, setConfirmation } = props;
    const { empresas } = data;

    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(empresas[0] || null);
    const [activeTab, setActiveTab] = useState<DetailTab>('info');
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleSelectEmpresa = (empresa: Empresa) => {
        setSelectedEmpresa(empresa);
        setActiveTab('info');
    }

    const filteredEmpresas = useMemo(() => {
        if (!searchTerm) return empresas;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return (empresas || []).filter(e => 
            e.nomeFantasia.toLowerCase().includes(lowerCaseSearch) ||
            e.razaoSocial.toLowerCase().includes(lowerCaseSearch) ||
            e.cnpj.includes(searchTerm)
        );
    }, [empresas, searchTerm]);

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Left Pane: Company List */}
            <div className="md:w-1/3 bg-white p-4 rounded-xl shadow-md flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-800">Empresas ({filteredEmpresas.length})</h2>
                    <button onClick={onAdd} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition text-sm">
                        + Nova
                    </button>
                </div>
                 <div className="mb-4">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nome ou CNPJ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>
                <div className="overflow-y-auto flex-grow">
                    <ul className="space-y-2">
                        {filteredEmpresas.map(empresa => (
                            <li key={empresa.id}>
                                <button
                                    onClick={() => handleSelectEmpresa(empresa)}
                                    className={`w-full text-left p-3 rounded-lg transition ${selectedEmpresa?.id === empresa.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-50'}`}
                                >
                                    {empresa.nomeFantasia}
                                </button>
                            </li>
                        ))}
                         {filteredEmpresas.length === 0 && <p className="text-center text-gray-500 py-8">Nenhuma empresa encontrada.</p>}
                    </ul>
                </div>
            </div>

            {/* Right Pane: Company Details */}
            <div className="md:w-2/3 bg-white p-4 rounded-xl shadow-md flex flex-col">
                {selectedEmpresa ? (
                    <>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedEmpresa.nomeFantasia}</h2>
                                <p className="text-sm text-gray-500">{selectedEmpresa.razaoSocial}</p>
                            </div>
                            <button onClick={() => onEdit(selectedEmpresa)} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm">
                                Editar
                            </button>
                        </div>

                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <TabButton name="info" label="Informações" activeTab={activeTab} setActiveTab={setActiveTab} />
                                <TabButton name="docs" label="Documentos" activeTab={activeTab} setActiveTab={setActiveTab} />
                            </nav>
                        </div>
                        
                        <div className="pt-5 flex-grow overflow-y-auto">
                            {activeTab === 'info' && <InfoTab empresa={selectedEmpresa} />}
                            {activeTab === 'docs' && 
                                <GerenciadorDocumentos 
                                    empresa={selectedEmpresa} 
                                    documentos={data.documentosEmpresa}
                                    pastas={data.pastas}
                                    users={data.users}
                                    currentUser={currentUser}
                                    onAddDocument={onAddDocument}
                                    onEditDocument={onEditDocument} 
                                    onAddPasta={onAddPasta}
                                    onDataChange={onDataChange} 
                                    setConfirmation={setConfirmation}
                                />}
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500 text-lg">Selecione uma empresa ou cadastre uma nova.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const InfoTab: React.FC<{empresa: Empresa}> = ({empresa}) => (
    <div className="space-y-4">
        <DetailItem label="CNPJ" value={empresa.cnpj} />
        <DetailItem label="Endereço" value={empresa.endereco} />
        <DetailItem label="Contato" value={`${empresa.contatoNome || ''} - ${empresa.contatoTelefone || ''} - ${empresa.contatoEmail || ''}`} />
        <DetailItem label="Dia Padrão de Vencimento" value={empresa.diaPadraoVencimento ? `Dia ${empresa.diaPadraoVencimento}` : 'Não definido'} />
         <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Responsável PCMSO</h3>
            <DetailItem label="Médico" value={empresa.medico_nome} />
            <DetailItem label="CRM" value={empresa.medico_crm} />
        </div>
    </div>
);

const DetailItem: React.FC<{label: string, value?: string | null}> = ({label, value}) => (
    <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-md text-gray-800">{value || 'Não informado'}</p>
    </div>
);

const TabButton: React.FC<{name: DetailTab; label: string; activeTab: DetailTab; setActiveTab: (tab: DetailTab) => void;}> = ({ name, label, activeTab, setActiveTab }) => (
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
