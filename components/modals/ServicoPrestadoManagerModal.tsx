// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ServicoPrestado, DbData } from '../../types';
import { api, ApiError } from '../../services/apiService';
import { SearchableSelect } from '../common/SearchableSelect';
import toast from 'react-hot-toast';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    servico: ServicoPrestado | null;
    data: DbData;
    onOpenCatalogoManager: (initialName?: string) => void;
    onOpenEmpresaManager: (initialName?: string) => void;
    onOpenCadastroManual: (initialName?: string) => void;
}

const initialFormState = {
    empresaId: '',
    servicoId: '',
    funcionarioId: '',
    dataRealizacao: new Date().toISOString().split('T')[0],
    valorCobrado: 0,
    quantidade: 1,
    descricaoAdicional: '',
};

export const ServicoPrestadoManagerModal: React.FC<ModalProps> = (props) => {
    const { 
        isOpen, 
        onClose, 
        onSaveSuccess, 
        servico, 
        data, 
        onOpenCatalogoManager,
        onOpenEmpresaManager,
        onOpenCadastroManual
    } = props;
    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const isEditing = !!servico;

    useEffect(() => {
        if (isOpen) {
            if (servico) {
                setFormData({
                    empresaId: String(servico.empresaId),
                    servicoId: String(servico.servicoId),
                    funcionarioId: String(servico.funcionarioId || ''),
                    dataRealizacao: servico.dataRealizacao,
                    valorCobrado: servico.valorCobrado,
                    quantidade: servico.quantidade,
                    descricaoAdicional: servico.descricaoAdicional || '',
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [servico, isOpen]);
    
    useEffect(() => {
        // Clear funcionario if empresa changes
        setFormData(prev => ({...prev, funcionarioId: ''}));
    }, [formData.empresaId])

    const handleServicoChange = (servicoId: number | string | null) => {
        const id = Number(servicoId);
        const servicoSelecionado = data.catalogoServicos.find(s => s.id === id);
        setFormData(prev => ({
            ...prev,
            servicoId: String(id || ''),
            valorCobrado: servicoSelecionado ? servicoSelecionado.precoPadrao * prev.quantidade : 0,
        }));
    };
    
    const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const quantidade = Number(e.target.value);
        const servicoSelecionado = data.catalogoServicos.find(s => s.id === Number(formData.servicoId));
         setFormData(prev => ({
            ...prev,
            quantidade,
            valorCobrado: servicoSelecionado ? servicoSelecionado.precoPadrao * quantidade : prev.valorCobrado,
        }));
    }

    const handleSave = async () => {
        if (!formData.empresaId || !formData.servicoId || !formData.dataRealizacao) {
            toast.error("Empresa, Serviço e Data são obrigatórios.");
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = {
                empresaId: Number(formData.empresaId),
                servicoId: Number(formData.servicoId),
                funcionarioId: formData.funcionarioId ? Number(formData.funcionarioId) : undefined,
                dataRealizacao: formData.dataRealizacao,
                valorCobrado: Number(formData.valorCobrado),
                quantidade: Number(formData.quantidade),
                descricaoAdicional: formData.descricaoAdicional,
                status: servico?.status || 'PENDENTE',
                cobrancaId: servico?.cobrancaId,
                nfeId: servico?.nfeId
            };

            if (isEditing) {
                await api.servicosPrestados.update(servico.id, dataToSave);
                toast.success('Serviço prestado atualizado com sucesso!');
            } else {
                await api.servicosPrestados.create(dataToSave);
                toast.success('Serviço prestado registrado com sucesso!');
            }

            onSaveSuccess();
            onClose();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao salvar serviço prestado');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const funcionariosDaEmpresa = formData.empresaId
        ? (data.funcionarios || []).filter(f => f.ativo && f.empresaId === Number(formData.empresaId))
        : [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{isEditing ? 'Editar' : 'Lançar'} Serviço Prestado</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Empresa*</label>
                        <SearchableSelect
                            options={(data.empresas || []).map(e => ({ id: e.id, label: e.nomeFantasia }))}
                            value={formData.empresaId ? Number(formData.empresaId) : null}
                            onChange={(id) => setFormData(prev => ({ ...prev, empresaId: String(id || '') }))}
                            placeholder="Digite para buscar a empresa..."
                            onAddNew={(searchTerm) => onOpenEmpresaManager(searchTerm)}
                            addNewLabel={(searchTerm) => `+ Adicionar nova empresa: "${searchTerm}"`}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Serviço*</label>
                        <SearchableSelect
                            options={(data.catalogoServicos || []).map(s => ({ id: s.id, label: s.nome }))}
                            value={formData.servicoId ? Number(formData.servicoId) : null}
                            onChange={handleServicoChange}
                            placeholder="Digite para buscar o serviço..."
                            onAddNew={(searchTerm) => onOpenCatalogoManager(searchTerm)}
                            addNewLabel={(searchTerm) => `+ Adicionar novo serviço: "${searchTerm}"`}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField label="Data de Realização*" name="dataRealizacao" type="date" value={formData.dataRealizacao} onChange={e => setFormData({...formData, dataRealizacao: e.target.value})} />
                        <InputField label="Quantidade" name="quantidade" type="number" value={String(formData.quantidade)} onChange={handleQuantidadeChange} />
                        <InputField label="Valor Cobrado (R$)" name="valorCobrado" type="number" value={String(formData.valorCobrado)} onChange={e => setFormData({...formData, valorCobrado: Number(e.target.value)})} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Funcionário (Opcional)</label>
                        <SearchableSelect
                            options={funcionariosDaEmpresa.map(f => ({ id: f.id, label: f.nome }))}
                            value={formData.funcionarioId ? Number(formData.funcionarioId) : null}
                            onChange={(id) => setFormData(prev => ({ ...prev, funcionarioId: String(id || '') }))}
                            placeholder={!formData.empresaId ? "Selecione uma empresa primeiro" : "Digite para buscar o funcionário..."}
                            onAddNew={(searchTerm) => onOpenCadastroManual(searchTerm)}
                            addNewLabel={(searchTerm) => `+ Adicionar novo funcionário: "${searchTerm}"`}
                            disabled={!formData.empresaId}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição Adicional</label>
                        <textarea value={formData.descricaoAdicional} onChange={e => setFormData({...formData, descricaoAdicional: e.target.value})} rows={3} className="w-full p-2 border rounded mt-1"/>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const InputField: React.FC<{label: string, name: string, value: string, onChange: (e: any) => void, type?: string}> = 
({label, name, value, onChange, type="text"}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} className="w-full p-2 border rounded mt-1"/>
    </div>
);
