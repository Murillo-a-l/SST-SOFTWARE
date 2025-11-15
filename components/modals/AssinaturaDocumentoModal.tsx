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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">✍️ Ação de Assinatura Requerida</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="font-semibold">{documento.nome}</p>
                        <p className="text-sm text-gray-600">Solicitado por: {solicitadoPor?.nome || 'Usuário desconhecido'}</p>
                        <button onClick={handleDownload} className="text-sm text-indigo-600 hover:underline mt-2">Baixar documento original</button>
                    </div>

                    <div className="border rounded-md p-4 bg-green-50">
                        <h3 className="font-semibold mb-2">📄 Opção 1: Anexar Versão Assinada (Recomendado)</h3>
                        <p className="text-xs text-gray-600 mb-2">Um novo documento será criado com o arquivo assinado. O documento original será preservado.</p>
                        <input id="file-upload" type="file" onChange={handleFileChange} className="text-sm" />
                        {fileName && <p className="text-xs text-gray-500 mt-1">{fileName}</p>}
                        <button onClick={() => handleSubmit('approve_upload')} disabled={!novaVersaoBase64 || isProcessing} className="mt-2 w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400">
                            {isProcessing ? 'Processando...' : 'Criar Documento Assinado'}
                        </button>
                    </div>
                    
                    <div className="border rounded-md p-4">
                         <h3 className="font-semibold mb-2">Opção 2: Marcar como Concluído</h3>
                         <p className="text-xs text-gray-500 mb-2">Use esta opção se o documento foi assinado fisicamente ou por outros meios e você só precisa confirmar a tarefa.</p>
                         <button onClick={() => handleSubmit('approve')} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                            Marcar como Assinado
                        </button>
                    </div>

                    <div className="border rounded-md p-4">
                         <h3 className="font-semibold mb-2">Opção 3: Rejeitar Documento</h3>
                         <textarea 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Escreva a justificativa para a rejeição aqui..."
                            rows={3}
                            className="w-full p-2 border rounded-md"
                         />
                         <button onClick={() => handleSubmit('reject')} className="mt-2 w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition">
                            Rejeitar com Justificativa
                        </button>
                    </div>

                </div>
                 <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
