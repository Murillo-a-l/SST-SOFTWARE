// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Empresa, Cargo, Ambiente, Risco, MasterExame, CargoAmbienteLink, CargoRiscoLink, ProtocoloExame, ManagementModalType, PcmsoConfig } from '../types';
import { cargoAmbienteLinkService, cargoRiscoLinkService, protocolosExames, ambienteService, riscoService } from '../services/dbService';
import { generatePcmsoHtml } from '../utils/reportGenerator';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { SectionHeader } from '../src/components/ui/SectionHeader';
import { CatalystCombobox } from './ui/CatalystCombobox';

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

    const empresaOptions = useMemo(() =>
        empresas.map(e => ({ value: e.id, label: e.nomeFantasia })),
        [empresas]
    );

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
        setSelectedResourceId(null);
    }, [selectedCargo]);

    useEffect(() => {
        setSelectedCargoId(null);
    }, [selectedEmpresaId]);

    const handleGeneratePcmso = () => {
        if (!selectedEmpresa) {
            toast.error("Por favor, selecione uma empresa para gerar o PCMSO.");
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

        const html = generatePcmsoHtml(
            pcmsoConfig,
            cargos,
            ambientes,
            riscos,
            masterExames,
            cargoAmbienteLinks,
            cargoRiscoLinks,
            protocolosExames
        );

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(html);
            win.document.close();
            win.focus();
        } else {
            toast.error("N�o foi poss�vel abrir a nova guia para gerar o PCMSO.");
        }
    };

    const linkedAmbientes = useMemo(() => {
        if (!selectedCargoId) return [];
        return cargoAmbienteLinks
            .filter(link => link.cargo_id === selectedCargoId)
            .map(link => ({
                ...ambientes.find(a => a.id === link.ambiente_id),
                linkId: link.id
            }))
            .filter(Boolean);
    }, [selectedCargoId, cargoAmbienteLinks, ambientes]);

    const linkedRiscos = useMemo(() => {
        if (!selectedCargoId) return [];
        return cargoRiscoLinks
            .filter(link => link.cargo_id === selectedCargoId)
            .map(link => ({
                ...riscos.find(r => r.id === link.risco_id),
                linkId: link.id
            }))
            .filter(Boolean);
    }, [selectedCargoId, cargoRiscoLinks, riscos]);

    const linkedExames = useMemo(() => {
        if (!selectedCargoId) return [];
        return protocolosExames
            .filter(p => p.cargo_id === selectedCargoId)
            .map(p => ({
                ...masterExames.find(e => e.id === p.exame_id),
                protocolo: p
            }))
            .filter(Boolean);
    }, [selectedCargoId, protocolosExames, masterExames]);

    const handleLinkResource = () => {
        if (!selectedCargoId || selectedResourceId === null) return;

        try {
            if (resourceTab === 'ambientes') {
                const all = cargoAmbienteLinkService.getAll();
                const newId = all.length > 0 ? Math.max(...all.map((l: any) => l.id)) + 1 : 1;
                cargoAmbienteLinkService.add({ cargo_id: selectedCargoId, ambiente_id: selectedResourceId, id: newId } as any);
            } else if (resourceTab === 'riscos') {
                const all = cargoRiscoLinkService.getAll();
                const newId = all.length > 0 ? Math.max(...all.map((l: any) => l.id)) + 1 : 1;
                cargoRiscoLinkService.add({ cargo_id: selectedCargoId, risco_id: selectedResourceId, id: newId } as any);
            } else if (resourceTab === 'exames') {
                const all = protocolosExames.getAll();
                const newId = all.length > 0 ? Math.max(...all.map((l: any) => l.id)) + 1 : 1;
                protocolosExames.add({
                    id: newId,
                    cargo_id: selectedCargoId,
                    exame_id: selectedResourceId,
                    fazer_admissional: true,
                    fazer_periodico: true,
                    fazer_demissional: true,
                    retorno_trabalho: true,
                    mudanca_risco: true,
                    periodicidade_detalhe: null,
                });
            }
            toast.success("Recurso vinculado com sucesso!");
            onDataChange();
            setSelectedResourceId(null);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao vincular recurso. Tente novamente.");
        }
    };

    const handleUnlinkResource = (linkId: number, type: ResourceTab) => {
        if (type === 'ambientes') {
            cargoAmbienteLinkService.remove(linkId);
        } else if (type === 'riscos') {
            cargoRiscoLinkService.remove(linkId);
        } else {
            protocolosExames.remove(linkId);
        }
        toast.success(`${type === 'exames' ? 'Exame' : type === 'ambientes' ? 'Ambiente' : 'Risco'} removido do cargo.`);
        onDataChange();
    };

    return (
        <div className="space-y-4">
            <SectionHeader
                label="PCMSO"
                title="Gestao de protocolos"
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => onOpenManagementModal('ambientes')}>Gerenciar Ambientes</Button>
                        <Button variant="secondary" size="sm" onClick={() => onOpenManagementModal('riscos')}>Gerenciar Riscos</Button>
                        <Button variant="secondary" size="sm" onClick={() => onOpenManagementModal('masterExames')}>Gerenciar Exames</Button>
                        <Button size="sm" onClick={handleGeneratePcmso}>Gerar PCMSO</Button>
                    </div>
                }
            />

            <Card className="flex flex-col lg:flex-row gap-4 h-full">
                <div className="lg:w-1/4 bg-[#F9FAFB] p-3 rounded-lg border border-[#E0E3E7] flex flex-col">
                    <h3 className="font-semibold mb-2 text-slate-700 text-center">1. Selecione a Empresa</h3>
                    <CatalystCombobox
                        options={empresaOptions}
                        value={selectedEmpresaId}
                        onChange={(value) => setSelectedEmpresaId(Number(value))}
                        placeholder="Selecione..."
                        className="mb-4"
                    />

                    <h3 className="font-semibold mb-2 text-slate-700 text-center">2. Selecione um Cargo</h3>
                    <div className="overflow-y-auto flex-grow">
                        <ul className="space-y-1">
                        {cargos.map(cargo => (
                            <li key={cargo.id}>
                            <button 
                                onClick={() => setSelectedCargoId(cargo.id)}
                                disabled={!selectedEmpresaId}
                                className={`w-full text-left p-2 rounded-md text-sm transition ${selectedCargoId === cargo.id ? 'bg-[#E8ECF0] text-[#2F5C8C] font-semibold' : 'hover:bg-[#F1F3F5] disabled:bg-transparent disabled:text-slate-400'}`}
                            >
                                {cargo.nome_padronizado}
                            </button>
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>

                <div className="lg:w-1/2 bg-white p-4 rounded-lg border border-[#E0E3E7] flex flex-col">
                    <h3 className="font-semibold mb-4 text-slate-700 flex-shrink-0">3. Detalhes do Cargo: <span className="text-[#2F5C8C]">{selectedCargo?.nome_padronizado || 'Nenhum selecionado'}</span></h3>
                    {selectedCargo ? (
                        <div className="flex-grow overflow-y-auto">
                            <details open className="mb-4">
                                <summary className="font-semibold cursor-pointer">Dados Gerais</summary>
                                <div className="p-2 space-y-2">
                                     <div>
                                        <label className="block text-sm font-medium text-slate-700">Codigo CBO</label>
                                        <input type="text" readOnly value={selectedCargo.cbo_codigo || 'N/A'} className="mt-1 block w-full p-2 bg-[#F9FAFB] border border-[#D5D8DC] rounded-md shadow-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Descricao das Atividades</label>
                                        <textarea value={descricaoAtividades} readOnly rows={6} className="mt-1 block w-full p-2 bg-[#F9FAFB] border border-[#D5D8DC] rounded-md shadow-sm"/>
                                    </div>
                                </div>
                            </details>
                            
                            <details className="mb-4" open>
                                <summary className="font-semibold cursor-pointer">Recursos Vinculados</summary>
                                <div className="p-2 space-y-4">
                                    <ResourceList title="Ambientes" items={linkedAmbientes} onUnlink={(id) => handleUnlinkResource(id, 'ambientes')} displayKey="nome"/>
                                    <ResourceList title="Riscos" items={linkedRiscos} onUnlink={(id) => handleUnlinkResource(id, 'riscos')} displayKey="nome"/>
                                    <ResourceList title="Exames (Protocolo)" items={linkedExames.map(e => ({...e, nome: e.nome_exame, linkId: e.protocolo.id}))} onUnlink={(id) => handleUnlinkResource(id, 'exames')} displayKey="nome"/>
                                </div>
                            </details>

                        </div>
                    ) : <p className="text-slate-500 mt-4 text-sm">Selecione uma empresa e um cargo para ver os detalhes.</p>}
                </div>

                <div className="lg:w-1/4 bg-[#F9FAFB] p-3 rounded-lg border border-[#E0E3E7] flex flex-col">
                    <h3 className="font-semibold mb-2 text-slate-700 text-center">4. Biblioteca de Recursos</h3>
                    <div className="flex border-b border-[#D5D8DC] mb-2">
                        {(['ambientes', 'riscos', 'exames'] as ResourceTab[]).map(tab => (
                            <button key={tab} onClick={() => { setResourceTab(tab); setSelectedResourceId(null); }} className={`flex-1 text-sm py-2 px-1 capitalize ${resourceTab === tab ? 'border-b-2 border-[#3A6EA5] text-[#2F5C8C] font-semibold' : 'text-slate-500'}`}>
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
                    <Button onClick={handleLinkResource} disabled={!selectedCargoId || selectedResourceId === null} className="mt-2 w-full">
                       Adicionar ao Cargo
                    </Button>
                </div>
            </Card>
        </div>
    );
};

const ResourceList = ({ title, items, onUnlink, displayKey }: {title: string, items: any[], onUnlink: (linkId: number) => void, displayKey: string}) => (
    <div>
        <h4 className="font-medium text-sm text-slate-600">{title}</h4>
        {items.length > 0 ? (
            <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
                {items.map(item => (
                    <li key={item.linkId} className="flex justify-between items-center">
                        <span>{item[displayKey]}</span>
                        <button onClick={() => onUnlink(item.linkId)} className="text-red-500 hover:text-red-700 text-xs">Remover</button>
                    </li>
                ))}
            </ul>
        ) : <p className="text-xs text-slate-400 mt-1">Nenhum item vinculado.</p>}
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
            className={`w-full text-left p-2 rounded-md text-sm transition ${selectedId === item.id ? 'bg-[#E3F3EA] text-[#2F6E4A] font-semibold' : 'hover:bg-[#F1F3F5]'}`}
        >
            {item[displayKey]}
        </button>
    </li>
);
