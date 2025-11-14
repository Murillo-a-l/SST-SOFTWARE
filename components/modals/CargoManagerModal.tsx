import React, { useState, useEffect } from 'react';
import { Cargo } from '../../types';
import { cargoService } from '../../services/dbService';
import { useGemini } from '../../hooks/useGemini';
import { Spinner } from '../ui/Spinner';
import { Alert } from '../ui/Alert';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataChange: () => void;
}

export const CargoManagerModal: React.FC<ModalProps> = ({ isOpen, onClose, onDataChange }) => {
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null);
    const [formData, setFormData] = useState({ nome_padronizado: '', cbo_codigo: '', descricao_atividades: '', riscos_ocupacionais: '', epis_recomendados: '' });
    const { isLoading, error, summarize, suggest } = useGemini();

    useEffect(() => {
        if (isOpen) {
            setCargos(cargoService.getAll());
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedCargo) {
            setFormData({
                nome_padronizado: selectedCargo.nome_padronizado,
                cbo_codigo: selectedCargo.cbo_codigo || '',
                descricao_atividades: selectedCargo.descricao_atividades || '',
                riscos_ocupacionais: selectedCargo.riscos_ocupacionais || '',
                epis_recomendados: selectedCargo.epis_recomendados || ''
            });
        } else {
            setFormData({ nome_padronizado: '', cbo_codigo: '', descricao_atividades: '', riscos_ocupacionais: '', epis_recomendados: '' });
        }
    }, [selectedCargo]);

    async function handleGenerateDescricao() {
        if (!formData.nome_padronizado) {
            toast.error("Preencha o nome do cargo antes de gerar a descrição.");
            return;
        }

        const prompt = `Descreva detalhadamente as atividades típicas do cargo: "${formData.nome_padronizado}".
Inclua:
- Rotinas diárias
- Responsabilidades principais
- Condições de trabalho
- Riscos ocupacionais potenciais
- Possíveis esforços físicos

Escreva em português, em parágrafos curtos.`;

        const texto = await summarize(prompt);
        if (texto) {
            setFormData((prev) => ({ ...prev, descricao_atividades: texto }));
        }
    }

    async function handleGenerateRiscosEPIs() {
        if (!formData.nome_padronizado) {
            toast.error("Preencha o nome do cargo antes de gerar riscos e EPIs.");
            return;
        }

        const employeeData = {
            nome: "Trabalhador Exemplo",
            cargo: formData.nome_padronizado,
            riscos: []
        };

        const texto = await suggest(employeeData);
        if (texto) {
            setFormData((prev) => ({
                ...prev,
                riscos_ocupacionais: texto,
                epis_recomendados: texto
            }));
        }
    }
    
    const handleSave = () => {
        if (!formData.nome_padronizado) {
            toast.error('O nome do cargo é obrigatório.');
            return;
        }
        if (selectedCargo) {
            cargoService.update(selectedCargo.id, formData);
        } else {
            cargoService.add(formData);
        }
        onDataChange();
        setCargos(cargoService.getAll());
        setSelectedCargo(null);
    };

    const handleDelete = () => {
        if (selectedCargo && window.confirm(`Tem certeza que deseja excluir o cargo "${selectedCargo.nome_padronizado}"?`)) {
            cargoService.remove(selectedCargo.id);
            onDataChange();
            setCargos(cargoService.getAll());
            setSelectedCargo(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-busy={isLoading}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">👔 Gerenciar Cargos Padronizados</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto flex flex-col md:flex-row gap-4">
                    {/* Lista de Cargos */}
                    <div className="md:w-1/3 border rounded-lg p-2 overflow-y-auto">
                        <h3 className="font-semibold text-center mb-2">Cargos Cadastrados</h3>
                        <ul>
                            {cargos.map(cargo => (
                                <li key={cargo.id}>
                                    <button onClick={() => setSelectedCargo(cargo)} className={`w-full text-left p-2 rounded text-sm ${selectedCargo?.id === cargo.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
                                        {cargo.nome_padronizado}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Formulário de Edição/Criação */}
                    <div className="md:w-2/3 border rounded-lg p-4 space-y-4">
                        {error && (
                            <Alert variant="error" title="Falha ao gerar com IA">
                                {error.message}
                            </Alert>
                        )}
                        <h3 className="font-semibold">{selectedCargo ? 'Editando Cargo' : 'Novo Cargo'}</h3>
                        <div>
                            <label className="block text-sm font-medium">Nome Padronizado*</label>
                            <input type="text" value={formData.nome_padronizado} onChange={e => setFormData({...formData, nome_padronizado: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Código CBO</label>
                            <input type="text" value={formData.cbo_codigo} onChange={e => setFormData({...formData, cbo_codigo: e.target.value})} className="w-full p-2 border rounded"/>
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium">Descrição das Atividades</label>
                                <button type="button" onClick={handleGenerateDescricao} disabled={isLoading} aria-disabled={isLoading} title={isLoading ? "Aguarde..." : ""} className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-1 rounded-md hover:bg-purple-200 disabled:bg-gray-200 flex items-center">
                                    {isLoading && <Spinner className="mr-2" />}
                                    Gerar descrição com IA
                                </button>
                            </div>
                            <textarea value={formData.descricao_atividades} onChange={e => setFormData({...formData, descricao_atividades: e.target.value})} rows={5} className="w-full p-2 border rounded mt-1"></textarea>
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium">Riscos e EPIs</label>
                                <button type="button" onClick={handleGenerateRiscosEPIs} disabled={isLoading} aria-disabled={isLoading} title={isLoading ? "Aguarde..." : ""} className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-md hover:bg-blue-200 disabled:bg-gray-200 flex items-center">
                                    {isLoading && <Spinner className="mr-2" />}
                                    Gerar riscos e EPIs com IA
                                </button>
                            </div>
                            <textarea value={formData.riscos_ocupacionais} onChange={e => setFormData({...formData, riscos_ocupacionais: e.target.value})} rows={5} className="w-full p-2 border rounded mt-1" placeholder="Riscos Ocupacionais"></textarea>
                            <textarea value={formData.epis_recomendados} onChange={e => setFormData({...formData, epis_recomendados: e.target.value})} rows={5} className="w-full p-2 border rounded mt-1" placeholder="EPIs Recomendados"></textarea>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setSelectedCargo(null)} className="bg-gray-200 px-4 py-2 rounded text-sm">Novo/Limpar</button>
                            {selectedCargo && <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Excluir</button>}
                            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded text-sm">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
