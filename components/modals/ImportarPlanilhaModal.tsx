import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as dbService from '../../services/dbService';
import { Funcionario, ExameRealizado, Empresa } from '../../types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: () => void;
    empresas: Empresa[];
}

const parsePastedData = (pastedText: string): Partial<Funcionario & {data_exame: string, tipo_exame: string}>[] => {
    const rows = pastedText.trim().split('\n').map(row => row.split('\t'));
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const dataRows = rows.slice(1);

    // Dynamic header mapping
    const findHeader = (possibleNames: string[]) => {
        for (const name of possibleNames) {
            const index = headers.indexOf(name);
            if (index > -1) return index;
        }
        return -1;
    };
    
    const headerMap = {
        nome: findHeader(['nome', 'servidor', 'funcionário', 'funcionario']),
        matricula: findHeader(['matrícula', 'matricula']),
        cpf: findHeader(['cpf']),
        cargo: findHeader(['cargo', 'função', 'funcao']),
        data_admissao: findHeader(['data de admissão', 'admissao', 'data admissao']),
        data_exame: findHeader(['data do último exame', 'data exame', 'data_exame', 'data ultimo exame']),
        tipo_exame: findHeader(['tipo do último exame', 'tipo exame', 'tipo_exame', 'tipo ultimo exame']),
        setor: findHeader(['setor']),
    };

    if (headerMap.nome === -1 || headerMap.cargo === -1 || headerMap.data_exame === -1) {
        throw new Error("Não foi possível encontrar as colunas obrigatórias: 'Nome', 'Cargo' e 'Data Exame'. Verifique os cabeçalhos da sua planilha.");
    }
    
    return dataRows.map(row => {
        const entry: any = {};
        for (const key in headerMap) {
            const index = (headerMap as any)[key];
            if (index > -1 && row[index]) {
                entry[key] = row[index].trim();
            }
        }
        return entry;
    });
};

export const ImportarPlanilhaModal: React.FC<ModalProps> = ({ isOpen, onClose, onImportSuccess, empresas }) => {
    const [pastedText, setPastedText] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');

    const handleImport = () => {
        if (!selectedEmpresaId) {
            toast.error("Por favor, selecione para qual empresa você está importando os dados.");
            return;
        }
        if (!pastedText.trim()) {
            toast.error("Por favor, cole os dados da sua planilha.");
            return;
        }
        setIsImporting(true);
        try {
            const parsedData = parsePastedData(pastedText);
            if(parsedData.length === 0) {
                toast.error("Nenhum dado válido encontrado. Verifique se copiou os cabeçalhos e pelo menos uma linha de dados.");
                setIsImporting(false);
                return;
            }
            // FIX: Use processImportedData from dbService for correct ID generation and to avoid code duplication.
            const stats = dbService.processImportedData(parsedData, Number(selectedEmpresaId));
            toast.error(`Importação concluída!\n\n- ${stats.newFuncCount} novos funcionários cadastrados.\n- ${stats.updatedFuncCount} funcionários atualizados.\n- ${stats.newExamsCount} novos exames adicionados ao histórico.`);
            onImportSuccess();
            onClose();
        } catch (error: any) {
            toast.error(`Erro na importação: ${error.message}`);
        } finally {
            setIsImporting(false);
            setPastedText('');
            setSelectedEmpresaId('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">📂 Importar via Planilha</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="prose prose-sm max-w-none">
                        <p>Para importar, siga estes passos:</p>
                        <ol>
                             <li>Selecione a <strong>empresa de destino</strong> dos funcionários.</li>
                            <li>Abra sua planilha (Excel, Google Sheets).</li>
                            <li>Selecione os dados que deseja importar, **incluindo a linha de cabeçalho**.</li>
                            <li>Copie os dados (Ctrl+C ou Cmd+C).</li>
                            <li>Cole os dados na caixa de texto abaixo (Ctrl+V ou Cmd+V).</li>
                        </ol>
                        <p><strong>Colunas obrigatórias:</strong> <code>Nome</code>, <code>Cargo</code>, <code>Data Exame</code>. Outras colunas como <code>CPF</code>, <code>Matrícula</code> e <code>Setor</code> são recomendadas.</p>
                    </div>
                     <div>
                        <label htmlFor="empresaId" className="block text-sm font-medium text-gray-700 mb-1">1. Importar para a Empresa*</label>
                        <select
                            id="empresaId"
                            name="empresaId"
                            value={selectedEmpresaId}
                            onChange={(e) => setSelectedEmpresaId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Selecione uma empresa...</option>
                            {(empresas || []).map(e => <option key={e.id} value={e.id}>{e.nomeFantasia}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">2. Cole os dados da planilha aqui</label>
                        <textarea 
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Ex:&#10;Nome	Cargo	Data Exame&#10;João Silva	Operador	20/05/2024"
                            rows={8}
                            className="block w-full text-sm p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                        />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleImport} disabled={isImporting} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                        {isImporting ? 'Processando...' : 'Importar Dados'}
                    </button>
                </div>
            </div>
        </div>
    );
};
