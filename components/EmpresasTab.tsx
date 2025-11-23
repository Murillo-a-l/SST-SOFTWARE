import React, { useState, useMemo } from 'react';
import { Empresa, DbData, User } from '../types';
import { GerenciadorDocumentos } from './GerenciadorDocumentos';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { SectionHeader } from '../src/components/ui/SectionHeader';

interface EmpresasTabProps {
    data: DbData;
    currentUser: User;
    onAdd: () => void;
    onEdit: (empresa: Empresa) => void;
    onDelete: (empresa: Empresa) => void;
    onAddDocument: (empresa: Empresa, pastaId: number | null) => void;
    onEditDocument: (empresa: Empresa, pastaId: number | null, documento: any) => void;
    onAddPasta: (empresaId: number, parentId: number | null, pasta?: any) => void;
    onDataChange: () => void;
    setConfirmation: (confirmation: any) => void;
    onOpenSignature?: (documento: any) => void;
}

type DetailTab = 'info' | 'docs';

export const EmpresasTab: React.FC<EmpresasTabProps> = (props) => {
    const { data, currentUser, onAdd, onEdit, onDelete, onAddDocument, onEditDocument, onAddPasta, onDataChange, setConfirmation, onOpenSignature } = props;
    const { empresas } = data;

    const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(empresas[0] || null);
    const [activeTab, setActiveTab] = useState<DetailTab>('info');
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleSelectEmpresa = (empresa: Empresa) => {
        setSelectedEmpresa(empresa);
        setActiveTab('info');
    };

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
        <div className="space-y-4">
            <SectionHeader label="Empresas" title="Gestao de Clientes" />
            <div className="flex flex-col md:flex-row gap-6 h-full">
                <Card className="md:w-1/3 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-semibold text-slate-800">Empresas ({filteredEmpresas.length})</h2>
                        <Button size="sm" onClick={onAdd}>+ Nova</Button>
                    </div>
                    <div className="mb-4">
                        <Input
                            type="text"
                            placeholder="Buscar por nome ou CNPJ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="overflow-y-auto flex-grow">
                        <ul className="space-y-2">
                            {filteredEmpresas.map(empresa => (
                                <li key={empresa.id}>
                                    <button
                                        onClick={() => handleSelectEmpresa(empresa)}
                                        className={`w-full text-left p-3 rounded-lg transition ${selectedEmpresa?.id === empresa.id ? 'bg-[#E8ECF0] text-[#2F5C8C] font-semibold' : 'hover:bg-[#F1F3F5]'}`}
                                    >
                                        {empresa.nomeFantasia}
                                    </button>
                                </li>
                            ))}
                            {filteredEmpresas.length === 0 && <p className="text-center text-slate-500 py-8">Nenhuma empresa encontrada.</p>}
                        </ul>
                    </div>
                </Card>

                <Card className="md:w-2/3 flex flex-col">
                    {selectedEmpresa ? (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Empresa</p>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedEmpresa.nomeFantasia}</h2>
                                    <p className="text-sm text-slate-500">{selectedEmpresa.razaoSocial}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => onEdit(selectedEmpresa)}>Editar</Button>
                                    <Button variant="danger" size="sm" onClick={() => onDelete(selectedEmpresa)}>Excluir</Button>
                                </div>
                            </div>

                            <div className="border-b border-[#D5D8DC]">
                                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                    <TabButton name="info" label="Informacoes" activeTab={activeTab} setActiveTab={setActiveTab} />
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
                                        onOpenSignature={onOpenSignature}
                                    />}
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-slate-500 text-sm">Selecione uma empresa ou cadastre uma nova.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

const InfoTab: React.FC<{empresa: Empresa}> = ({empresa}) => (
    <div className="space-y-4">
        <DetailItem label="CNPJ" value={empresa.cnpj} />
        <DetailItem label="Endereco" value={empresa.endereco} />
        <DetailItem label="Contato" value={`${empresa.contatoNome || ''} - ${empresa.contatoTelefone || ''} - ${empresa.contatoEmail || ''}`} />
        <DetailItem label="Dia Padrao de Vencimento" value={empresa.diaPadraoVencimento ? `Dia ${empresa.diaPadraoVencimento}` : 'Nao definido'} />
        <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-slate-700 mb-2">Responsavel PCMSO</h3>
            <DetailItem label="Medico" value={empresa.medicoNome} />
            <DetailItem label="CRM" value={empresa.medicoCrm} />
        </div>
    </div>
);

const DetailItem: React.FC<{label: string, value?: string | null}> = ({label, value}) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-md text-slate-800">{value || 'Nao informado'}</p>
    </div>
);

const TabButton: React.FC<{name: DetailTab; label: string; activeTab: DetailTab; setActiveTab: (tab: DetailTab) => void;}> = ({ name, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`${
            activeTab === name
                ? 'border-[#3A6EA5] text-[#2F5C8C]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
    >
        {label}
    </button>
);
