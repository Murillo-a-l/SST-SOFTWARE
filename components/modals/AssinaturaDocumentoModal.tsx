// @ts-nocheck
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DocumentoEmpresa, User } from '../../types';
import { documentoApi, ApiError } from '../../services/apiService';
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

const getBase64SizeLabel = (b64?: string | null) => {
  if (!b64) return '';
  const cleaned = b64.split(',').pop() || '';
  const padding = cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0;
  const bytes = Math.max(0, (cleaned.length * 3) / 4 - padding);
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const AssinaturaDocumentoModal: React.FC<ModalProps> = ({ isOpen, onClose, onActionSuccess, documento, solicitadoPor }) => {
  const [arquivoAssinadoBase64, setArquivoAssinadoBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [signedRemoved, setSignedRemoved] = useState(false);
  const [statusAssinaturaLocal, setStatusAssinaturaLocal] = useState<string | null>(null);

  const toastStyle = {
    background: '#FFFFFF',
    backdropFilter: 'none',
    border: '1px solid rgba(227, 232, 242, 0.6)',
    boxShadow: '0 12px 28px rgba(12,26,45,0.12)',
    color: '#0F172A',
    fontSize: '13.5px',
    fontFamily: '"Segoe UI", "Inter", system-ui, -apple-system, sans-serif',
  } as const;

  const success = (message: string) => toast.success(message, { icon: null, style: toastStyle });
  const error = (message: string) => toast.error(message, { icon: null, style: toastStyle });

  useEffect(() => {
    if (isOpen) {
      setArquivoAssinadoBase64(null);
      setFileName('');
      setMotivoRejeicao('');
      setSignedRemoved(false);
      setStatusAssinaturaLocal(null);
    }
  }, [isOpen]);

  if (!isOpen || !documento) return null;

  const temArquivoAssinado = documento.arquivoAssinadoBase64 && documento.arquivoAssinadoBase64.length > 0;
  const hasExistingSigned = temArquivoAssinado && !signedRemoved;
  const statusAssinaturaView = statusAssinaturaLocal || documento.statusAssinatura;
  const canConfirm = Boolean(arquivoAssinadoBase64 || hasExistingSigned);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);
    try {
      const base64 = await blobToBase64(file);
      setArquivoAssinadoBase64(base64);
      success('PDF carregado.');
    } catch (error) {
      console.error('Error converting file to Base64:', error);
      error('Erro ao processar o arquivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setArquivoAssinadoBase64(null);
    setFileName('');
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
      error('Não foi possível baixar o original.');
    }
  };

  const handleDownloadAssinado = () => {
    const source = arquivoAssinadoBase64 || documento.arquivoAssinadoBase64;
    if (!source) {
      toast.error('Nenhum arquivo assinado disponível.');
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = source;
      link.download = `[ASSINADO] ${documento.nome}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      error('Não foi possível baixar o arquivo assinado.');
    }
  };

  const handleConfirmAssinatura = async () => {
    if (!arquivoAssinadoBase64 && !hasExistingSigned) {
      error('Selecione um PDF assinado antes de confirmar.');
      return;
    }

    setIsProcessing(true);
    try {
      if (arquivoAssinadoBase64) {
        await documentoApi.uploadAssinado(documento.id, { arquivoAssinadoBase64 });
        success('PDF assinado enviado.');
      } else {
        await documentoApi.update(documento.id, {
          statusAssinatura: 'ASSINADO',
          dataConclusaoAssinatura: new Date().toISOString(),
        });
        success('Assinatura confirmada.');
      }
      onActionSuccess();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        error(error.message);
      } else {
        error('Erro ao confirmar assinatura.');
      }
    } finally {
      setIsProcessing(false);
      setArquivoAssinadoBase64(null);
      setFileName('');
    }
  };

  const handleRejeitar = async () => {
    if (!motivoRejeicao.trim()) {
      error('Informe o motivo para rejeitar.');
      return;
    }

    setIsProcessing(true);
    try {
      await documentoApi.invalidarAssinatura(documento.id, motivoRejeicao);
      success('Assinatura rejeitada.');
      onActionSuccess();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        error(error.message);
      } else {
        error('Erro ao rejeitar assinatura.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApagarAssinado = async () => {
    setIsProcessing(true);
    try {
      await documentoApi.resetAssinado(documento.id);
      success('Arquivo assinado removido. Selecione um novo PDF.');
      setSignedRemoved(true);
      setArquivoAssinadoBase64(null);
      setFileName('');
      setStatusAssinaturaLocal('PENDENTE');
      onActionSuccess();
    } catch (error) {
      if (error instanceof ApiError) {
        error(error.message);
      } else {
        error('Erro ao remover documento assinado.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={modalOverlay}>
      <div className={`${modalPanel} max-w-5xl w-full min-h-[0] max-h-[92vh] flex flex-col`}>
        <div className={`${modalHeader} border-b border-[#E3E8F2] pb-4`}>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7B8EA3]">Assinatura de Documento</p>
            <h2 className="text-xl font-bold text-slate-900">{documento.nome}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700">Tipo: {documento.tipo}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${
                  statusAssinaturaView === 'PENDENTE'
                    ? 'bg-amber-100 text-amber-700'
                    : statusAssinaturaView === 'ASSINADO'
                    ? 'bg-green-100 text-green-700'
                    : statusAssinaturaView === 'REJEITADO'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {statusAssinaturaView}
              </span>
              <span>
                Solicitado por: {solicitadoPor?.nome || 'Usuário desconhecido'}
                {documento.dataSolicitacaoAssinatura && <> em: {new Date(documento.dataSolicitacaoAssinatura).toLocaleDateString('pt-BR')}</>}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>

        <div className={`${modalBody} overflow-y-auto`}>
          <div className="grid gap-4 lg:grid-cols-3 auto-rows-fr">
            <div className="border border-[#E3E8F2] rounded-xl p-4 space-y-4 bg-[#F7FAFE]">
              <h3 className="text-[11px] uppercase tracking-[0.12em] text-[#0F4C5C] font-semibold">1. Baixar documento original</h3>
              <p className="text-sm text-slate-700">Baixe o original para revisar e, se necessário, assinar manualmente.</p>
              <div className="mt-8 flex justify-center px-4 pt-4 pb-5 border-2 border-[#D5D8DC] border-dashed rounded-xl bg-white/70">
                <div className="space-y-2 text-center w-full">
                  <svg className="mx-auto h-10 w-10 text-[#7B8EA3]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M24 6v22m0 0l-8-8m8 8l8-8M10 34h28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <Button variant="secondary" size="md" onClick={handleDownloadOriginal} className="w-full">
                    Baixar Documento Original
                  </Button>
                </div>
              </div>
            </div>

            <div className="border border-[#E3E8F2] rounded-xl p-4 bg-[#F6FFF8] flex flex-col space-y-3">
              <h3 className="text-[11px] uppercase tracking-[0.12em] text-[#1C6B3C] font-semibold">2. Enviar PDF assinado</h3>
              <p className="text-sm text-slate-600 italic">Após assinar o documento, envie o PDF assinado.</p>

              {arquivoAssinadoBase64 ? (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-col items-center justify-center gap-1 border border-[#E3E8F2] bg-white rounded-lg px-3 py-4 text-center">
                    <div className="text-xs font-semibold text-green-700">PDF</div>
                    <div className="text-sm font-medium text-slate-800">{fileName}</div>
                    <div className="text-[11px] text-slate-500">{getBase64SizeLabel(arquivoAssinadoBase64)}</div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      × Remover
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">Arquivo pronto para envio. Confirme abaixo.</p>
                </div>
              ) : hasExistingSigned ? (
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <div className="flex flex-col items-center justify-center gap-1 border border-[#E3E8F2] bg-white rounded-lg px-3 py-4 text-center">
                    <div className="text-xs font-semibold text-green-700">PDF</div>
                    <div className="text-sm font-medium text-slate-800">{documento.nome}</div>
                    <div className="text-[11px] text-slate-500">{getBase64SizeLabel(documento.arquivoAssinadoBase64)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="w-full" onClick={handleDownloadAssinado}>Baixar Assinado</Button>
                    <Button variant="secondary" size="sm" className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300" onClick={handleApagarAssinado} disabled={isProcessing}>
                      {isProcessing ? 'Processando...' : 'Remover e Enviar Novo'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="mt-8 flex justify-center px-4 pt-4 pb-5 border-2 border-[#D5D8DC] border-dashed rounded-xl bg-white/70">
                    <div className="space-y-2 text-center w-full">
                      <svg className="mx-auto h-10 w-10 text-[#7B8EA3]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-[#0F4C5C] hover:text-[#0d3f4c]">
                        <span>Selecionar PDF assinado</span>
                        <input id="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} />
                      </label>
                      {isProcessing && <p className="text-xs text-[#0F4C5C]">Processando...</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-[#E3E8F2] rounded-xl p-4 space-y-3 bg-white/70">
              <h3 className="text-[11px] uppercase tracking-[0.12em] text-[#7B8EA3] font-semibold">3. Rejeitar (último recurso)</h3>
              <p className="text-sm text-slate-600">Explique o motivo antes de rejeitar o documento.</p>
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Digite o motivo da rejeição (obrigatório)..."
                rows={3}
                className="w-full rounded-xl border border-[#E3E8F2] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 mb-2"
              />
              <Button
                variant="danger"
                size="md"
                onClick={handleRejeitar}
                disabled={isProcessing}
                className="w-full"
              >
                Rejeitar Assinatura
              </Button>
            </div>
          </div>
        </div>

        <div className={`${modalFooter} border-t border-[#E3E8F2]`}>
          <div className="flex w-full justify-end gap-2">
            <Button variant="secondary" size="md" onClick={onClose} disabled={isProcessing} className="px-5">
              Cancelar
            </Button>
            <Button size="md" onClick={handleConfirmAssinatura} disabled={isProcessing || !canConfirm} className="px-5">
              Confirmar Assinatura
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
