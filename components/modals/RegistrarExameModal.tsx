import React, { useState } from 'react';
import { exameApi, ApiError } from '../../services/apiService';
import { Funcionario } from '../../types';
import toast from 'react-hot-toast';

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

export const RegistrarExameModal: React.FC<ModalProps> = ({ isOpen, onClose, onSaveSuccess, funcionarios }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.funcionarioId || !formData.tipoExame || !formData.dataRealizacao) {
            toast.error("Funcionário, tipo de exame e data de realização são obrigatórios.");
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">➕ Registrar Novo Exame</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <div>
                        <label htmlFor="funcionarioId" className="block text-sm font-medium text-gray-700">Funcionário*</label>
                        <select
                            id="funcionarioId"
                            name="funcionarioId"
                            value={formData.funcionarioId}
                            onChange={handleChange}
                            disabled={isSaving}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Selecione um funcionário...</option>
                            {funcionarios.map(f => (
                                <option key={f.id} value={f.id}>{f.nome} ({f.cargo})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Tipo de Exame*" name="tipoExame" value={formData.tipoExame} onChange={handleChange} disabled={isSaving} />
                        <InputField label="Data de Realização*" name="dataRealizacao" type="date" value={formData.dataRealizacao} onChange={handleChange} disabled={isSaving} />
                    </div>
                     <div>
                        <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações</label>
                        <textarea
                            id="observacoes"
                            name="observacoes"
                            value={formData.observacoes}
                            onChange={handleChange}
                            rows={3}
                            disabled={isSaving}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>
                     <p className="text-xs text-gray-500 mt-2">
                        Nota: A data de vencimento será calculada automaticamente com base na periodicidade definida para o cargo do funcionário.
                    </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} disabled={isSaving} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSaving ? 'Salvando...' : 'Salvar Exame'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    type?: string;
    disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = "text", disabled = false }) => {
    if (type === 'select') {
        return (
             <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                <select id={name} name={name} value={value} onChange={onChange} disabled={disabled} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed">
                    <option value="Periódico">Periódico</option>
                    <option value="Admissional">Admissional</option>
                    <option value="Demissional">Demissional</option>
                    <option value="Retorno ao Trabalho">Retorno ao Trabalho</option>
                    <option value="Mudança de Risco">Mudança de Risco</option>
                </select>
            </div>
        )
    }

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
        </div>
    )
};