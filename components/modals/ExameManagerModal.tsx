import React, { useState, useEffect } from 'react';
import { MasterExame } from '../../types';
import { exameService } from '../../services/dbService';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataChange: () => void;
}

export const ExameManagerModal: React.FC<ModalProps> = ({ isOpen, onClose, onDataChange }) => {
    const [exames, setExames] = useState<MasterExame[]>([]);
    const [selected, setSelected] = useState<MasterExame | null>(null);
    const [formData, setFormData] = useState<Omit<MasterExame, 'id'>>({ nome_exame: '', codigo_esocial: '', categoria: 'complementar' });

    useEffect(() => {
        if (isOpen) {
            setExames(exameService.getAll());
        }
    }, [isOpen]);

    useEffect(() => {
        if (selected) {
            setFormData({
                nome_exame: selected.nome_exame,
                codigo_esocial: selected.codigo_esocial || '',
                categoria: selected.categoria || 'complementar'
            });
        } else {
            setFormData({ nome_exame: '', codigo_esocial: '', categoria: 'complementar' });
        }
    }, [selected]);
    
    const handleSave = () => {
        if (!formData.nome_exame) {
            toast.error('O nome do exame é obrigatório.');
            return;
        }
        if (selected) {
            exameService.update(selected.id, formData);
        } else {
            exameService.add(formData);
        }
        onDataChange();
        setExames(exameService.getAll());
        setSelected(null);
    };

    const handleDelete = () => {
        if (selected && window.confirm(`Tem certeza que deseja excluir o exame "${selected.nome_exame}"?`)) {
            exameService.remove(selected.id);
            onDataChange();
            setExames(exameService.getAll());
            setSelected(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">🔬 Gerenciar Exames Disponíveis</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto flex flex-col md:flex-row gap-4">
                     <div className="md:w-1/3 border rounded-lg p-2 overflow-y-auto">
                        <h3 className="font-semibold text-center mb-2">Exames Cadastrados</h3>
                        <ul>
                            {exames.map(item => (
                                <li key={item.id}>
                                    <button onClick={() => setSelected(item)} className={`w-full text-left p-2 rounded text-sm ${selected?.id === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                        {item.nome_exame}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-2/3 border rounded-lg p-4 space-y-4">
                        <h3 className="font-semibold">{selected ? 'Editando Exame' : 'Novo Exame'}</h3>
                        <div>
                            <label className="block text-sm font-medium">Nome do Exame*</label>
                            <input type="text" value={formData.nome_exame} onChange={e => setFormData({...formData, nome_exame: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Código eSocial</label>
                            <input type="text" value={formData.codigo_esocial || ''} onChange={e => setFormData({...formData, codigo_esocial: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Categoria</label>
                             <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value as MasterExame['categoria']})} className="w-full p-2 border rounded">
                                <option value="clinico">Clínico</option>
                                <option value="complementar">Complementar</option>
                                <option value="especifico">Específico</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setSelected(null)} className="bg-gray-200 px-4 py-2 rounded text-sm">Novo/Limpar</button>
                            {selected && <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Excluir</button>}
                            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded text-sm">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};