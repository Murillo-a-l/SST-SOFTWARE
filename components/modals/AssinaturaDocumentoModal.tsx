// @ts-nocheck
import React, { useState } from 'react';
import { DocumentoEmpresa, User } from '../../types';
import { documentoApi, ApiError } from '../../services/apiService';
import toast from 'react-hot-toast';
import { modalOverlay, modalPanel, modalHeader, modalBody, modalFooter } from '../common/modalStyles';
import { Button } from '../../src/components/ui/Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onActionSuccess: () => void;
    documento: DocumentoEmpresa | null;
    solicitadoPor: User | null;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const AssinaturaDocumentoModal: React.FC<ModalProps> = ({ isOpen, onClose, onActionSuccess, documento, solicitadoPor }) => {
    const [arquivoAssinadoBase64, setArquivoAssinadoBase64] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');
    const [motivoRejeicao, setMotivoRejeicao] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !documento) return null;

    const temArquivoAssinado = documento.arquivoAssinadoBase64 && documento.arquivoAssinadoBase64.length > 0;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setFileName(file.name);
        try {
            const base64 = await blobToBase64(file);
            setArquivoAssinadoBase64(base64);
            toast.success('Arquivo carregado com sucesso!');
        } catch (error) {
            console.error("Error converting file to Base64:", error);
            toast.error("Erro ao processar o arquivo.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadOriginal = () => {
        try {
            const link = document.createElement('a');
            link.href = documento.arquivoBase64;
            link.download = `${documento.nome}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error("Não foi possível iniciar o download.");
        }
    };

    const handleDownloadAssinado = () => {
        if (!documento.arquivoAssinadoBase64) {
            toast.error("Nenhum arquivo assinado disponível.");
            return;
        }
        try {
            const link = document.createElement('a');
            link.href = documento.arquivoAssinadoBase64;
            link.download = `[ASSINADO] ${documento.nome}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error("Não foi possível iniciar o download.");
        }
    };

    // OPÇÃO 1: Enviar documento assinado
    const handleEnviarAssinado = async () => {
        if (!arquivoAssinadoBase64) {
            toast.error("Por favor, selecione um arquivo PDF assinado.");
            return;
        }

        setIsProcessing(true);
        try {
            await documentoApi.uploadAssinado(documento.id, {
                arquivoAssinadoBase64,
            });
            toast.success("Documento assinado enviado com sucesso!");
            onActionSuccess();
            onClose();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao enviar documento assinado.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // OPÇÃO 2: Marcar como assinado (sem enviar arquivo)
    const handleMarcarComoAssinado = async () => {
        setIsProcessing(true);
        try {
            await documentoApi.update(documento.id, {
                statusAssinatura: 'ASSINADO',
                dataConclusaoAssinatura: new Date().toISOString(),
            });
            toast.success("Documento marcado como assinado!");
            onActionSuccess();
            onClose();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao marcar documento como assinado.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // OPÇÃO 3: Rejeitar assinatura
    const handleRejeitar = async () => {
        if (!motivoRejeicao.trim()) {
            toast.error("O motivo da rejeição é obrigatório.");
            return;
        }

        setIsProcessing(true);
        try {
            await documentoApi.invalidarAssinatura(documento.id, motivoRejeicao);
            toast.success("Assinatura rejeitada com sucesso.");
            onActionSuccess();
            onClose();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao rejeitar assinatura.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // OPÇÃO 4: Apagar documento assinado
    const handleApagarAssinado = async () => {
        if (!window.confirm('Tem certeza que deseja apagar o documento assinado? O status voltará para PENDENTE.')) {
            return;
        }

        setIsProcessing(true);
        try {
            await documentoApi.resetAssinado(documento.id);
            toast.success("Documento assinado removido com sucesso!");
            onActionSuccess();
            onClose();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao remover documento assinado.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={modalOverlay}>
            <div className={`${modalPanel} max-w-3xl max-h-[90vh] flex flex-col`}>
                <div className={modalHeader}>
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Assinatura de Documento</p>
                        <h2 className="text-lg font-semibold text-slate-800">{documento.nome}</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>

                <div className={`${modalBody} overflow-y-auto space-y-4`}>
                    {/* 📄 BLOCO 1 — INFORMAÇÕES DO DOCUMENTO */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                        <h3 className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3] font-semibold">📄 Informações do Documento</h3>
                        <div className="space-y-1 text-sm text-slate-700">
                            <p><span className="font-medium">Nome:</span> {documento.nome}</p>
                            <p><span className="font-medium">Tipo:</span> {documento.tipo}</p>
                            <p><span className="font-medium">Status de Assinatura:</span> <span className={`font-semibold ${
                                documento.statusAssinatura === 'PENDENTE' ? 'text-amber-600' :
                                documento.statusAssinatura === 'ASSINADO' ? 'text-green-600' :
                                documento.statusAssinatura === 'REJEITADO' ? 'text-red-600' :
                                'text-gray-500'
                            }`}>{documento.statusAssinatura}</span></p>
                            <p><span className="font-medium">Solicitado por:</span> {solicitadoPor?.nome || 'Usuário desconhecido'}</p>
                            {documento.dataSolicitacaoAssinatura && (
                                <p><span className="font-medium">Data da Solicitação:</span> {new Date(documento.dataSolicitacaoAssinatura).toLocaleDateString('pt-BR')}</p>
                            )}
                        </div>
                    </div>

                    {/* 📑 BLOCO 2 — DOCUMENTO ORIGINAL */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                        <h3 className="text-xs uppercase tracking-[0.18em] text-blue-800 font-semibold">📑 Documento Original</h3>
                        <p className="text-sm text-slate-700">O documento original não pode ser substituído.</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleDownloadOriginal}
                            className="w-full"
                        >
                            📥 Baixar Documento Original
                        </Button>
                    </div>

                    {/* ✒️ BLOCO 3 — DOCUMENTO ASSINADO */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                        <h3 className="text-xs uppercase tracking-[0.18em] text-green-800 font-semibold">✒️ Documento Assinado</h3>

                        {!temArquivoAssinado ? (
                            <div className="space-y-3">
                                <p className="text-sm text-slate-600 italic">Nenhum documento assinado enviado.</p>

                                {/* 1️⃣ OPÇÃO 1: ENVIAR DOCUMENTO ASSINADO */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Selecione o documento assinado (PDF):
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-[#2F5C8C] file:text-white
                                            hover:file:bg-[#274B73]
                                            file:cursor-pointer cursor-pointer"
                                    />
                                    {fileName && <p className="text-xs text-slate-500">📎 {fileName}</p>}
                                    <Button
                                        size="sm"
                                        onClick={handleEnviarAssinado}
                                        disabled={!arquivoAssinadoBase64 || isProcessing}
                                        className="w-full"
                                    >
                                        {isProcessing ? 'Enviando...' : '✅ Enviar Documento Assinado'}
                                    </Button>
                                </div>

                                <div className="border-t border-green-300 pt-2">
                                    <p className="text-xs text-slate-600 mb-2">Ou assinar digitalmente (funcionalidade futura):</p>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        disabled
                                        className="w-full"
                                    >
                                        🖊️ Assinar Digitalmente (em breve)
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-green-700 font-medium">✓ Documento assinado disponível</p>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleDownloadAssinado}
                                        className="w-full"
                                    >
                                        📥 Baixar Documento Assinado
                                    </Button>

                                    {/* 4️⃣ OPÇÃO 4: SUBSTITUIR DOCUMENTO ASSINADO */}
                                    <div className="border-t border-green-300 pt-3 mt-2">
                                        <p className="text-sm text-amber-700 font-medium mb-2">⚠️ Anexou o documento errado?</p>
                                        <p className="text-xs text-slate-600 mb-3">Clique abaixo para remover o documento assinado atual. Após isso, você poderá enviar um novo arquivo.</p>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleApagarAssinado}
                                            disabled={isProcessing}
                                            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
                                        >
                                            {isProcessing ? 'Processando...' : '🗑️ Remover e Enviar Novo Documento'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 🔄 BLOCO 4 — AÇÕES DE FLUXO */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                        <h3 className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3] font-semibold">🔄 Ações de Fluxo</h3>

                        {/* 2️⃣ OPÇÃO 2: MARCAR COMO ASSINADO SEM UPLOAD */}
                        <div>
                            <p className="text-sm text-slate-600 mb-2">Confirmar assinatura sem enviar arquivo:</p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleMarcarComoAssinado}
                                disabled={isProcessing}
                                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
                            >
                                ✓ Confirmar Assinatura
                            </Button>
                        </div>

                        {/* 3️⃣ OPÇÃO 3: REJEITAR ASSINATURA */}
                        <div className="border-t border-slate-300 pt-3">
                            <p className="text-sm text-slate-600 mb-2">Rejeitar o documento:</p>
                            <textarea
                                value={motivoRejeicao}
                                onChange={(e) => setMotivoRejeicao(e.target.value)}
                                placeholder="Digite o motivo da rejeição (obrigatório)..."
                                rows={3}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 mb-2"
                            />
                            <Button
                                size="sm"
                                onClick={handleRejeitar}
                                disabled={isProcessing}
                                className="w-full bg-red-600 hover:bg-red-700"
                            >
                                ❌ Rejeitar Assinatura
                            </Button>
                        </div>
                    </div>
                </div>

                <div className={modalFooter}>
                    <Button variant="secondary" size="sm" onClick={onClose} disabled={isProcessing}>
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
};
