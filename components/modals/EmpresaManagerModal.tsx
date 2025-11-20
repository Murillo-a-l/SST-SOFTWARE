import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { empresaApi, ApiError } from '../../services/apiService';
import { Empresa } from '../../types';
import { consultarCNPJ, getSituacaoMessage, CNPJValidationResult } from '../../services/cnpjValidationService';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    empresa: Empresa | null;
    empresas: Empresa[];
    initialName?: string | null;
}

const initialFormState: Omit<Empresa, 'id'> = {
    matrizId: null,
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    endereco: '',
    contatoNome: '',
    contatoEmail: '',
    contatoTelefone: '',
    medicoNome: '',
    medicoCrm: '',
    inicioValidade: '',
    revisarAte: '',
    diaPadraoVencimento: undefined,
};

const formatCNPJ = (value: string) => {
    return value
        .replace(/\D/g, '')
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
};

const formatPhone = (value: string) => {
    if (!value) return '';
    const digitsOnly = value.replace(/\D/g, '').slice(0, 11);

    if (digitsOnly.length <= 2) {
        return `(${digitsOnly}`;
    }
    if (digitsOnly.length <= 6) {
        return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2)}`;
    }
    if (digitsOnly.length <= 10) {
        return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6, 10)}`;
    }
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7, 11)}`;
};

export const EmpresaManagerModal: React.FC<ModalProps> = ({ isOpen, onClose, onSaveSuccess, empresa, empresas, initialName }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [cnpjValidation, setCnpjValidation] = useState<CNPJValidationResult | null>(null);

    const possibleMatrices = (empresas || []).filter(e => !e.matrizId && e.id !== empresa?.id);

    useEffect(() => {
        if (isOpen) {
            if (empresa) {
                setFormData(empresa);
            } else {
                setFormData({
                    ...initialFormState,
                    nomeFantasia: initialName || '',
                });
            }
        }
    }, [empresa, isOpen, initialName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let { name, value } = e.target;
        if (name === 'cnpj') {
            value = formatCNPJ(value);
        } else if (name === 'contatoTelefone') {
            value = formatPhone(value);
        }
        
        const finalValue = name === 'matrizId' ? (value ? Number(value) : null) : value;

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleCnpjBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cnpj = e.target.value.replace(/\D/g, '');
        if (cnpj.length !== 14) {
            setCnpjValidation(null);
            return;
        }

        setIsFetchingCnpj(true);
        try {
            const validation = await consultarCNPJ(cnpj);
            setCnpjValidation(validation);

            if (validation.error) {
                toast.error(`Erro ao validar CNPJ: ${validation.error}`);
                return;
            }

            // Mostrar alerta se empresa não está ativa
            if (validation.situacao !== 'ATIVA') {
                const situacaoInfo = getSituacaoMessage(validation.situacao);
                toast.error(`${situacaoInfo.icon} ${situacaoInfo.message}`, {
                    duration: 6000,
                });
            } else {
                toast.success('✅ Empresa ATIVA na Receita Federal');
            }

            // Preencher dados se válido
            if (validation.valid || validation.razaoSocial) {
                setFormData(prev => ({
                    ...prev,
                    razaoSocial: validation.razaoSocial || prev.razaoSocial,
                    nomeFantasia: validation.nomeFantasia || prev.nomeFantasia,
                    endereco: validation.endereco ? [
                        validation.endereco.logradouro,
                        validation.endereco.numero,
                        validation.endereco.complemento,
                        validation.endereco.bairro,
                        `${validation.endereco.municipio} - ${validation.endereco.uf}`,
                        `CEP: ${validation.endereco.cep}`
                    ].filter(Boolean).join(', ') : prev.endereco,
                    contatoTelefone: formatPhone(validation.telefone || '') || prev.contatoTelefone,
                    contatoEmail: validation.email || prev.contatoEmail,
                }));
            }
        } catch (error: any) {
            toast.error(`Erro ao validar CNPJ: ${error.message}`);
            setCnpjValidation(null);
        } finally {
            setIsFetchingCnpj(false);
        }
    };

    const handleSave = async () => {
        if (!formData.razaoSocial || !formData.nomeFantasia || !formData.cnpj) {
            toast.error("Razão Social, Nome Fantasia e CNPJ são obrigatórios.");
            return;
        }

        // Campos de médico são opcionais agora

        setIsSaving(true);

        try {
            // Mapear campos do formulário para o formato da API
            // Só incluir campos que têm valor (não enviar undefined)
            const dataToSave: any = {
                razaoSocial: formData.razaoSocial,
                nomeFantasia: formData.nomeFantasia,
                cnpj: formData.cnpj,
            };

            // Adicionar matrizId se for filial
            if (formData.matrizId) {
                dataToSave.matrizId = formData.matrizId;
            }

            // Adicionar campos opcionais apenas se tiverem valor
            if (formData.endereco) dataToSave.endereco = formData.endereco;
            if (formData.contatoNome) dataToSave.contatoNome = formData.contatoNome;
            if (formData.contatoEmail) dataToSave.contatoEmail = formData.contatoEmail;
            if (formData.contatoTelefone) dataToSave.contatoTelefone = formData.contatoTelefone;
            if (formData.medicoNome) dataToSave.medicoNome = formData.medicoNome;
            if (formData.medicoCrm) dataToSave.medicoCrm = formData.medicoCrm;
            if (formData.inicioValidade) dataToSave.inicioValidade = formData.inicioValidade;
            if (formData.revisarAte) dataToSave.revisarAte = formData.revisarAte;
            if (formData.diaPadraoVencimento) dataToSave.diaPadraoVencimento = Number(formData.diaPadraoVencimento);

            if (empresa) {
                await empresaApi.update(empresa.id, dataToSave);
                toast.success(`Empresa "${formData.nomeFantasia}" atualizada com sucesso!`);
            } else {
                await empresaApi.create(dataToSave);
                toast.success(`Empresa "${formData.nomeFantasia}" cadastrada com sucesso!`);
            }

            onSaveSuccess();
            onClose();
        } catch (err) {
            if (err instanceof ApiError) {
                toast.error(`Erro ao salvar empresa: ${err.message}`);
            } else {
                toast.error('Erro ao salvar empresa. Verifique sua conexão e tente novamente.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{empresa ? '🏢 Editar Empresa' : '🏢 Nova Empresa'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <fieldset className="border p-4 rounded-md">
                        <legend className="font-semibold px-2">Dados da Empresa</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ*</label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        id="cnpj"
                                        name="cnpj"
                                        value={formData.cnpj}
                                        onChange={handleChange}
                                        onBlur={handleCnpjBlur}
                                        maxLength={18}
                                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Digite e saia do campo"
                                    />
                                    {isFetchingCnpj && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 animate-pulse">Buscando...</span>}
                                </div>
                                {cnpjValidation && !isFetchingCnpj && (
                                    <div className={`mt-2 p-2 rounded-md border ${
                                        cnpjValidation.situacao === 'ATIVA' ? 'bg-green-50 border-green-200' :
                                        cnpjValidation.situacao === 'SUSPENSA' || cnpjValidation.situacao === 'INAPTA' ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-red-50 border-red-200'
                                    }`}>
                                        <p className={`text-xs font-medium ${
                                            cnpjValidation.situacao === 'ATIVA' ? 'text-green-800' :
                                            cnpjValidation.situacao === 'SUSPENSA' || cnpjValidation.situacao === 'INAPTA' ? 'text-yellow-800' :
                                            'text-red-800'
                                        }`}>
                                            {getSituacaoMessage(cnpjValidation.situacao).icon} {getSituacaoMessage(cnpjValidation.situacao).message}
                                        </p>
                                        {cnpjValidation.dataSituacao && (
                                            <p className="text-xs text-gray-600 mt-1">Data da situação: {new Date(cnpjValidation.dataSituacao).toLocaleDateString('pt-BR')}</p>
                                        )}
                                        {cnpjValidation.motivoSituacao && cnpjValidation.situacao !== 'ATIVA' && (
                                            <p className="text-xs text-gray-600 mt-1">Motivo: {cnpjValidation.motivoSituacao}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <InputField label="Razão Social*" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} />
                            <InputField label="Nome Fantasia*" name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} />
                             <div>
                                <label htmlFor="matrizId" className="block text-sm font-medium text-gray-700">Empresa Matriz (Opcional)</label>
                                <select
                                    id="matrizId"
                                    name="matrizId"
                                    value={formData.matrizId ?? ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Nenhuma (Esta é uma Matriz)</option>
                                    {possibleMatrices.map(e => <option key={e.id} value={e.id}>{e.nomeFantasia}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <InputField label="Endereço" name="endereco" value={formData.endereco || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="border p-4 rounded-md">
                        <legend className="font-semibold px-2">Financeiro e Contato</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="Nome do Contato" name="contatoNome" value={formData.contatoNome || ''} onChange={handleChange} />
                            <InputField label="Email" name="contatoEmail" type="email" value={formData.contatoEmail || ''} onChange={handleChange} />
                            <InputField label="Telefone" name="contatoTelefone" value={formData.contatoTelefone || ''} onChange={handleChange} maxLength={15} />
                            <div className="md:col-span-3">
                               <InputField label="Dia Padrão de Vencimento" name="diaPadraoVencimento" type="number" value={String(formData.diaPadraoVencimento || '')} onChange={handleChange} placeholder="Ex: 10"/>
                            </div>
                        </div>
                    </fieldset>
                    
                    <fieldset className="border p-4 rounded-md">
                        <legend className="font-semibold px-2">Configuração PCMSO (Opcional)</legend>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Médico Responsável" name="medicoNome" value={formData.medicoNome || ''} onChange={handleChange} />
                            <InputField label="CRM do Médico" name="medicoCrm" value={formData.medicoCrm || ''} onChange={handleChange} />
                            <InputField label="Início da Validade" name="inicioValidade" type="date" value={formData.inicioValidade || ''} onChange={handleChange} />
                            <InputField label="Revisar Até" name="revisarAte" type="date" value={formData.revisarAte || ''} onChange={handleChange} />
                        </div>
                    </fieldset>

                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} disabled={isSaving} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    type?: string;
    maxLength?: number;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = "text", maxLength, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            placeholder={placeholder}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);