import React, { useState, useMemo } from 'react';
import { DocumentoEmpresa, Empresa, DocumentoTipo } from '../../types';
import { generateDocumentosCsv, generateDocumentosPrintableHtml } from '../../utils/reportGenerator';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentos: DocumentoEmpresa[];
    empresas: Empresa[];
    documentoTipos: DocumentoTipo[];
}

type ReportStatusType = 'TODOS' | 'VENCENDO' | 'VENCIDO';
type FormatType = 'pdf' | 'excel';

export const GerarRelatorioDocumentosModal: React.FC<ModalProps> = ({ isOpen, onClose, documentos, empresas, documentoTipos }) => {
    const [statusFilter, setStatusFilter] = useState<ReportStatusType>('TODOS');
    const [empresaFilter, setEmpresaFilter] = useState<string>('TODAS');
    const [tipoDocFilter, setTipoDocFilter] = useState<string>('TODOS');
    const [format, setFormat] = useState<FormatType>('pdf');

    const getFilteredData = () => {
        let filteredDocs = [...documentos];

        // Filter by Status
        if (statusFilter !== 'TODOS') {
            filteredDocs = filteredDocs.filter(d => d.status === statusFilter);
        }

        // Filter by Empresa
        if (empresaFilter !== 'TODAS') {
            const empresaId = parseInt(empresaFilter, 10);
            filteredDocs = filteredDocs.filter(d => d.empresaId === empresaId);
        }

        // Filter by Document Type
        if (tipoDocFilter !== 'TODOS') {
            filteredDocs = filteredDocs.filter(d => d.tipo === tipoDocFilter);
        }

        // Sort by expiration date (most urgent first)
        filteredDocs.sort((a, b) => {
            const dateA = a.dataFim ? new Date(a.dataFim).getTime() : Infinity;
            const dateB = b.dataFim ? new Date(b.dataFim).getTime() : Infinity;
            return dateA - dateB;
        });

        return filteredDocs;
    };

    const handleGenerate = () => {
        const data = getFilteredData();
        if (data.length === 0) {
            alert("Nenhum documento encontrado para os filtros selecionados.");
            return;
        }

        const reportTitle = "Relatório de Documentos";
        const empresaNome = empresaFilter === 'TODAS' ? 'Todas' : empresas.find(e => e.id === parseInt(empresaFilter))?.nomeFantasia;
        const filterSummary = `Empresa: ${empresaNome}, Status: ${statusFilter}, Tipo: ${tipoDocFilter}`;

        const dataWithEmpresa = data.map(doc => ({
            ...doc,
            empresaNome: empresas.find(e => e.id === doc.empresaId)?.nomeFantasia || 'N/A'
        }));

        if (format === 'pdf') {
            generateDocumentosPrintableHtml(dataWithEmpresa, reportTitle, filterSummary);
        } else {
            generateDocumentosCsv(dataWithEmpresa, reportTitle);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">📄 Gerar Relatório de Documentos</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <SelectField label="Filtrar por Empresa" value={empresaFilter} onChange={e => setEmpresaFilter(e.target.value)}>
                        <option value="TODAS">Todas as Empresas</option>
                        {(empresas || []).map(e => <option key={e.id} value={e.id}>{e.nomeFantasia}</option>)}
                    </SelectField>

                    <SelectField label="Filtrar por Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value as ReportStatusType)}>
                        <option value="TODOS">Todos os Status</option>
                        <option value="VENCENDO">Vencendo</option>
                        <option value="VENCIDO">Vencido</option>
                        <option value="ATIVO">Ativo</option>
                        <option value="ENCERRADO">Encerrado</option>
                    </SelectField>

                    <SelectField label="Filtrar por Tipo de Documento" value={tipoDocFilter} onChange={e => setTipoDocFilter(e.target.value)}>
                        <option value="TODOS">Todos os Tipos</option>
                        {(documentoTipos || []).map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                    </SelectField>

                    <fieldset>
                        <legend className="text-base font-medium text-gray-900">Formato de Saída</legend>
                        <div className="mt-2 flex gap-4">
                            <RadioOption name="format" value="pdf" label="📄 PDF (Impressão)" checked={format === 'pdf'} onChange={v => setFormat(v as FormatType)} />
                            <RadioOption name="format" value="excel" label="📊 Excel (CSV)" checked={format === 'excel'} onChange={v => setFormat(v as FormatType)} />
                        </div>
                    </fieldset>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleGenerate} className="bg-amber-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600">Gerar</button>
                </div>
            </div>
        </div>
    );
};

const SelectField: React.FC<{ label: string; children: React.ReactNode, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ label, children, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            {children}
        </select>
    </div>
);

const RadioOption: React.FC<{name: string, value: string, label: string, checked: boolean, onChange: (value: string) => void}> = 
({ name, value, label, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={() => onChange(value)}
            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
        />
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
);