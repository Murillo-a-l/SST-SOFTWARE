import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { DocumentoEmpresa, Empresa, Pasta, DocumentoStatus, SignatureStatus, User } from '../types';
import api from '../services/apiService';
import { Button } from '../src/components/ui/Button';
import { AppIcon } from '../src/components/ui/AppIcon';

interface GerenciadorDocumentosProps {
    empresa: Empresa;
    documentos: DocumentoEmpresa[];
    pastas: Pasta[];
    users: User[];
    currentUser: User;
    onAddDocument: (empresa: Empresa, pastaId: number | null) => void;
    onEditDocument: (empresa: Empresa, pastaId: number | null, documento: DocumentoEmpresa) => void;
    onAddPasta: (empresaId: number, parentId: number | null, pasta?: Pasta) => void;
    onDataChange: () => void;
    setConfirmation: (confirmation: any) => void;
    onOpenSignature?: (documento: DocumentoEmpresa) => void;
}

const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const DotsVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
);

const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
};

const getFileIconForType = (filename: string): string => {
    const ext = getFileExtension(filename).toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) return 'IMG';
    if (['doc', 'docx'].includes(ext)) return 'DOC';
    if (['xls', 'xlsx'].includes(ext)) return 'XLS';
    if (['zip', 'rar', '7z'].includes(ext)) return 'ZIP';
    return 'FILE';
};

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
    const statusInfo: Record<string, { text: string; bgColor: string; textColor: string; title: string }> = {
        NAO_REQUER: {
            text: 'Não Requer',
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-600',
            title: 'Não requer assinatura',
        },
        PENDENTE: {
            text: 'Pendente',
            bgColor: 'bg-amber-100',
            textColor: 'text-amber-700',
            title: `Aguardando assinatura de ${assignedTo}`,
        },
        ASSINADO: {
            text: 'Assinado',
            bgColor: 'bg-green-100',
            textColor: 'text-green-700',
            title: `Assinado${assignedTo ? ` por ${assignedTo}` : ''}`,
        },
        REJEITADO: {
            text: 'Rejeitado',
            bgColor: 'bg-red-100',
            textColor: 'text-red-700',
            title: `Rejeitado${assignedTo ? ` por ${assignedTo}` : ''}`,
        },
    };
    const info = statusInfo[status] || statusInfo.NAO_REQUER;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${info.bgColor} ${info.textColor}`}
            title={info.title}
        >
            {info.text}
        </span>
    );
};

const ActionMenu: React.FC<{
    item: DocumentoEmpresa | Pasta;
    onEdit: () => void;
    onDownload?: () => void;
    onDownloadSigned?: () => void;
    onSetStatus?: (status: DocumentoStatus) => void;
    onDelete: () => void;
    onSign?: () => void;
    currentUser?: User;
}> = ({ item, onEdit, onDownload, onDownloadSigned, onSetStatus, onDelete, onSign, currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.right + window.scrollX - 224,
            });
        }
    }, [isOpen]);

    const isFolder = 'parentId' in item;
    const documento = !isFolder ? (item as DocumentoEmpresa) : null;
    const showSignButton =
        !isFolder &&
        onSign &&
        documento?.statusAssinatura === 'PENDENTE' &&
        documento?.requerAssinaturaDeId === currentUser?.id;
    const showManageSignature = !isFolder && onSign && documento?.statusAssinatura !== 'NAO_REQUER';
    const hasSignedVersion = !isFolder && documento?.arquivoAssinadoBase64 && documento.arquivoAssinadoBase64.length > 0;

    const menuContent = (
        <div
            ref={menuRef}
            className="fixed w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[9999]"
            style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
            }}
        >
            <div className="py-1" role="menu" aria-orientation="vertical">
                <MenuItem onClick={() => { onEdit(); setIsOpen(false); }}>{isFolder ? 'Renomear' : 'Editar'}</MenuItem>
                {!isFolder && onDownload && !hasSignedVersion && (
                    <MenuItem
                        onClick={() => {
                            onDownload();
                            setIsOpen(false);
                        }}
                    >
                        Baixar
                    </MenuItem>
                )}
                {!isFolder && onDownload && hasSignedVersion && (
                    <MenuItem
                        onClick={() => {
                            onDownload();
                            setIsOpen(false);
                        }}
                    >
                        Baixar Original
                    </MenuItem>
                )}
                {!isFolder && hasSignedVersion && onDownloadSigned && (
                    <MenuItem
                        onClick={() => {
                            onDownloadSigned();
                            setIsOpen(false);
                        }}
                    >
                        Baixar Assinado
                    </MenuItem>
                )}
                {showSignButton && (
                    <MenuItem
                        onClick={() => {
                            onSign!();
                            setIsOpen(false);
                        }}
                    >
                        Assinar Documento
                    </MenuItem>
                )}
                {showManageSignature && (
                    <MenuItem
                        onClick={() => {
                            onSign!();
                            setIsOpen(false);
                        }}
                    >
                        Gerenciar Assinatura
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => {
                        onDelete();
                        setIsOpen(false);
                    }}
                    className="text-red-600 hover:bg-red-50 hover:text-red-800"
                >
                    Excluir
                </MenuItem>
            </div>
        </div>
    );

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-500 hover:text-gray-800 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <DotsVerticalIcon />
            </button>
            {isOpen && createPortal(menuContent, document.body)}
        </>
    );
};

const MenuItem: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({
    onClick,
    children,
    className,
}) => (
    <button
        onClick={onClick}
        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className ?? ''}`}
        role="menuitem"
    >
        {children}
    </button>
);

export const GerenciadorDocumentos: React.FC<GerenciadorDocumentosProps> = (props) => {
    const { empresa, documentos, pastas, users, currentUser, onAddDocument, onEditDocument, onAddPasta, onDataChange, setConfirmation, onOpenSignature } = props;

    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('Todos');

    const getBreadcrumbs = useCallback(() => {
        const crumbs = [];
        let current: Pasta | undefined | null = (pastas || []).find((p) => p.id === currentFolderId);
        while (current) {
            crumbs.unshift(current);
            current = (pastas || []).find((p) => p.id === current?.parentId);
        }
        return crumbs;
    }, [currentFolderId, pastas]);

    const filteredItems = useMemo(() => {
        const itemsInFolder = [
            ...(pastas || []).filter((p) => p.empresaId === empresa.id && p.parentId === currentFolderId),
            ...(documentos || []).filter((d) => d.empresaId === empresa.id && d.pastaId === currentFolderId),
        ];

        return itemsInFolder.filter((item) => {
            const matchesSearch = searchTerm === '' || item.nome.toLowerCase().includes(searchTerm.toLowerCase());

            if ('tipo' in item) {
                const matchesType = filterType === 'Todos' || item.tipo === filterType;
                return matchesSearch && matchesType;
            }

            return matchesSearch;
        });
    }, [empresa.id, currentFolderId, pastas, documentos, searchTerm, filterType]);

    const handleDelete = (item: Pasta | DocumentoEmpresa) => {
        const isFolder = 'parentId' in item;
        const confirmMsg = isFolder
            ? `Tem certeza que deseja excluir a pasta "${item.nome}" e todo o seu conteúdo? Esta ação não pode ser desfeita.`
            : `Tem certeza que deseja excluir o documento "${item.nome}"?`;

        setConfirmation({
            title: 'Confirmar Exclusão',
            message: <p>{confirmMsg}</p>,
            confirmButtonText: 'Sim, Excluir',
            confirmButtonClass: 'bg-red-600 hover:bg-red-700',
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
                    toast.error(`Erro ao excluir: ${error.message}`);
                    setConfirmation(null);
                }
            },
        });
    };

    const handleSetStatus = async (doc: DocumentoEmpresa, status: DocumentoStatus) => {
        try {
            await api.documentos.update(doc.id, { status });
            onDataChange();
        } catch (error: any) {
            console.error('Erro ao atualizar status:', error);
            toast.error(`Erro ao atualizar status: ${error.message}`);
        }
    };

    const handleDownload = (doc: DocumentoEmpresa, useSignedVersion: boolean = false) => {
        const performDownload = () => {
            try {
                const fileData = useSignedVersion && doc.arquivoAssinadoBase64 ? doc.arquivoAssinadoBase64 : doc.arquivoBase64;

                let dataUrl = fileData;
                if (!dataUrl.startsWith('data:')) {
                    dataUrl = `data:application/octet-stream;base64,${dataUrl}`;
                }

                const fileName = useSignedVersion ? `[ASSINADO] ${doc.nome}` : doc.nome;

                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Error downloading file:', error);
                toast.error('Não foi possível fazer o download. O arquivo pode estar corrompido.');
            }
        };

        if (doc.dadosSensiveis) {
            setConfirmation({
                title: 'Aviso de Dados Sensíveis',
                message: <p>Este documento foi marcado como contendo dados sensíveis. Deseja continuar com o download?</p>,
                confirmButtonText: 'Sim, Continuar',
                onConfirm: () => {
                    performDownload();
                    setConfirmation(null);
                },
            });
        } else {
            performDownload();
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        const dataStr = dateStr.split('T')[0];
        return new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-3/5">
                    <input
                        type="text"
                        placeholder="Buscar documentos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-[#E3E8F2] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/25 focus:border-[#0F4C5C]"
                    />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="rounded-xl border border-[#E3E8F2] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/25 focus:border-[#0F4C5C]"
                    >
                        <option value="Todos">Todos os Tipos</option>
                        {['ASO', 'Contrato', 'Alvará', 'PGR', 'PCMSO', 'Outro'].map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 w-full lg:w-auto justify-end">
                    <Button
                        variant="primary"
                        size="md"
                        icon={<AppIcon name="folder" className="h-4 w-4" />}
                        className="min-w-[140px] h-[42px]"
                        onClick={() => onAddPasta(empresa.id, currentFolderId)}
                    >
                        Nova Pasta
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        icon={<AppIcon name="plus" className="h-4 w-4" />}
                        className="min-w-[140px] h-[42px]"
                        onClick={() => onAddDocument(empresa, currentFolderId)}
                    >
                        Documento
                    </Button>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                {currentFolderId !== null && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const currentCrumb = breadcrumbs.find((c) => c.id === currentFolderId);
                            setCurrentFolderId(currentCrumb?.parentId || null);
                        }}
                        className="!rounded-xl"
                    >
                        <AppIcon name="chevron-left" className="h-4 w-4" />
                        Voltar
                    </Button>
                )}
                <div className="text-sm text-gray-600">
                    <button onClick={() => setCurrentFolderId(null)} className="hover:underline">
                        Raiz
                    </button>
                    {breadcrumbs.map((crumb) => (
                        <span key={crumb.id}>
                            <span className="mx-1">/</span>
                            <button onClick={() => setCurrentFolderId(crumb.id)} className="hover:underline">
                                {crumb.nome}
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex-grow rounded-2xl border border-[#E0E3E7] bg-white shadow-sm overflow-auto">
                <table className="min-w-full relative">
                    <thead className="bg-[#F1F3F5]">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7480] w-2/5">Nome</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7480]">Tipo</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7480]">Assinatura</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7480]">Vencimento</th>
                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7480]">Status</th>
                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7480]">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => {
                            const isFolder = 'parentId' in item;
                            const assignedUser = !isFolder && item.requerAssinaturaDeId ? users.find((u) => u.id === item.requerAssinaturaDeId)?.nome : 'N/A';
                            return (
                                <tr key={`${isFolder ? 'f-' : 'd-'}${item.id}`} className="border-b border-[#ECECEC] hover:bg-[#F8FAFC]">
                                    <td
                                        onClick={() => isFolder && setCurrentFolderId(item.id)}
                                        className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-slate-800 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            {isFolder ? <FolderIcon /> : <FileIcon />}
                                            <span>{item.nome}</span>
                                            {!isFolder && item.dadosSensiveis && (
                                                <span title="Contém dados sensíveis" className="text-red-500">
                                                    !
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-800">
                                        {isFolder ? (
                                            'Pasta'
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-slate-600">{getFileIconForType(item.nome)}</span>
                                                <span>{item.tipo}</span>
                                                <span className="text-xs text-gray-400">(.{getFileExtension(item.nome)})</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-800">
                                        {!isFolder && <SignatureStatusBadge status={item.statusAssinatura} assignedTo={assignedUser} />}
                                    </td>
                                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-800">{!isFolder && formatDate(item.dataFim)}</td>
                                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-slate-800">{!isFolder && <StatusBadge status={item.status} />}</td>
                                    <td className="px-4 py-2.5 whitespace-nowrap text-center text-sm font-medium">
                                        <ActionMenu
                                            item={item}
                                            onEdit={() =>
                                                isFolder
                                                    ? onAddPasta(empresa.id, item.parentId, item)
                                                    : onEditDocument(empresa, item.pastaId, item)
                                            }
                                            onDelete={() => handleDelete(item)}
                                            onDownload={!isFolder ? () => handleDownload(item, false) : undefined}
                                            onDownloadSigned={!isFolder ? () => handleDownload(item, true) : undefined}
                                            onSetStatus={!isFolder ? (status) => handleSetStatus(item, status) : undefined}
                                            onSign={onOpenSignature && !isFolder ? () => onOpenSignature(item as DocumentoEmpresa) : undefined}
                                            currentUser={currentUser}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredItems.length === 0 && <p className="text-center py-8 text-slate-500">Nenhum item nesta pasta.</p>}
            </div>
        </div>
    );
};
