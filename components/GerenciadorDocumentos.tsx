import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { DocumentoEmpresa, Empresa, Pasta, DocumentoStatus, SignatureStatus, User } from '../types';
import api from '../services/apiService';

interface GerenciadorDocumentosProps {
    empresa: Empresa;
    documentos: DocumentoEmpresa[];
    pastas: Pasta[];
    users: User[];
    currentUser: User;
    onAddDocument: (empresa: Empresa, pastaId: number | null) => void;
    onEditDocument: (empresa: Empresa, pastaId: number | null, documento: DocumentoEmpresa) => void;
    onAddPasta: (empresaId: number, parentId: number | null) => void;
    onDataChange: () => void;
    setConfirmation: (confirmation: any) => void;
}

const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const DotsVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>;

const StatusBadge: React.FC<{ status: DocumentoStatus }> = ({ status }) => {
    const statusStyles: Record<DocumentoStatus, string> = {
        ATIVO: 'bg-green-100 text-green-800',
        VENCENDO: 'bg-yellow-100 text-yellow-800 animate-pulse',
        VENCIDO: 'bg-red-100 text-red-800',
        ENCERRADO: 'bg-gray-200 text-gray-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

const SignatureStatusBadge: React.FC<{ status: SignatureStatus, assignedTo?: string }> = ({ status, assignedTo }) => {
    const statusInfo: Record<string, { text: string; icon: string; className: string; title: string }> = {
        'NAO_REQUER': { text: 'N/A', icon: '➖', className: 'text-gray-500', title: 'Não requer assinatura' },
        'PENDENTE': { text: 'Pendente', icon: '✍️', className: 'text-orange-600', title: `Aguardando assinatura de ${assignedTo}` },
        'ASSINADO': { text: 'Assinado', icon: '✔️', className: 'text-green-600', title: `Assinado por ${assignedTo}` },
        'REJEITADO': { text: 'Rejeitado', icon: '❌', className: 'text-red-600', title: `Rejeitado por ${assignedTo}` },
    };
    const info = statusInfo[status] || statusInfo['NAO_REQUER']; // Fallback para NAO_REQUER se status não for reconhecido
    return (
        <span className={`flex items-center gap-1 text-sm font-semibold ${info.className}`} title={info.title}>
            {info.icon}
            <span>{info.text}</span>
        </span>
    );
};

// Action Menu Component
const ActionMenu: React.FC<{ item: DocumentoEmpresa | Pasta, onEdit: () => void, onDownload?: () => void, onSetStatus?: (status: DocumentoStatus) => void, onDelete: () => void }> = 
({ item, onEdit, onDownload, onSetStatus, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isFolder = 'parentId' in item;

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-800 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <DotsVerticalIcon />
            </button>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <MenuItem onClick={() => { onEdit(); setIsOpen(false); }}>{isFolder ? 'Renomear' : 'Editar'}</MenuItem>
                        {!isFolder && onDownload && <MenuItem onClick={() => { onDownload(); setIsOpen(false); }}>Baixar</MenuItem>}
                        {!isFolder && onSetStatus && item.status !== 'ENCERRADO' && <MenuItem onClick={() => { onSetStatus('ENCERRADO'); setIsOpen(false); }}>Encerrar</MenuItem>}
                        <MenuItem onClick={() => { onDelete(); setIsOpen(false); }} className="text-red-600 hover:bg-red-50 hover:text-red-800">Excluir</MenuItem>
                    </div>
                </div>
            )}
        </div>
    );
};

const MenuItem: React.FC<{ onClick: () => void, children: React.ReactNode, className?: string }> = ({ onClick, children, className }) => (
    <button onClick={onClick} className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`} role="menuitem">
        {children}
    </button>
);


export const GerenciadorDocumentos: React.FC<GerenciadorDocumentosProps> = (props) => {
    const { empresa, documentos, pastas, users, currentUser, onAddDocument, onEditDocument, onAddPasta, onDataChange, setConfirmation } = props;
    
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('Todos');

    const getBreadcrumbs = useCallback(() => {
        const crumbs = [];
        let current: Pasta | undefined | null = (pastas || []).find(p => p.id === currentFolderId);
        while(current) {
            crumbs.unshift(current);
            current = (pastas || []).find(p => p.id === current.parentId);
        }
        return crumbs;
    }, [currentFolderId, pastas]);

    const filteredItems = useMemo(() => {
        const itemsInFolder = [
            ...(pastas || []).filter(p => p.empresaId === empresa.id && p.parentId === currentFolderId),
            ...(documentos || []).filter(d => d.empresaId === empresa.id && d.pastaId === currentFolderId)
        ];

        return itemsInFolder.filter(item => {
            const matchesSearch = searchTerm === '' || item.nome.toLowerCase().includes(searchTerm.toLowerCase());
            
            if ('tipo' in item) { // It's a Documento
                const matchesType = filterType === 'Todos' || item.tipo === filterType;
                return matchesSearch && matchesType;
            }
            
            return matchesSearch; // It's a Pasta, only search applies
        });

    }, [empresa.id, currentFolderId, pastas, documentos, searchTerm, filterType]);

    const handleDelete = (item: Pasta | DocumentoEmpresa) => {
        const isFolder = 'parentId' in item;
        const confirmMsg = isFolder
            ? `Tem certeza que deseja excluir a pasta "${item.nome}" e todo o seu conteúdo? Esta ação não pode ser desfeita.`
            : `Tem certeza que deseja excluir o documento "${item.nome}"?`;

        setConfirmation({
            title: `Confirmar Exclusão`,
            message: <p>{confirmMsg}</p>,
            confirmButtonText: "Sim, Excluir",
            confirmButtonClass: "bg-red-600 hover:bg-red-700",
            onConfirm: async () => {
                try {
                    if (isFolder) {
                        await api.pastas.delete(item.id);
                    } else {
                        await api.documentos.delete(item.id);
                    }
                    onDataChange();
                    setConfirmation(null);
                } catch (error: any) {
                    console.error('Erro ao excluir:', error);
                    alert(`Erro ao excluir: ${error.message}`);
                    setConfirmation(null);
                }
            }
        });
    };

    const handleSetStatus = async (doc: DocumentoEmpresa, status: DocumentoStatus) => {
        try {
            await api.documentos.update(doc.id, { status });
            onDataChange();
        } catch (error: any) {
            console.error('Erro ao atualizar status:', error);
            alert(`Erro ao atualizar status: ${error.message}`);
        }
    };

    const handleDownload = (doc: DocumentoEmpresa) => {
        const performDownload = () => {
            try {
                const link = document.createElement('a');
                link.href = doc.arquivoBase64;
                link.download = doc.nome;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error("Error downloading file:", error);
                alert("Não foi possível fazer o download. O arquivo pode estar corrompido.");
            }
        };

        if (doc.dadosSensiveis) {
             setConfirmation({
                title: `Aviso de Dados Sensíveis`,
                message: <p>Este documento foi marcado como contendo dados sensíveis. Deseja continuar com o download?</p>,
                confirmButtonText: "Sim, Continuar",
                onConfirm: () => {
                    performDownload();
                    setConfirmation(null);
                }
            });
        } else {
            performDownload();
        }
    };
    
    const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <div className="flex-grow flex items-center gap-2 w-full sm:w-auto">
                    <input type="text" placeholder="🔍 Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border rounded-lg w-full"/>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border rounded-lg">
                        <option value="Todos">Todos os Tipos</option>
                        {['ASO', 'Contrato', 'Alvará', 'PGR', 'PCMSO', 'Outro'].map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                 <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => onAddPasta(empresa.id, currentFolderId)} className="w-full bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition text-sm">
                        + Nova Pasta
                    </button>
                    <button onClick={() => onAddDocument(empresa, currentFolderId)} className="w-full bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition text-sm">
                        + Documento
                    </button>
                </div>
            </div>
            
            <div className="mb-4 text-sm text-gray-600">
                <button onClick={() => setCurrentFolderId(null)} className="hover:underline">Raiz</button>
                {breadcrumbs.map(crumb => (
                    <span key={crumb.id}>
                        <span className="mx-1">/</span>
                        <button onClick={() => setCurrentFolderId(crumb.id)} className="hover:underline">{crumb.nome}</button>
                    </span>
                ))}
            </div>

            <div className="overflow-auto flex-grow border rounded-lg">
                 <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Nome</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assinatura</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredItems.map(item => {
                            const isFolder = 'parentId' in item;
                            const assignedUser = !isFolder && item.requerAssinaturaDeId ? users.find(u => u.id === item.requerAssinaturaDeId)?.nome : 'N/A';
                            return (
                                <tr key={(isFolder ? 'f-' : 'd-') + item.id} className="hover:bg-gray-50">
                                    <td onDoubleClick={() => isFolder && setCurrentFolderId(item.id)} className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            {isFolder ? <FolderIcon /> : <FileIcon />}
                                            <span>{item.nome}</span>
                                            {!isFolder && item.dadosSensiveis && <span title="Contém dados sensíveis" className="text-red-500">⚠️</span>}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{isFolder ? 'Pasta' : item.tipo}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {!isFolder && <SignatureStatusBadge status={item.statusAssinatura} assignedTo={assignedUser} />}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{!isFolder && formatDate(item.dataFim)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{!isFolder && <StatusBadge status={item.status} />}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
                                        <ActionMenu 
                                            item={item}
                                            onEdit={() => isFolder ? console.log('Edit folder not implemented') : onEditDocument(empresa, item.pastaId, item)}
                                            onDelete={() => handleDelete(item)}
                                            onDownload={!isFolder ? () => handleDownload(item) : undefined}
                                            onSetStatus={!isFolder ? (status) => handleSetStatus(item, status) : undefined}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                 {filteredItems.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum item nesta pasta.</p>}
            </div>
        </div>
    );
};
