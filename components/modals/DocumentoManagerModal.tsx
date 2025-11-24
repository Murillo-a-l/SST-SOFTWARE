// @ts-nocheck
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { DocumentoEmpresa, DocumentoTipo, User, Empresa, Pasta } from '../../types';
import { documentoApi, documentoTipoApi, ApiError } from '../../services/apiService';
import { calculateDataFim } from '../../services/dbService';
import { modalOverlay, modalPanel, modalHeader, modalBody, modalFooter } from '../common/modalStyles';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Select } from '../common/Select';
import { SearchableSelect } from '../common/SearchableSelect';

interface DocumentoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  context: { empresa: Empresa; pastaId: number | null } | null;
  documentoToEdit: DocumentoEmpresa | null;
  users: User[];
  currentUser: User | null;
}

const initialState = {
  nome: '',
  tipoId: '',
  arquivoBase64: '',
  tipoArquivo: '',
  temValidade: false,
  dataInicio: '',
  dataFim: '',
  validadeMeses: '',
  observacoes: '',
  dadosSensiveis: false,
  requerAssinatura: false,
  requerAssinaturaDeId: null as number | null,
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const DocumentoManagerModal: React.FC<DocumentoManagerModalProps> = ({ isOpen, onClose, onSaveSuccess, context, documentoToEdit, users, currentUser }) => {
  const [formData, setFormData] = useState(initialState);
  const [tipos, setTipos] = useState<DocumentoTipo[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewTipoForm, setShowNewTipoForm] = useState(false);
  const [newTipoNome, setNewTipoNome] = useState('');
  const [isSavingTipo, setIsSavingTipo] = useState(false);

  const isEditing = !!documentoToEdit;

  useEffect(() => {
    if (isOpen) {
      documentoTipoApi.getAll().then(setTipos).catch(() => {});
      if (documentoToEdit) {
        setFormData({
          nome: documentoToEdit.nome,
          tipoId: documentoToEdit.tipoId?.toString() || '',
          arquivoBase64: documentoToEdit.arquivoUrl || '',
          tipoArquivo: documentoToEdit.tipoArquivo || '',
          temValidade: documentoToEdit.temValidade || false,
          dataInicio: documentoToEdit.dataInicio || '',
          dataFim: documentoToEdit.dataFim || '',
          validadeMeses: '',
          observacoes: documentoToEdit.observacoes || '',
          dadosSensiveis: documentoToEdit.dadosSensiveis || false,
          requerAssinatura: !!documentoToEdit.requerAssinaturaDeId,
          requerAssinaturaDeId: documentoToEdit.requerAssinaturaDeId || null,
        });
        setFileName(documentoToEdit.nome);
      } else {
        setFormData(initialState);
        setFileName('');
      }
      setShowNewTipoForm(false);
      setNewTipoNome('');
    }
  }, [isOpen, documentoToEdit]);

  if (!isOpen || !context) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);
    try {
      const base64 = await blobToBase64(file);
      setFormData(prev => ({
        ...prev,
        nome: prev.nome || file.name,
        arquivoBase64: base64,
        tipoArquivo: file.type || 'application/octet-stream'
      }));
    } catch (error) {
      console.error("Error converting file to Base64:", error);
      toast.error('Erro ao processar o arquivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'tipoId') {
      const selectedTipo = tipos.find(t => t.id === Number(value));
      setFormData(prev => ({
        ...prev,
        tipoId: value,
        validadeMeses: !isEditing && selectedTipo?.validadeMesesPadrao ? String(selectedTipo.validadeMesesPadrao) : prev.validadeMeses
      }));
    } else if (name === 'requerAssinatura') {
      setFormData(prev => ({
        ...prev,
        requerAssinatura: checked,
        requerAssinaturaDeId: checked ? prev.requerAssinaturaDeId : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.tipoId || !formData.arquivoBase64) {
      toast.error('Nome, Tipo e Arquivo são obrigatórios.');
      return;
    }

    if (formData.requerAssinatura && !formData.requerAssinaturaDeId) {
      toast.error('Selecione quem deve assinar o documento.');
      return;
    }

    if (formData.temValidade) {
      if (!formData.dataInicio) {
        toast.error('Data de Início é obrigatória quando o documento tem validade.');
        return;
      }
      if (!formData.validadeMeses && !formData.dataFim) {
        toast.error('Preencha a Validade (meses) ou a Data Final.');
        return;
      }
    }

    setIsSaving(true);
    try {
      let dataFimFinal = formData.dataFim;
      if (formData.temValidade && formData.dataInicio && formData.validadeMeses) {
        dataFimFinal = calculateDataFim(formData.dataInicio, Number(formData.validadeMeses));
      }

      const payload: any = {
        empresaId: context.empresa.id,
        pastaId: context.pastaId,
        nome: formData.nome,
        tipoId: Number(formData.tipoId),
        arquivoUrl: formData.arquivoBase64,
        tipoArquivo: formData.tipoArquivo || 'application/octet-stream',
        temValidade: formData.temValidade,
        dataInicio: formData.dataInicio || null,
        dataFim: dataFimFinal || null,
        observacoes: formData.observacoes || '',
        dadosSensiveis: formData.dadosSensiveis || false,
        statusAssinatura: formData.requerAssinatura ? 'PENDENTE' : 'NAO_REQUER',
        requerAssinaturaDeId: formData.requerAssinatura ? Number(formData.requerAssinaturaDeId) : null,
        solicitadoPorId: currentUser?.id || null,
        dataSolicitacaoAssinatura: formData.requerAssinatura ? new Date().toISOString() : null,
      };

      if (documentoToEdit) {
        await documentoApi.update(documentoToEdit.id, payload);
        toast.success('Documento atualizado com sucesso!');
      } else {
        await documentoApi.create(payload);
        toast.success('Documento criado com sucesso!');
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Erro ao salvar documento.');
      } else {
        toast.error('Erro ao salvar documento. Verifique a conexão e tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const calculatedDataFim = formData.temValidade && formData.dataInicio && formData.validadeMeses
    ? calculateDataFim(formData.dataInicio, Number(formData.validadeMeses))
    : null;

  const handleCreateTipo = async () => {
    if (!newTipoNome.trim()) {
      toast.error('Informe um nome para o novo tipo.');
      return;
    }
    setIsSavingTipo(true);
    try {
      const payload: any = {
        nome: newTipoNome.trim().toUpperCase(),
      };
      const created = await documentoTipoApi.create(payload);
      setTipos((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, tipoId: String(created.id) }));
      toast.success('Tipo de documento criado.');
      setShowNewTipoForm(false);
      setNewTipoNome('');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar tipo.';
      toast.error(message);
    } finally {
      setIsSavingTipo(false);
    }
  };

  return (
    <div className={modalOverlay}>
      <div className={`${modalPanel} max-w-4xl max-h-[90vh] flex flex-col`}>
        <div className={modalHeader}>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Documentos</p>
            <h2 className="text-lg font-semibold text-slate-800">{documentoToEdit ? 'Editar Documento' : 'Novo Documento'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>
        <div className={`${modalBody} space-y-4 overflow-y-auto`}>
          {/* Tipo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Tipo*</label>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowNewTipoForm((v) => !v)}
                className="px-3"
              >
                {showNewTipoForm ? 'Fechar' : 'Adicionar novo'}
              </Button>
            </div>
            <SearchableSelect
              options={tipos.map(t => ({ id: t.id, label: t.nome.toUpperCase() }))}
              value={formData.tipoId ? Number(formData.tipoId) : null}
              onChange={(id) => setFormData(prev => ({ ...prev, tipoId: id ? String(id) : '' }))}
              placeholder="Buscar ou selecionar tipo de documento..."
            />
            {showNewTipoForm && (
              <div className="border border-[#E0E3E7] bg-[#F9FAFB] rounded-lg p-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nome do documento</label>
                  <Input
                    value={newTipoNome}
                    onChange={(e) => setNewTipoNome(e.target.value)}
                    placeholder="Ex: Laudo, ASO..."
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowNewTipoForm(false);
                      setNewTipoNome('');
                    }}
                    className="px-3"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateTipo}
                    disabled={isSavingTipo}
                    className="px-4"
                  >
                    {isSavingTipo ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Arquivo*</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#D5D8DC] border-dashed rounded-lg bg-[#F9FAFB]">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-[#7B8EA3]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-slate-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#3A6EA5] hover:text-[#2C5680] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#3A6EA5]">
                    <span>{isEditing ? 'Trocar arquivo' : 'Selecione um arquivo'}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                </div>
                {fileName && <p className="text-xs text-slate-500">{fileName}</p>}
                {isProcessing && <p className="text-xs text-[#3A6EA5]">Processando...</p>}
              </div>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Nome*</label>
            <Input name="nome" value={formData.nome} onChange={handleChange} className="mt-1" placeholder="Ex: Contrato Social.pdf" />
          </div>

          {/* Validade Section */}
          <div className="border border-[#E0E3E7] p-4 rounded-lg bg-[#F9FAFB] space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" name="temValidade" checked={formData.temValidade} onChange={handleChange} className="h-4 w-4 text-[#3A6EA5] rounded" />
                Documento possui validade
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" name="dadosSensiveis" checked={formData.dadosSensiveis} onChange={handleChange} className="h-4 w-4 text-red-600 rounded" />
                Contém dados sensíveis (LGPD)
              </label>
            </div>

            {formData.temValidade && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Data de Início*</label>
                    <Input type="date" name="dataInicio" value={formData.dataInicio || ''} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Validade (meses)</label>
                    <Input type="number" name="validadeMeses" value={formData.validadeMeses || ''} onChange={handleChange} placeholder="Ex: 12, 24, 36..." />
                  </div>
                </div>
                {calculatedDataFim && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>📅 Data Final Calculada:</strong> {new Date(calculatedDataFim + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                <div className="text-center text-sm text-slate-500">ou informe a data final diretamente</div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Data Final (manual)</label>
                  <Input type="date" name="dataFim" value={formData.dataFim || ''} onChange={handleChange} />
                </div>
              </div>
            )}
          </div>

          {/* Signature Request Section */}
          <div className="border border-[#E0E3E7] p-4 rounded-lg bg-[#F9FAFB] space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" name="requerAssinatura" checked={formData.requerAssinatura} onChange={handleChange} className="h-4 w-4 text-[#3A6EA5] rounded" />
              Requer assinatura?
            </label>

            {formData.requerAssinatura && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Designar para:*</label>
                <SearchableSelect
                  options={users.map(u => ({ id: u.id, label: u.nome }))}
                  value={formData.requerAssinaturaDeId}
                  onChange={(id) => setFormData(prev => ({ ...prev, requerAssinaturaDeId: id as number | null }))}
                  placeholder="Buscar usuário para assinar..."
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          </label>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#D5D8DC] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/40 focus:border-[#3A6EA5]"
              rows={3}
            />
          </div>
        </div>
        <div className={modalFooter}>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={isProcessing || isSaving || !formData.arquivoBase64}>
            {isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Salvar Documento')}
          </Button>
        </div>
      </div>
    </div>
  );
};

