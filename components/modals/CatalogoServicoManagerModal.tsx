import React, { useState, useEffect } from 'react';
import { CatalogoServico } from '../../types';
import { api, ApiError } from '../../services/apiService';
import toast from 'react-hot-toast';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataChange: () => void;
    initialName?: string | null;
}

const initialFormState: Omit<CatalogoServico, 'id'> = {
    codigoInterno: '',
    nome: '',
    tipo: 'Exame',
    precoPadrao: 0,
    descricao: '',
    aliquotaISS: 0,
    codigoServicoLC116: '',
    cnae: '',
};

export const CatalogoServicoManagerModal: React.FC<ModalProps> = ({ isOpen, onClose, onDataChange, initialName }) => {
    const [servicos, setServicos] = useState<CatalogoServico[]>([]);
    const [selected, setSelected] = useState<CatalogoServico | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadServicos();
        }
    }, [isOpen]);

    const loadServicos = async () => {
        setIsLoading(true);
        try {
            const data = await api.catalogoServicos.getAll();
            setServicos(data);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao carregar serviços');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        if (selected) {
            setFormData({
                codigoInterno: selected.codigoInterno,
                nome: selected.nome,
                tipo: selected.tipo,
                precoPadrao: selected.precoPadrao,
                descricao: selected.descricao || '',
                aliquotaISS: selected.aliquotaISS || 0,
                codigoServicoLC116: selected.codigoServicoLC116 || '',
                cnae: selected.cnae || '',
            });
        } else {
            setFormData({
                ...initialFormState,
                nome: initialName || ''
            });
        }
    }, [selected, initialName, isOpen]);
    
    const handleSave = async () => {
        if (!formData.nome || !formData.codigoInterno || formData.precoPadrao <= 0) {
            toast.error('Nome, código interno e preço são obrigatórios.');
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                precoPadrao: Number(formData.precoPadrao),
                aliquotaISS: Number(formData.aliquotaISS)
            };

            if (selected) {
                await api.catalogoServicos.update(selected.id, dataToSave);
                toast.success(`Serviço "${formData.nome}" atualizado com sucesso!`);
            } else {
                await api.catalogoServicos.create(dataToSave);
                toast.success(`Serviço "${formData.nome}" criado com sucesso!`);
            }

            onDataChange();
            await loadServicos();
            setSelected(null);
            setFormData(initialFormState);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao salvar serviço');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;

        setIsSaving(true);
        try {
            await api.catalogoServicos.delete(selected.id);
            toast.success(`Serviço "${selected.nome}" excluído com sucesso!`);
            onDataChange();
            await loadServicos();
            setSelected(null);
            setFormData(initialFormState);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao excluir serviço');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">🏷️ Gerenciar Catálogo de Serviços</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto flex flex-col md:flex-row gap-4">
                     <div className="md:w-1/3 border rounded-lg p-2 overflow-y-auto">
                        <h3 className="font-semibold text-center mb-2">Serviços Cadastrados</h3>
                        {isLoading ? (
                            <div className="text-center text-gray-500 py-4">Carregando...</div>
                        ) : servicos.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">Nenhum serviço cadastrado</div>
                        ) : (
                            <ul>
                                {servicos.map(item => (
                                    <li key={item.id}>
                                        <button onClick={() => setSelected(item)} className={`w-full text-left p-2 rounded text-sm ${selected?.id === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                            {item.nome}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="md:w-2/3 border rounded-lg p-4 space-y-4">
                        <h3 className="font-semibold">{selected ? 'Editando Serviço' : 'Novo Serviço'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Nome do Serviço*" name="nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                             <div>
                                <label htmlFor="tipo-servico" className="block text-sm font-medium">Tipo*</label>
                                <input
                                    id="tipo-servico"
                                    list="tipos-servico"
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                                    className="w-full p-2 border rounded mt-1"
                                />
                                <datalist id="tipos-servico">
                                    <option value="Exame" />
                                    <option value="Treinamento" />
                                    <option value="Laudo" />
                                    <option value="Consultoria" />
                                    <option value="Outro" />
                                </datalist>
                            </div>
                            <InputField label="Código Interno/SKU" name="codigoInterno" value={formData.codigoInterno} onChange={e => setFormData({...formData, codigoInterno: e.target.value})} />
                            <InputField label="Preço Padrão (R$)*" name="precoPadrao" type="number" value={String(formData.precoPadrao)} onChange={e => setFormData({...formData, precoPadrao: Number(e.target.value)})} />
                            <InputField label="Aliquota ISS (%)" name="aliquotaISS" type="number" value={String(formData.aliquotaISS)} onChange={e => setFormData({...formData, aliquotaISS: Number(e.target.value)})} />
                            <InputField label="CNAE" name="cnae" value={formData.cnae} onChange={e => setFormData({...formData, cnae: e.target.value})} />
                            <InputField label="Cód. Serviço (LC 116)" name="codigoServicoLC116" value={formData.codigoServicoLC116} onChange={e => setFormData({...formData, codigoServicoLC116: e.target.value})} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Descrição</label>
                            <textarea value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} rows={3} className="w-full p-2 border rounded mt-1"></textarea>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setSelected(null);
                                    setFormData(initialFormState);
                                }}
                                disabled={isSaving}
                                className="bg-gray-200 px-4 py-2 rounded text-sm disabled:opacity-50"
                            >
                                Novo/Limpar
                            </button>
                            {selected && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isSaving}
                                    className="bg-red-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                                >
                                    {isSaving ? 'Excluindo...' : 'Excluir'}
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-green-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string, name: string, value: string, onChange: (e: any) => void, type?: string}> = 
({label, name, value, onChange, type="text"}) => (
    <div>
        <label className="block text-sm font-medium">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} className="w-full p-2 border rounded mt-1"/>
    </div>
);