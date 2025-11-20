import React, { useState, useEffect } from 'react';
import { DocumentoTipo } from '../../types';
import { documentoTipoService } from '../../services/dbService';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataChange: () => void;
}

export const DocumentoTipoManagerModal: React.FC<ModalProps> = ({ isOpen, onClose, onDataChange }) => {
    const [tipos, setTipos] = useState<DocumentoTipo[]>([]);
    const [selected, setSelected] = useState<DocumentoTipo | null>(null);
    const [formData, setFormData] = useState({ nome: '', validadeMesesPadrao: null as number | null, alertaDias: 30 });

    useEffect(() => {
        if (isOpen) {
            setTipos(documentoTipoService.getAll());
        }
    }, [isOpen]);

    useEffect(() => {
        if (selected) {
            setFormData({
                nome: selected.nome,
                validadeMesesPadrao: selected.validadeMesesPadrao,
                alertaDias: selected.alertaDias
            });
        } else {
            setFormData({ nome: '', validadeMesesPadrao: 12, alertaDias: 30 });
        }
    }, [selected]);
    
    const handleSave = () => {
        if (!formData.nome || !formData.alertaDias) {
            toast.error('Nome e Dias para Alerta são obrigatórios.');
            return;
        }
        const dataToSave = {
            ...formData,
            validadeMesesPadrao: formData.validadeMesesPadrao ? Number(formData.validadeMesesPadrao) : null,
            alertaDias: Number(formData.alertaDias)
        };

        if (selected) {
            documentoTipoService.update(selected.id, dataToSave);
        } else {
            documentoTipoService.add(dataToSave);
        }
        onDataChange();
        setTipos(documentoTipoService.getAll());
        setSelected(null);
    };

    const handleDelete = () => {
        if (selected && window.confirm(`Tem certeza que deseja excluir o tipo "${selected.nome}"?`)) {
            documentoTipoService.remove(selected.id);
            onDataChange();
            setTipos(documentoTipoService.getAll());
            setSelected(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">📄 Gerenciar Tipos de Documento</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto flex flex-col md:flex-row gap-4">
                     <div className="md:w-1/3 border rounded-lg p-2 overflow-y-auto">
                        <h3 className="font-semibold text-center mb-2">Tipos Cadastrados</h3>
                        <ul>
                            {tipos.map(item => (
                                <li key={item.id}>
                                    <button onClick={() => setSelected(item)} className={`w-full text-left p-2 rounded text-sm ${selected?.id === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                        {item.nome}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-2/3 border rounded-lg p-4 space-y-4">
                        <h3 className="font-semibold">{selected ? 'Editando Tipo' : 'Novo Tipo de Documento'}</h3>
                        <div>
                            <label className="block text-sm font-medium">Nome do Tipo*</label>
                            <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Validade Padrão (meses)</label>
                            <input type="number" value={formData.validadeMesesPadrao || ''} onChange={e => setFormData({...formData, validadeMesesPadrao: e.target.value ? Number(e.target.value) : null})} placeholder="Deixe em branco se não houver" className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Alerta de Vencimento (dias antes)*</label>
                            <input type="number" value={formData.alertaDias} onChange={e => setFormData({...formData, alertaDias: Number(e.target.value) || 0})} className="w-full p-2 border rounded"/>
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
