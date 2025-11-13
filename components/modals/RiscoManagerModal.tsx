import React, { useState, useEffect } from 'react';
import { Risco } from '../../types';
import { riscoService } from '../../services/dbService';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataChange: () => void;
}

export const RiscoManagerModal: React.FC<ModalProps> = ({ isOpen, onClose, onDataChange }) => {
    const [riscos, setRiscos] = useState<Risco[]>([]);
    const [selected, setSelected] = useState<Risco | null>(null);
    const [formData, setFormData] = useState({ nome: '', tipo: '', descricao_agente: '', danos_possiveis: '' });

    useEffect(() => {
        if (isOpen) {
            setRiscos(riscoService.getAll());
        }
    }, [isOpen]);

    useEffect(() => {
        if (selected) {
            setFormData({
                nome: selected.nome,
                tipo: selected.tipo || '',
                descricao_agente: selected.descricao_agente || '',
                danos_possiveis: selected.danos_possiveis || ''
            });
        } else {
            setFormData({ nome: '', tipo: '', descricao_agente: '', danos_possiveis: '' });
        }
    }, [selected]);
    
    const handleSave = () => {
        if (!formData.nome || !formData.tipo) {
            alert('Nome e Tipo do risco são obrigatórios.');
            return;
        }
        if (selected) {
            riscoService.update(selected.id, formData);
        } else {
            riscoService.add(formData);
        }
        onDataChange();
        setRiscos(riscoService.getAll());
        setSelected(null);
    };

    const handleDelete = () => {
        if (selected && window.confirm(`Tem certeza que deseja excluir o risco "${selected.nome}"?`)) {
            riscoService.remove(selected.id);
            onDataChange();
            setRiscos(riscoService.getAll());
            setSelected(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">⚠️ Gerenciar Riscos Ocupacionais</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto flex flex-col md:flex-row gap-4">
                     <div className="md:w-1/3 border rounded-lg p-2 overflow-y-auto">
                        <h3 className="font-semibold text-center mb-2">Riscos Cadastrados</h3>
                        <ul>
                            {riscos.map(item => (
                                <li key={item.id}>
                                    <button onClick={() => setSelected(item)} className={`w-full text-left p-2 rounded text-sm ${selected?.id === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                        {item.nome} <span className="text-xs text-gray-500">({item.tipo})</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-2/3 border rounded-lg p-4 space-y-4">
                        <h3 className="font-semibold">{selected ? 'Editando Risco' : 'Novo Risco'}</h3>
                        <div>
                            <label className="block text-sm font-medium">Nome do Risco*</label>
                            <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tipo*</label>
                            <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full p-2 border rounded">
                                <option value="">Selecione...</option>
                                <option value="Físico">Físico</option>
                                <option value="Químico">Químico</option>
                                <option value="Biológico">Biológico</option>
                                <option value="Ergonômico">Ergonômico</option>
                                <option value="Acidentes">Acidentes</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Descrição do Agente</label>
                            <input type="text" value={formData.descricao_agente} onChange={e => setFormData({...formData, descricao_agente: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Danos Possíveis à Saúde</label>
                            <textarea value={formData.danos_possiveis} onChange={e => setFormData({...formData, danos_possiveis: e.target.value})} rows={3} className="w-full p-2 border rounded"></textarea>
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