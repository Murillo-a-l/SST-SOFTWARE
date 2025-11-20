// @ts-nocheck
import React, { useState } from 'react';
import { DocumentoEmpresa, User } from '../../types';
import { documentoApi, ApiError } from '../../services/apiService';
import toast from 'react-hot-toast';

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
    const [novaVersaoBase64, setNovaVersaoBase64] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    if (!isOpen || !documento) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setFileName(file.name);
        try {
            const base64 = await blobToBase64(file);
            setNovaVersaoBase64(base64);
        } catch (error) {
            console.error("Error converting file to Base64:", error);
            toast.error("Erro ao processar o arquivo.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownload = () => {
        try {
            const link = document.createElement('a');
            link.href = documento.arquivoBase64;
            link.download = `[PARA ASSINAR] ${documento.nome}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.error("Não foi possível iniciar o download.");
        }
    };

    const handleSubmit = async (action: 'approve' | 'approve_upload' | 'reject') => {
        try {
            switch (action) {
                case 'approve_upload':
                    if (!novaVersaoBase64) {
                        toast.error("Por favor, selecione um arquivo para anexar.");
                        return;
                    }
                    // Cria NOVO documento com assinatura (preserva o original)
                    await documentoApi.assinar(documento.id, {
                        arquivoAssinadoBase64: novaVersaoBase64,
                        statusAssinatura: 'ASSINADO',
                    });
                    toast.success("Documento assinado criado com sucesso! O documento original foi preservado.");
                    break;

                case 'approve':
                    // Atualiza o documento existente (sem criar novo)
                    await documentoApi.update(documento.id, {
                        statusAssinatura: 'ASSINADO',
                        dataConclusaoAssinatura: new Date().toISOString(),
                    });
                    toast.success("Documento marcado como assinado!");
                    break;

                case 'reject':
                    if (!rejectionReason.trim()) {
                        toast.error("A justificativa é obrigatória para rejeitar o documento.");
                        return;
                    }
                    // Atualiza o documento existente (sem criar novo)
                    await documentoApi.update(documento.id, {
                        statusAssinatura: 'REJEITADO',
                        dataConclusaoAssinatura: new Date().toISOString(),
                        observacoesAssinatura: rejectionReason,
                    });
                    toast.success("Documento rejeitado com justificativa.");
                    break;

                default:
                    return;
            }

            onActionSuccess();
            onClose();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao registrar ação. Tente novamente.');
            }
        }
    };


    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-blue-50">
                    <h2 className="text-lg font-bold text-gray-800">Ação de Assinatura Requerida</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-5 overflow-y-auto space-y-3">
                    <div className="bg-gray-50 p-3 rounded border">
                        <p className="font-medium text-sm">{documento.nome}</p>
                        <p className="text-xs text-gray-600 mt-1">Solicitado por: {solicitadoPor?.nome || 'Usuário desconhecido'}</p>
                        <button onClick={handleDownload} className="text-xs text-blue-600 hover:underline mt-1">📥 Baixar original</button>
                    </div>

                    <div className="border rounded p-3 bg-green-50">
                        <h3 className="font-semibold text-sm mb-1">Opção 1: Enviar Versão Assinada</h3>
                        <p className="text-xs text-gray-600 mb-2">Cria um novo documento preservando o original.</p>
                        <input id="file-upload" type="file" onChange={handleFileChange} className="text-xs w-full" />
                        {fileName && <p className="text-xs text-gray-500 mt-1">📎 {fileName}</p>}
                        <button onClick={() => handleSubmit('approve_upload')} disabled={!novaVersaoBase64 || isProcessing} className="mt-2 w-full bg-green-600 text-white text-sm font-semibold py-2 rounded hover:bg-green-700 transition disabled:bg-gray-300">
                            {isProcessing ? 'Processando...' : 'Enviar Documento Assinado'}
                        </button>
                    </div>

                    <div className="border rounded p-3">
                         <h3 className="font-semibold text-sm mb-1">Opção 2: Apenas Confirmar</h3>
                         <p className="text-xs text-gray-500 mb-2">Marcar como concluído sem enviar arquivo.</p>
                         <button onClick={() => handleSubmit('approve')} className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded hover:bg-blue-700 transition">
                            Marcar como Assinado
                        </button>
                    </div>

                    <div className="border rounded p-3 bg-red-50">
                         <h3 className="font-semibold text-sm mb-1">Opção 3: Rejeitar</h3>
                         <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Justificativa da rejeição..."
                            rows={2}
                            className="w-full p-2 border rounded text-xs"
                         />
                         <button onClick={() => handleSubmit('reject')} className="mt-2 w-full bg-red-600 text-white text-sm font-semibold py-2 rounded hover:bg-red-700 transition">
                            Rejeitar
                        </button>
                    </div>

                </div>
                 <div className="p-3 bg-gray-50 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-300">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
