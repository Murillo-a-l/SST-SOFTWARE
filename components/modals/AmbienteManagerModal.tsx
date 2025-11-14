import React, { useState, useEffect } from 'react';
import { Ambiente } from '../../types';
import { ambienteService } from '../../services/dbService';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataChange: () => void;
}

export const AmbienteManagerModal: React.FC<ModalProps> = ({ isOpen, onClose, onDataChange }) => {
    const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
    const [selected, setSelected] = useState<Ambiente | null>(null);
    const [formData, setFormData] = useState({ nome: '', ghe: '', descricao_detalhada: '' });

    useEffect(() => {
        if (isOpen) {
            setAmbientes(ambienteService.getAll());
        }
    }, [isOpen]);

    useEffect(() => {
        if (selected) {
            setFormData({
                nome: selected.nome,
                ghe: selected.ghe || '',
                descricao_detalhada: selected.descricao_detalhada || ''
            });
        } else {
            setFormData({ nome: '', ghe: '', descricao_detalhada: '' });
        }
    }, [selected]);
    
    const handleSave = () => {
        if (!formData.nome) {
            toast.error('O nome do ambiente é obrigatório.');
            return;
        }
        if (selected) {
            ambienteService.update(selected.id, formData);
        } else {
            ambienteService.add(formData);
        }
        onDataChange();
        setAmbientes(ambienteService.getAll());
        setSelected(null);
    };

    const handleDelete = () => {
        if (selected && window.confirm(`Tem certeza que deseja excluir o ambiente "${selected.nome}"?`)) {
            ambienteService.remove(selected.id);
            onDataChange();
            setAmbientes(ambienteService.getAll());
            setSelected(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">🏢 Gerenciar Ambientes de Trabalho</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto flex flex-col md:flex-row gap-4">
                     <div className="md:w-1/3 border rounded-lg p-2 overflow-y-auto">
                        <h3 className="font-semibold text-center mb-2">Ambientes Cadastrados</h3>
                        <ul>
                            {ambientes.map(item => (
                                <li key={item.id}>
                                    <button onClick={() => setSelected(item)} className={`w-full text-left p-2 rounded text-sm ${selected?.id === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                        {item.nome}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-2/3 border rounded-lg p-4 space-y-4">
                        <h3 className="font-semibold">{selected ? 'Editando Ambiente' : 'Novo Ambiente'}</h3>
                        <div>
                            <label className="block text-sm font-medium">Nome*</label>
                            <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">GHE</label>
                            <input type="text" value={formData.ghe} onChange={e => setFormData({...formData, ghe: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Descrição Detalhada</label>
                            <textarea value={formData.descricao_detalhada} onChange={e => setFormData({...formData, descricao_detalhada: e.target.value})} rows={5} className="w-full p-2 border rounded"></textarea>
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