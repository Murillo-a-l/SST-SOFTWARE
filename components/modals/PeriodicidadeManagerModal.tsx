import React, { useState, useEffect } from 'react';
import { PeriodicidadeCargo } from '../../types';
import { periodicidadeCargoService, recalculateAllVencimentos } from '../../services/dbService';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataChange: () => void;
}

export const PeriodicidadeManagerModal: React.FC<ModalProps> = ({ isOpen, onClose, onDataChange }) => {
    const [periodicidades, setPeriodicidades] = useState<PeriodicidadeCargo[]>([]);
    const [selected, setSelected] = useState<PeriodicidadeCargo | null>(null);
    const [formData, setFormData] = useState({ cargo_nome: '', periodicidade_meses: 12 });

    useEffect(() => {
        if (isOpen) {
            setPeriodicidades(periodicidadeCargoService.getAll());
        }
    }, [isOpen]);

    useEffect(() => {
        if (selected) {
            setFormData({
                cargo_nome: selected.cargo_nome,
                periodicidade_meses: selected.periodicidade_meses,
            });
        } else {
            setFormData({ cargo_nome: '', periodicidade_meses: 12 });
        }
    }, [selected]);
    
    const handleSave = () => {
        if (!formData.cargo_nome || formData.periodicidade_meses <= 0) {
            alert('Nome do cargo e uma periodicidade válida (meses) são obrigatórios.');
            return;
        }

        const existing = periodicidadeCargoService.getAll().find(p => p.cargo_nome.toLowerCase() === formData.cargo_nome.toLowerCase() && p.id !== selected?.id);
        if (existing) {
            alert("Já existe uma periodicidade definida para este cargo. Edite a regra existente.");
            return;
        }

        if (selected) {
            periodicidadeCargoService.update(selected.id, formData);
        } else {
            periodicidadeCargoService.add(formData);
        }
        onDataChange();
        setPeriodicidades(periodicidadeCargoService.getAll());
        setSelected(null);
    };

    const handleDelete = () => {
        if (selected && window.confirm(`Tem certeza que deseja excluir a regra para "${selected.cargo_nome}"?`)) {
            periodicidadeCargoService.remove(selected.id);
            onDataChange();
            setPeriodicidades(periodicidadeCargoService.getAll());
            setSelected(null);
        }
    };

    const handleRecalculate = () => {
        if (window.confirm("Deseja recalcular as datas de vencimento de TODOS os exames com base nas regras atuais? Esta ação pode levar alguns segundos.")) {
            const result = recalculateAllVencimentos();
            alert(`${result.updated} datas de vencimento foram atualizadas.`);
            onDataChange();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">📅 Gerenciar Periodicidade por Cargo</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto flex flex-col md:flex-row gap-4">
                     <div className="md:w-1/3 border rounded-lg p-2 overflow-y-auto">
                        <h3 className="font-semibold text-center mb-2">Regras Atuais</h3>
                        <ul>
                            {periodicidades.map(item => (
                                <li key={item.id}>
                                    <button onClick={() => setSelected(item)} className={`w-full text-left p-2 rounded text-sm flex justify-between ${selected?.id === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                        <span>{item.cargo_nome}</span>
                                        <span className="font-semibold">{item.periodicidade_meses} meses</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-2/3 border rounded-lg p-4 space-y-4">
                        <h3 className="font-semibold">{selected ? 'Editando Regra' : 'Nova Regra'}</h3>
                        <div>
                            <label className="block text-sm font-medium">Nome do Cargo*</label>
                            <input type="text" value={formData.cargo_nome} onChange={e => setFormData({...formData, cargo_nome: e.target.value})} className="w-full p-2 border rounded" placeholder="Ex: Desenvolvedor Frontend"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Periodicidade (em meses)*</label>
                            <input type="number" value={formData.periodicidade_meses} onChange={e => setFormData({...formData, periodicidade_meses: parseInt(e.target.value, 10) || 1 })} className="w-full p-2 border rounded" min="1"/>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-4 border-t pt-4">
                            <button onClick={() => setSelected(null)} className="bg-gray-200 px-4 py-2 rounded text-sm">Novo/Limpar</button>
                            {selected && <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Excluir</button>}
                            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded text-sm">Salvar</button>
                        </div>

                         <div className="border-t pt-4 mt-4">
                            <h3 className="font-semibold text-gray-800">Manutenção</h3>
                            <p className="text-sm text-gray-600 mt-1 mb-3">Se você alterou uma regra, recalcule os vencimentos para aplicar a mudança a todos os funcionários.</p>
                            <button
                                onClick={handleRecalculate}
                                className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition"
                            >
                                Recalcular Todos os Vencimentos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};