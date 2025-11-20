import React, { useState, useEffect } from 'react';
import { pastaApi, ApiError, Pasta } from '../../services/apiService';
import toast from 'react-hot-toast';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    context: { empresaId: number; parentId: number | null; pasta?: Pasta; } | null;
}

export const PastaManagerModal: React.FC<ModalProps> = ({ isOpen, onClose, onSaveSuccess, context }) => {
    const [nome, setNome] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (context?.pasta) {
            setNome(context.pasta.nome);
        } else {
            setNome('');
        }
    }, [context]);

    const handleSave = async () => {
        if (!context || !nome.trim()) {
            toast.error("O nome da pasta é obrigatório.");
            return;
        }

        setIsSaving(true);

        try {
            if (context.pasta) { // Editing
                await pastaApi.update(context.pasta.id, { nome });
                toast.success(`Pasta "${nome}" renomeada com sucesso!`);
            } else { // Creating
                await pastaApi.create({
                    nome,
                    empresaId: context.empresaId,
                    parentId: context.parentId,
                });
                toast.success(`Pasta "${nome}" criada com sucesso!`);
            }

            onSaveSuccess();
            onClose();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao salvar pasta. Tente novamente.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !context) return null;

    const isEditing = !!context.pasta;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{isEditing ? '✏️ Renomear Pasta' : '📁 Nova Pasta'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome da Pasta</label>
                        <input
                            type="text"
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            disabled={isSaving}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} disabled={isSaving} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Pasta')}
                    </button>
                </div>
            </div>
        </div>
    );
};