
import React, { useState, useEffect, useMemo } from 'react';
import { Empresa, Cargo, Ambiente, Risco, MasterExame, CargoAmbienteLink, CargoRiscoLink, ProtocoloExame, ManagementModalType, PcmsoConfig } from '../types';
import * as dbService from '../services/dbService';
import { generatePcmsoHtml } from '../utils/reportGenerator';

type ResourceTab = 'ambientes' | 'riscos' | 'exames';

interface PcmsoTabProps {
    empresas: Empresa[];
    cargos: Cargo[];
    ambientes: Ambiente[];
    riscos: Risco[];
    masterExames: MasterExame[];
    cargoAmbienteLinks: CargoAmbienteLink[];
    cargoRiscoLinks: CargoRiscoLink[];
    protocolosExames: ProtocoloExame[];
    onDataChange: () => void;
    onOpenManagementModal: (modal: ManagementModalType) => void;
}

export const PcmsoTab: React.FC<PcmsoTabProps> = (props) => {
    const { 
        empresas,
        cargos, 
        ambientes, 
        riscos, 
        masterExames, 
        cargoAmbienteLinks, 
        cargoRiscoLinks, 
        protocolosExames, 
        onDataChange,
        onOpenManagementModal
    } = props;

    const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);
    const [selectedCargoId, setSelectedCargoId] = useState<number | null>(null);
    const [descricaoAtividades, setDescricaoAtividades] = useState('');
    const [resourceTab, setResourceTab] = useState<ResourceTab>('ambientes');
    const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);

    useEffect(() => {
        if (empresas.length > 0 && !selectedEmpresaId) {
            setSelectedEmpresaId(empresas[0].id);
        }
    }, [empresas, selectedEmpresaId]);
    
    const selectedEmpresa = useMemo(() => empresas.find(e => e.id === selectedEmpresaId), [empresas, selectedEmpresaId]);
    const selectedCargo = cargos.find(c => c.id === selectedCargoId);

    useEffect(() => {
        if (selectedCargo) {
            setDescricaoAtividades(selectedCargo.descricao_atividades || '');
        } else {
            setDescricaoAtividades('');
        }
        setSelectedResourceId(null); // Reset selection when cargo changes
    }, [selectedCargo]);

    useEffect(() => {
        setSelectedCargoId(null);
    }, [selectedEmpresaId]);

    const handleGeneratePcmso = () => {
        if (!selectedEmpresa) {
            alert("Por favor, selecione uma empresa para gerar o PCMSO.");
            return;
        }

        const pcmsoConfig: PcmsoConfig = {
            empresa_nome: selectedEmpresa.nomeFantasia,
            cnpj: selectedEmpresa.cnpj,
            medico_nome: selectedEmpresa.medico_nome,
            medico_crm: selectedEmpresa.medico_crm,
            inicio_validade: selectedEmpresa.inicio_validade,
            revisar_ate: selectedEmpresa.revisar_ate
        };

        const fullData = {
            cargos,
            riscos,
            masterExames,
            cargoRiscoLinks,
            protocolosExames,
            pcmsoConfig
        };
        generatePcmsoHtml(fullData);
    };

    const handleLinkResource = () => {
        if (!selectedCargoId || selectedResourceId === null) {
            alert("Selecione um cargo e um recurso da biblioteca para vincular.");
            return;
        }

        switch(resourceTab) {
            case 'ambientes':
                dbService.cargoAmbienteLinkService.add({ cargo_id: selectedCargoId, ambiente_id: selectedResourceId });
                break;
            case 'riscos':
                dbService.cargoRiscoLinkService.add({ cargo_id: selectedCargoId, risco_id: selectedResourceId });
                break;
            case 'exames':
                dbService.protocoloExameService.add({ 
                    cargo_id: selectedCargoId, 
                    exame_id: selectedResourceId,
                    fazer_admissional: false,
                    fazer_periodico: true,
                    fazer_demissional: false,
                    retorno_trabalho: false,
                    mudanca_risco: false,
                    periodicidade_detalhe: 'Anual'
                });
                break;
        }
        onDataChange();
        setSelectedResourceId(null);
    };

    const handleUnlinkResource = (linkId: number, type: ResourceTab) => {
         if (window.confirm("Tem certeza que deseja remover este vínculo?")) {
            switch(type) {
                case 'ambientes': dbService.cargoAmbienteLinkService.remove(linkId); break;
                case 'riscos': dbService.cargoRiscoLinkService.remove(linkId); break;
                case 'exames': dbService.protocoloExameService.remove(linkId); break;
            }
            onDataChange();
        }
    };
    
    const linkedAmbientes = useMemo(() => cargoAmbienteLinks
        .filter(l => l.cargo_id === selectedCargoId)
        .map(l => ({ ...ambientes.find(a => a.id === l.ambiente_id)!, linkId: l.id })), 
        [cargoAmbienteLinks, ambientes, selectedCargoId]);

    const linkedRiscos = useMemo(() => cargoRiscoLinks
        .filter(l => l.cargo_id === selectedCargoId)
        .map(l => ({ ...riscos.find(r => r.id === l.risco_id)!, linkId: l.id })),
        [cargoRiscoLinks, riscos, selectedCargoId]);

    const linkedExames = useMemo(() => protocolosExames
        .filter(p => p.cargo_id === selectedCargoId)
        .map(p => ({ ...masterExames.find(e => e.id === p.exame_id)!, protocolo: p })),
        [protocolosExames, masterExames, selectedCargoId]);


    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
             <div className="flex-shrink-0 bg-gray-50 p-3 rounded-t-lg border-b">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold mr-4">Gerenciamento:</h3>
                    <button onClick={() => onOpenManagementModal('cargos')} className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">👔 Gerenciar Cargos</button>
                    <button onClick={() => onOpenManagementModal('ambientes')} className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200">🏢 Gerenciar Ambientes</button>
                    <button onClick={() => onOpenManagementModal('riscos')} className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200">⚠️ Gerenciar Riscos</button>
                    <button onClick={() => onOpenManagementModal('exames')} className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200">🔬 Gerenciar Exames</button>
                    <div className="flex-grow"></div>
                    <button onClick={handleGeneratePcmso} disabled={!selectedEmpresa} className="px-4 py-1.5 text-sm bg-emerald-500 text-white rounded-md hover:bg-emerald-600 font-semibold disabled:bg-gray-400">📄 Gerar PCMSO (PDF)</button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 h-full flex-grow p-4">
                {/* Left Pane */}
                <div className="lg:w-1/4 bg-gray-50 p-3 rounded-lg border flex flex-col">
                    <h3 className="font-bold mb-2 text-gray-700 text-center">1. Selecione a Empresa</h3>
                    <select
                        value={selectedEmpresaId ?? ''}
                        onChange={(e) => setSelectedEmpresaId(Number(e.target.value))}
                        className="p-2 border border-gray-300 rounded-lg font-semibold mb-4 w-full"
                        aria-label="Selecionar Empresa"
                    >
                        {empresas.length === 0 && <option>Nenhuma empresa</option>}
                        {empresas.map(e => <option key={e.id} value={e.id}>{e.nomeFantasia}</option>)}
                    </select>

                    <h3 className="font-bold mb-2 text-gray-700 text-center">2. Selecione um Cargo</h3>
                    <div className="overflow-y-auto flex-grow">
                        <ul className="space-y-1">
                        {cargos.map(cargo => (
                            <li key={cargo.id}>
                            <button 
                                onClick={() => setSelectedCargoId(cargo.id)}
                                disabled={!selectedEmpresaId}
                                className={`w-full text-left p-2 rounded-md text-sm transition ${selectedCargoId === cargo.id ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'hover:bg-gray-100 disabled:bg-transparent disabled:text-gray-400'}`}
                            >
                                {cargo.nome_padronizado}
                            </button>
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>

                {/* Center Pane */}
                <div className="lg:w-1/2 bg-white p-4 rounded-lg border shadow-inner flex flex-col">
                    <h3 className="font-bold mb-4 text-gray-700 flex-shrink-0">3. Detalhes do Cargo: <span className="text-indigo-600">{selectedCargo?.nome_padronizado || 'Nenhum selecionado'}</span></h3>
                    {selectedCargo ? (
                        <div className="flex-grow overflow-y-auto">
                            <details open className="mb-4">
                                <summary className="font-semibold cursor-pointer">Dados Gerais</summary>
                                <div className="p-2 space-y-2">
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700">Código CBO</label>
                                        <input type="text" readOnly value={selectedCargo.cbo_codigo || 'N/A'} className="mt-1 block w-full p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Descrição das Atividades</label>
                                        <textarea value={descricaoAtividades} readOnly rows={6} className="mt-1 block w-full p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"/>
                                    </div>
                                </div>
                            </details>
                            
                            <details className="mb-4" open>
                                <summary className="font-semibold cursor-pointer">Recursos Vinculados</summary>
                                <div className="p-2 space-y-4">
                                    <ResourceList title="🏢 Ambientes" items={linkedAmbientes} onUnlink={(id) => handleUnlinkResource(id, 'ambientes')} displayKey="nome"/>
                                    <ResourceList title="⚠️ Riscos" items={linkedRiscos} onUnlink={(id) => handleUnlinkResource(id, 'riscos')} displayKey="nome"/>
                                    <ResourceList title="🔬 Exames (Protocolo)" items={linkedExames.map(e => ({...e, nome: e.nome_exame, linkId: e.protocolo.id}))} onUnlink={(id) => handleUnlinkResource(id, 'exames')} displayKey="nome"/>
                                </div>
                            </details>

                        </div>
                    ) : <p className="text-gray-500 mt-4">Selecione uma empresa e um cargo para ver os detalhes.</p>}
                </div>

                {/* Right Pane */}
                <div className="lg:w-1/4 bg-gray-50 p-3 rounded-lg border flex flex-col">
                    <h3 className="font-bold mb-2 text-gray-700 text-center">4. Biblioteca de Recursos</h3>
                    <div className="flex border-b mb-2">
                        {(['ambientes', 'riscos', 'exames'] as ResourceTab[]).map(tab => (
                            <button key={tab} onClick={() => { setResourceTab(tab); setSelectedResourceId(null); }} className={`flex-1 text-sm py-2 px-1 capitalize ${resourceTab === tab ? 'border-b-2 border-indigo-500 text-indigo-600 font-semibold' : 'text-gray-500'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="overflow-y-auto flex-grow">
                        <ul className="space-y-1">
                            {resourceTab === 'ambientes' && ambientes.map(item => <ResourceItem key={item.id} item={item} selectedId={selectedResourceId} onSelect={setSelectedResourceId} displayKey="nome" />)}
                            {resourceTab === 'riscos' && riscos.map(item => <ResourceItem key={item.id} item={item} selectedId={selectedResourceId} onSelect={setSelectedResourceId} displayKey="nome" />)}
                            {resourceTab === 'exames' && masterExames.map(item => <ResourceItem key={item.id} item={item} selectedId={selectedResourceId} onSelect={setSelectedResourceId} displayKey="nome_exame" />)}
                        </ul>
                    </div>
                    <button onClick={handleLinkResource} disabled={!selectedCargoId || selectedResourceId === null} className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                       ⬅️ Adicionar ao Cargo
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResourceList = ({ title, items, onUnlink, displayKey }: {title: string, items: any[], onUnlink: (linkId: number) => void, displayKey: string}) => (
    <div>
        <h4 className="font-medium text-sm text-gray-600">{title}</h4>
        {items.length > 0 ? (
            <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
                {items.map(item => (
                    <li key={item.linkId} className="flex justify-between items-center">
                        <span>{item[displayKey]}</span>
                        <button onClick={() => onUnlink(item.linkId)} className="text-red-500 hover:text-red-700 text-xs">Remover</button>
                    </li>
                ))}
            </ul>
        ) : <p className="text-xs text-gray-400 mt-1">Nenhum item vinculado.</p>}
    </div>
);

interface ResourceItemProps {
    item: any;
    selectedId: number | null;
    onSelect: (id: number) => void;
    displayKey: string;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ item, selectedId, onSelect, displayKey }) => (
    <li>
        <button 
            onClick={() => onSelect(item.id)}
            className={`w-full text-left p-2 rounded-md text-sm transition ${selectedId === item.id ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-200'}`}
        >
            {item[displayKey]}
        </button>
    </li>
);