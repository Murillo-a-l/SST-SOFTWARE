import React, { useState, useEffect } from 'react';
import { documentoApi, ApiError } from '../../services/apiService';
import { documentoTipoService, calculateStatus, calculateDataFim } from '../../services/dbService';
import { Empresa, DocumentoEmpresa, DocumentoTipo, User } from '../../types';
import { SearchableSelect } from '../common/SearchableSelect';
import toast from 'react-hot-toast';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    context: { empresa: Empresa; pastaId: number | null } | null;
    documentoToEdit: DocumentoEmpresa | null;
    users: User[];
    currentUser: User;
}

const initialFormState = {
    nome: '',
    tipo: 'Outro',
    arquivoBase64: '',
    observacoes: '',
    temValidade: false,
    dataInicio: null as string | null,
    dataFim: null as string | null,
    validadeMeses: null as number | null,
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

export const DocumentoManagerModal: React.FC<ModalProps> = (props) => {
    const { isOpen, onClose, onSaveSuccess, context, documentoToEdit, users, currentUser } = props;
    const [formData, setFormData] = useState(initialFormState);
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tipos, setTipos] = useState<DocumentoTipo[]>([]);

    const isEditing = !!documentoToEdit;

    useEffect(() => {
        if(isOpen) {
            setTipos(documentoTipoService.getAll());
            if (isEditing) {
                // Populate form for editing
                setFormData({
                    nome: documentoToEdit.nome,
                    tipo: documentoToEdit.tipo,
                    arquivoBase64: documentoToEdit.arquivoBase64,
                    observacoes: documentoToEdit.observacoes || '',
                    temValidade: documentoToEdit.temValidade,
                    dataInicio: documentoToEdit.dataInicio,
                    dataFim: documentoToEdit.dataFim,
                    validadeMeses: null, // This is not stored, user can re-enter to calculate
                    dadosSensiveis: documentoToEdit.dadosSensiveis,
                    requerAssinatura: !!documentoToEdit.requerAssinaturaDeId,
                    requerAssinaturaDeId: documentoToEdit.requerAssinaturaDeId,
                });
                setFileName(documentoToEdit.nome);
            }
        } else {
            // Reset form on close
            setFormData(initialFormState);
            setFileName('');
        }
    }, [isOpen, documentoToEdit, isEditing]);

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
                arquivoBase64: base64
            }));
        } catch (error) {
            console.error("Error converting file to Base64:", error);
            toast.error("Erro ao processar o arquivo.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'tipo') {
            const selectedTipo = tipos.find(t => t.nome === value);
            setFormData(prev => ({ 
                ...prev, 
                tipo: value, 
                validadeMeses: isEditing ? prev.validadeMeses : (selectedTipo?.validadeMesesPadrao ?? null)
            }));
        } else if (name === 'requerAssinatura') {
            setFormData(prev => ({
                ...prev,
                requerAssinatura: checked,
                requerAssinaturaDeId: checked ? prev.requerAssinaturaDeId : null
            }))
        }
        else {
            setFormData(prev => ({ 
                ...prev, 
                [name]: type === 'checkbox' ? checked : value 
            }));
        }
    };

    const handleSave = async () => {
        if (!context || !formData.arquivoBase64 || !formData.nome || !formData.tipo) {
            toast.error("Arquivo, Nome do Documento e Tipo são obrigatórios.");
            return;
        }
         if (formData.requerAssinatura && !formData.requerAssinaturaDeId) {
            toast.error("Por favor, designe um usuário para a assinatura.");
            return;
        }

        setIsSaving(true);

        try {
            let dataFimFinal = formData.dataFim;
            // Recalculate dataFim if start date and months are provided
            if(formData.temValidade && formData.dataInicio && formData.validadeMeses) {
                dataFimFinal = calculateDataFim(formData.dataInicio, Number(formData.validadeMeses));
            }

            const tipoDoc = tipos.find(t => t.nome === formData.tipo) || { alertaDias: 30 };
            const status = formData.temValidade ? calculateStatus(dataFimFinal, tipoDoc.alertaDias) : 'ATIVO';

            const documentData = {
                empresaId: context.empresa.id,
                pastaId: context.pastaId,
                tipo: formData.tipo,
                nome: formData.nome,
                arquivoBase64: formData.arquivoBase64,
                observacoes: formData.observacoes || undefined,
                temValidade: formData.temValidade,
                dataInicio: formData.dataInicio,
                dataFim: dataFimFinal,
                status: status,
                dadosSensiveis: formData.dadosSensiveis,
                statusAssinatura: formData.requerAssinatura ? 'PENDENTE' : 'NAO_REQUER',
                requerAssinaturaDeId: formData.requerAssinatura ? formData.requerAssinaturaDeId : null,
                solicitadoPorId: formData.requerAssinatura ? currentUser.id : null,
                dataSolicitacaoAssinatura: formData.requerAssinatura ? new Date().toISOString() : undefined,
            };

            if (isEditing) {
                await documentoApi.update(documentoToEdit.id, documentData);
                toast.success(`Documento "${formData.nome}" atualizado com sucesso!`);
            } else {
                await documentoApi.create(documentData);
                toast.success(`Documento "${formData.nome}" salvo para a empresa ${context.empresa.nomeFantasia}!`);
            }

            onSaveSuccess();
            onClose();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao salvar documento. Tente novamente.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !context) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{isEditing ? '✏️ Editar Documento' : '📄 Adicionar Documento'} para {context.empresa.nomeFantasia}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo*</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                        <span>{isEditing ? 'Trocar arquivo' : 'Selecione um arquivo'}</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                </div>
                                {fileName && <p className="text-xs text-gray-500">{fileName}</p>}
                                {isProcessing && <p className="text-xs text-blue-500">Processando...</p>}
                            </div>
                        </div>
                    </div>

                    <InputField label="Nome do Documento*" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Contrato Social.pdf" />
                    <SelectField label="Tipo*" name="tipo" value={formData.tipo} onChange={handleChange} options={tipos.map(t => t.nome)} />
                    
                    <div className="border p-4 rounded-md space-y-4 bg-gray-50">
                        <label className="flex items-center space-x-3">
                            <input type="checkbox" name="temValidade" checked={formData.temValidade} onChange={handleChange} className="h-5 w-5 text-indigo-600 rounded" />
                            <span className="font-medium text-gray-700">Este documento tem data de validade</span>
                        </label>

                        {formData.temValidade && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Data de Início" name="dataInicio" type="date" value={formData.dataInicio || ''} onChange={handleChange} />
                                    <InputField label="Validade (meses)" name="validadeMeses" type="number" value={String(formData.validadeMeses || '')} onChange={handleChange} placeholder="Calcula data fim"/>
                                </div>
                                <div className="text-center text-sm text-gray-500">ou</div>
                                <InputField label="Data Final (manual)" name="dataFim" type="date" value={formData.dataFim || ''} onChange={handleChange} />
                            </div>
                        )}
                    </div>

                     <div className="border p-4 rounded-md space-y-4 bg-gray-50">
                        <label className="flex items-center space-x-3">
                            <input type="checkbox" name="requerAssinatura" checked={formData.requerAssinatura} onChange={handleChange} className="h-5 w-5 text-indigo-600 rounded" />
                            <span className="font-medium text-gray-700">Requer assinatura?</span>
                        </label>

                        {formData.requerAssinatura && (
                           <div>
                                <label className="block text-sm font-medium text-gray-700">Designar para:*</label>
                                <SearchableSelect
                                    options={users.map(u => ({ id: u.id, label: u.nome }))}
                                    value={formData.requerAssinaturaDeId}
                                    onChange={(id) => setFormData(prev => ({...prev, requerAssinaturaDeId: id as number | null}))}
                                    placeholder="Buscar usuário para assinar..."
                                />
                           </div>
                        )}
                    </div>


                     <label className="flex items-center space-x-3">
                        <input type="checkbox" name="dadosSensiveis" checked={formData.dadosSensiveis} onChange={handleChange} className="h-5 w-5 text-red-600 rounded" />
                        <span className="font-medium text-gray-700">Contém dados sensíveis (LGPD)</span>
                    </label>

                     <TextAreaField label="Observações" name="observacoes" value={formData.observacoes || ''} onChange={handleChange} />
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} disabled={isSaving} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
                    <button onClick={handleSave} disabled={isProcessing || isSaving || !formData.arquivoBase64} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Salvar Documento')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components for fields ---
const InputField = ({ label, name, value, onChange, type = "text", placeholder }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
);
const SelectField = ({ label, name, value, onChange, options }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
const TextAreaField = ({ label, name, value, onChange }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
);
