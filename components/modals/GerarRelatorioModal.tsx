import React, { useState, useMemo } from 'react';
import { DbData } from '../../types';
import { generateCsv, generatePrintableHtml } from '../../utils/reportGenerator';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: DbData;
    selectedEmpresaId: number | null;
}

type ReportType = 'completo' | 'atrasados' | 'vencendo';
type FormatType = 'pdf' | 'excel';
type SortType = 'nome' | 'data_cadastro' | 'urgencia';

export const GerarRelatorioModal: React.FC<ModalProps> = ({ isOpen, onClose, data, selectedEmpresaId }) => {
    const [reportType, setReportType] = useState<ReportType>('completo');
    const [format, setFormat] = useState<FormatType>('pdf');
    const [sort, setSort] = useState<SortType>('nome');
    const [useDateRange, setUseDateRange] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [examType, setExamType] = useState('Todos');

    const selectedEmpresa = useMemo(() => (data.empresas || []).find(e => e.id === selectedEmpresaId), [data.empresas, selectedEmpresaId]);

    // FIX: Filter out null/undefined exam types to prevent key errors.
    const examTypes = useMemo(() => ['Todos', ...new Set((data.examesRealizados || []).map(e => e.tipo_exame).filter(Boolean))], [data.examesRealizados]);

    const getFilteredData = () => {
        // First, filter employees by the globally selected company
        const getEmpresaIdsToInclude = () => {
            if (selectedEmpresaId === null) {
                return (data.empresas || []).map(e => e.id); // All companies
            }
            const filiais = (data.empresas || []).filter(e => e.matrizId === selectedEmpresaId).map(e => e.id);
            return [selectedEmpresaId, ...filiais];
        };
        const includedEmpresaIds = getEmpresaIdsToInclude();

        let funcionariosComExames = (data.funcionarios || [])
            .filter(f => f.ativo && includedEmpresaIds.includes(f.empresaId))
            .map(func => {
                const ultimoExame = (data.examesRealizados || [])
                    .filter(e => e.funcionario_id === func.id)
                    .sort((a, b) => new Date(b.data_realizacao).getTime() - new Date(a.data_realizacao).getTime())[0];
                return { ...func, ultimoExame };
            });

        // Filter by date range (on data_realizacao)
        if (useDateRange && startDate && endDate) {
            funcionariosComExames = funcionariosComExames.filter(f => {
                if (!f.ultimoExame) return false;
                const examDate = new Date(f.ultimoExame.data_realizacao + 'T00:00:00');
                const start = new Date(startDate + 'T00:00:00');
                const end = new Date(endDate + 'T00:00:00');
                return examDate >= start && examDate <= end;
            });
        }
        
        // Filter by exam type
        if (examType !== 'Todos') {
             funcionariosComExames = funcionariosComExames.filter(f => f.ultimoExame?.tipo_exame === examType);
        }

        // Filter by report type (status)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (reportType === 'atrasados') {
            funcionariosComExames = funcionariosComExames.filter(f => {
                if (!f.ultimoExame?.data_vencimento) return false;
                const dataVenc = new Date(f.ultimoExame.data_vencimento + 'T00:00:00');
                return dataVenc.getTime() < hoje.getTime();
            });
        }
        if (reportType === 'vencendo') {
            funcionariosComExames = funcionariosComExames.filter(f => {
                if (!f.ultimoExame?.data_vencimento) return false;
                const dataVenc = new Date(f.ultimoExame.data_vencimento + 'T00:00:00');
                const diffTime = dataVenc.getTime() - hoje.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 30;
            });
        }
        
        // Apply sorting
        switch (sort) {
            case 'data_cadastro':
                funcionariosComExames.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'urgencia':
                funcionariosComExames.sort((a, b) => {
                    const vencA = a.ultimoExame?.data_vencimento ? new Date(a.ultimoExame.data_vencimento).getTime() : Infinity;
                    const vencB = b.ultimoExame?.data_vencimento ? new Date(b.ultimoExame.data_vencimento).getTime() : Infinity;
                    return vencA - vencB;
                });
                break;
            case 'nome':
            default:
                funcionariosComExames.sort((a, b) => a.nome.localeCompare(b.nome));
                break;
        }

        return funcionariosComExames;
    };

    const handleGenerate = () => {
        const filteredData = getFilteredData();

        if (filteredData.length === 0) {
            toast.error("Nenhum dado encontrado para os filtros selecionados.");
            return;
        }
        
        const empresaContexto = selectedEmpresa?.nomeFantasia || 'Todas as Empresas';

        const reportTitles: {[key in ReportType]: string} = {
            completo: `Relatório Completo de Exames - ${empresaContexto}`,
            atrasados: `Relatório de Exames Atrasados - ${empresaContexto}`,
            vencendo: `Relatório de Exames Vencendo - ${empresaContexto}`
        };

        const sortTitles: {[key in SortType]: string} = {
            nome: 'Ordenado por Nome',
            data_cadastro: 'Ordenado por Data de Cadastro',
            urgencia: 'Ordenado por Urgência'
        };
        
        const reportTitle = reportTitles[reportType];

        let filterSummary = `Status: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`;
        if(useDateRange && startDate && endDate) filterSummary += `, Período: ${startDate} a ${endDate}`;
        if(examType !== 'Todos') filterSummary += `, Tipo de Exame: ${examType}`;
        filterSummary += `, ${sortTitles[sort]}`;

        if (format === 'pdf') {
            generatePrintableHtml(filteredData, reportTitle, filterSummary);
        } else { // excel
            generateCsv(filteredData, reportTitle);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-4xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">📊 Gerar Relatório Avançado</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                    {/* Left Column: Filters */}
                    <div className="space-y-6">
                         <fieldset>
                            <legend className="text-base font-medium text-gray-900">Tipo de Relatório</legend>
                            <div className="mt-2 space-y-2">
                                <RadioOption name="reportType" value="completo" label="📊 Completo" checked={reportType === 'completo'} onChange={v => setReportType(v as ReportType)} />
                                <RadioOption name="reportType" value="atrasados" label="⚠️ Atrasados" checked={reportType === 'atrasados'} onChange={v => setReportType(v as ReportType)} />
                                <RadioOption name="reportType" value="vencendo" label="📅 Vencendo (30d)" checked={reportType === 'vencendo'} onChange={v => setReportType(v as ReportType)} />
                            </div>
                        </fieldset>
                        
                        <fieldset>
                            <legend className="text-base font-medium text-gray-900">Filtros Adicionais</legend>
                            <div className="mt-2 space-y-4 p-4 border rounded-md bg-gray-50">
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" checked={useDateRange} onChange={(e) => setUseDateRange(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" />
                                        <span className="text-sm font-medium">Filtrar por período de realização</span>
                                    </label>
                                    {useDateRange && (
                                        <div className="mt-2 flex items-center gap-2 pl-6">
                                            <label htmlFor="startDate" className="text-sm">De:</label>
                                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-1 border rounded-md text-sm w-full"/>
                                            <label htmlFor="endDate" className="text-sm">Até:</label>
                                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-1 border rounded-md text-sm w-full"/>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                <label htmlFor="examType" className="text-sm font-medium whitespace-nowrap">Tipo de exame:</label>
                                <select id="examType" value={examType} onChange={e => setExamType(e.target.value)} className="p-1.5 border rounded-md text-sm w-full">
                                    {examTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                                </div>
                            </div>
                        </fieldset>
                    </div>

                    {/* Right Column: Settings */}
                    <div className="space-y-6">
                         <fieldset>
                            <legend className="text-base font-medium text-gray-900">Ordenação</legend>
                            <div className="mt-2 space-y-2">
                                <RadioOption name="sort" value="nome" label="🔤 Por Nome (A-Z)" checked={sort === 'nome'} onChange={v => setSort(v as SortType)} />
                                <RadioOption name="sort" value="data_cadastro" label="📅 Por Data de Cadastro" checked={sort === 'data_cadastro'} onChange={v => setSort(v as SortType)} />
                                <RadioOption name="sort" value="urgencia" label="⚠️ Por Urgência (Atrasados primeiro)" checked={sort === 'urgencia'} onChange={v => setSort(v as SortType)} />
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend className="text-base font-medium text-gray-900">Formato de Saída</legend>
                            <div className="mt-2 flex gap-4">
                                <RadioOption name="format" value="pdf" label="📄 PDF (Impressão)" checked={format === 'pdf'} onChange={v => setFormat(v as FormatType)} />
                                <RadioOption name="format" value="excel" label="📊 Excel (CSV)" checked={format === 'excel'} onChange={v => setFormat(v as FormatType)} />
                            </div>
                        </fieldset>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleGenerate} className="bg-amber-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600">Gerar</button>
                </div>
            </div>
        </div>
    );
};

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