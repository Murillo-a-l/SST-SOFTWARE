// @ts-nocheck
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { exameApi, ApiError } from '../../services/apiService';
import { Funcionario } from '../../types';
import { modalOverlay, modalPanel, modalHeader, modalBody, modalFooter } from '../common/modalStyles';
import { Button } from '../../src/components/ui/Button';
import { SearchableSelect } from '../common/SearchableSelect';
import { Input } from '../../src/components/ui/Input';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    funcionarios: Funcionario[];
}

const initialFormState = {
    funcionarioId: '',
    tipoExame: 'Periódico',
    dataRealizacao: '',
    observacoes: '',
};

const tipoExameOptions = [
    'Periódico',
    'Admissional',
    'Demissional',
    'Retorno ao Trabalho',
    'Mudança de Risco',
];

export const RegistrarExameModal: React.FC<ModalProps> = ({ isOpen, onClose, onSaveSuccess, funcionarios }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.funcionarioId || !formData.tipoExame || !formData.dataRealizacao) {
            toast.error('Funcionário, tipo de exame e data de realização são obrigatórios.');
            return;
        }

        setIsSaving(true);

        try {
            const newExameData = {
                funcionarioId: parseInt(formData.funcionarioId, 10),
                tipoExame: formData.tipoExame,
                dataRealizacao: formData.dataRealizacao,
                observacoes: formData.observacoes || undefined,
            };

            await exameApi.create(newExameData);

            toast.success('Exame registrado com sucesso!');
            onSaveSuccess();
            onClose();
            setFormData(initialFormState);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao registrar exame. Tente novamente.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={modalOverlay}>
            <div className={`${modalPanel} max-w-2xl max-h-[90vh] flex flex-col`}>
                <div className={`${modalHeader} border-b border-[#E0E3E7]`}>
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#7B8EA3]">Exames</p>
                        <h2 className="text-xl font-bold text-slate-900">Registrar Exame</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>

                <div className={`${modalBody} space-y-4`}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Funcionário*</label>
                        <SearchableSelect
                            options={funcionarios.map(f => ({ id: f.id, label: `${f.nome} (${f.cargo || 'Sem cargo'})` }))}
                            value={formData.funcionarioId ? Number(formData.funcionarioId) : null}
                            onChange={(id) => setFormData(prev => ({ ...prev, funcionarioId: id ? String(id) : '' }))}
                            placeholder="Selecione o funcionário..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Exame*</label>
                            <select
                                name="tipoExame"
                                value={formData.tipoExame}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-[#D5D8DC] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30 focus:border-[#0F4C5C] text-sm"
                            >
                                {tipoExameOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Realização*</label>
                            <Input
                                type="date"
                                name="dataRealizacao"
                                value={formData.dataRealizacao}
                                onChange={handleChange}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="observacoes" className="block text-sm font-medium text-slate-700">Observações</label>
                        <textarea
                            id="observacoes"
                            name="observacoes"
                            value={formData.observacoes}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-[#D5D8DC] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30 focus:border-[#0F4C5C] text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            A data de vencimento será calculada automaticamente conforme periodicidade do cargo.
                        </p>
                    </div>
                </div>

                <div className={`${modalFooter} border-t border-[#E0E3E7]`}>
                    <Button variant="secondary" size="md" onClick={onClose} disabled={isSaving}>Cancelar</Button>
                    <Button size="md" onClick={handleSave} disabled={isSaving || !formData.funcionarioId || !formData.dataRealizacao}>
                        {isSaving ? 'Salvando...' : 'Salvar Exame'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
