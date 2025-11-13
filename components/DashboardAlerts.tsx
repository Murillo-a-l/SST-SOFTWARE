import React, { useState, useMemo } from 'react';
import { DocumentoEmpresa, Empresa, DocumentoTipo, DocumentoStatus } from '../types';

interface DashboardAlertsProps {
    documentos: DocumentoEmpresa[];
    empresas: Empresa[];
    documentoTipos: DocumentoTipo[];
}

const getEmpresaNome = (empresaId: number, empresas: Empresa[]): string => {
    return empresas.find(e => e.id === empresaId)?.nomeFantasia || 'Empresa desconhecida';
};

const getDaysDiff = (dataFim: string | null): { diff: number; text: string } => {
    if (!dataFim) return { diff: Infinity, text: '' };

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Extrair apenas YYYY-MM-DD para evitar problemas com ISO completo
    const dataStr = dataFim.split('T')[0];  // "2025-12-01"
    const dataVenc = new Date(dataStr + 'T00:00:00');
    const diffTime = dataVenc.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { diff: diffDays, text: `Vencido há ${Math.abs(diffDays)} dias` };
    if (diffDays === 0) return { diff: diffDays, text: `Vence hoje` };
    return { diff: diffDays, text: `Vence em ${diffDays} dias` };
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ documentos, empresas, documentoTipos }) => {
    const [filterStatus, setFilterStatus] = useState<DocumentoStatus | 'TODOS'>('TODOS');
    const [filterType, setFilterType] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');

    const alerts = useMemo(() => {
        return documentos
            .filter(d => d.status === 'VENCENDO' || d.status === 'VENCIDO')
            .filter(d => filterStatus === 'TODOS' || d.status === filterStatus)
            .filter(d => filterType === 'TODOS' || d.tipo === filterType)
            .filter(d => {
                const empresaNome = getEmpresaNome(d.empresaId, empresas).toLowerCase();
                const docNome = d.nome.toLowerCase();
                const term = searchTerm.toLowerCase();
                return empresaNome.includes(term) || docNome.includes(term);
            })
            .map(d => ({
                ...d,
                diffInfo: getDaysDiff(d.dataFim)
            }))
            .sort((a, b) => a.diffInfo.diff - b.diffInfo.diff) // Sort by urgency
            .slice(0, 20); // Show top 20 most urgent
    }, [documentos, empresas, filterStatus, filterType, searchTerm]);


    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Alertas de Documentos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg border">
                <input
                    type="text"
                    placeholder="🔍 Buscar por nome ou empresa..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="p-2 border rounded-md text-sm"
                />
                 <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="p-2 border rounded-md text-sm">
                    <option value="TODOS">Todos os Status</option>
                    <option value="VENCENDO">Apenas Vencendo</option>
                    <option value="VENCIDO">Apenas Vencidos</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border rounded-md text-sm">
                    <option value="TODOS">Todos os Tipos</option>
                    {documentoTipos.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                </select>
            </div>
            
            {alerts.length > 0 ? (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {alerts.map(doc => (
                        <li key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100">
                            <div>
                                <p className="font-semibold text-gray-800">{doc.nome}</p>
                                <p className="text-xs text-gray-500">{getEmpresaNome(doc.empresaId, empresas)} - {doc.tipo}</p>
                            </div>
                            <span className={`font-bold text-sm ${doc.status === 'VENCIDO' ? 'text-red-600' : 'text-yellow-600'}`}>
                                {doc.diffInfo.text}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum alerta para os filtros selecionados.</p>
                </div>
            )}
        </div>
    );
};