// @ts-nocheck
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Empresa, User } from '../../types';
import { empresaApi, ApiError } from '../../services/apiService';
import { consultarCNPJ, getSituacaoMessage, CNPJValidationResult } from '../../services/cnpjValidationService';
import { modalOverlay, modalPanel, modalHeader, modalBody, modalFooter } from '../common/modalStyles';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';

interface EmpresaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  empresa?: Empresa | null;
  empresas: Empresa[];
  initialName?: string | null;
}

const emptyEmpresa: Partial<Empresa> = {
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

export const EmpresaManagerModal: React.FC<EmpresaManagerModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  empresa,
  empresas,
  initialName,
}) => {
  const [formData, setFormData] = useState<Partial<Empresa>>(emptyEmpresa);
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
          ...emptyEmpresa,
          nomeFantasia: initialName || '',
          razaoSocial: initialName || '',
        });
      }
      setCnpjValidation(null);
    }
  }, [isOpen, empresa, initialName]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === 'cnpj') {
      value = formatCNPJ(value);
    } else if (name === 'contatoTelefone') {
      value = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
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

      // Preencher dados automaticamente se válido
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
      toast.error('Razão Social, Nome Fantasia e CNPJ são obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      if (empresa) {
        await empresaApi.update(empresa.id, formData);
        toast.success('Empresa atualizada com sucesso!');
      } else {
        await empresaApi.create(formData as any);
        toast.success('Empresa criada com sucesso!');
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Erro ao salvar empresa.');
      } else {
        toast.error('Erro ao salvar empresa. Verifique a conexão e tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={modalOverlay}>
      <div className={`${modalPanel} max-w-3xl max-h-[90vh] flex flex-col`}>
        <div className={modalHeader}>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Empresas</p>
            <h2 className="text-lg font-semibold text-slate-800">{empresa ? 'Editar Empresa' : 'Nova Empresa'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>

        <div className={`${modalBody} space-y-4 overflow-y-auto`}>
          {/* CNPJ - Primeiro campo */}
          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-slate-700 mb-1">
              CNPJ* {isFetchingCnpj && <span className="text-blue-500 text-xs">(consultando...)</span>}
            </label>
            <Input
              id="cnpj"
              name="cnpj"
              type="text"
              value={formData.cnpj || ''}
              onChange={handleChange}
              onBlur={handleCnpjBlur}
              placeholder="00.000.000/0000-00"
              disabled={isFetchingCnpj}
              className="mt-1"
            />
            {cnpjValidation && cnpjValidation.situacao && (
              <p className={`text-xs mt-1 ${cnpjValidation.situacao === 'ATIVA' ? 'text-green-600' : 'text-red-600'}`}>
                Situação: {cnpjValidation.situacao}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Razão Social*" name="razaoSocial" value={formData.razaoSocial || ''} onChange={handleChange} />
            <InputField label="Nome Fantasia*" name="nomeFantasia" value={formData.nomeFantasia || ''} onChange={handleChange} />
            <div className="md:col-span-2">
              <InputField label="Endereço" name="endereco" value={formData.endereco || ''} onChange={handleChange} />
            </div>
            <InputField label="Contato Nome" name="contatoNome" value={formData.contatoNome || ''} onChange={handleChange} />
            <InputField label="Contato Email" name="contatoEmail" type="email" value={formData.contatoEmail || ''} onChange={handleChange} />
            <InputField label="Contato Telefone" name="contatoTelefone" value={formData.contatoTelefone || ''} onChange={handleChange} />
            <InputField label="Dia padrão de vencimento" name="diaPadraoVencimento" value={formData.diaPadraoVencimento?.toString() || ''} onChange={handleChange} type="number" />
          </div>

          <div className="border-t border-[#E0E3E7] pt-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">PCMSO (Opcional)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Médico Responsável" name="medicoNome" value={formData.medicoNome || ''} onChange={handleChange} />
              <InputField label="CRM" name="medicoCrm" value={formData.medicoCrm || ''} onChange={handleChange} />
              <InputField label="Início Validade" name="inicioValidade" type="date" value={formData.inicioValidade || ''} onChange={handleChange} />
              <InputField label="Revisar até" name="revisarAte" type="date" value={formData.revisarAte || ''} onChange={handleChange} />
            </div>
          </div>

          <div className="border-t border-[#E0E3E7] pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Matriz (opcional)</label>
            <select
              value={formData.matrizId ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, matrizId: e.target.value ? Number(e.target.value) : null }))}
              className="w-full rounded-lg border border-[#D5D8DC] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/40 focus:border-[#3A6EA5]"
            >
              <option value="">Sem matriz</option>
              {possibleMatrices.map(e => (
                <option key={e.id} value={e.id}>{e.nomeFantasia}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={modalFooter}>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || isFetchingCnpj}>
            {isSaving ? 'Salvando...' : isFetchingCnpj ? 'Consultando CNPJ...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; name: string; value: string; onChange: any; type?: string; }> = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="mt-1"
    />
  </div>
);
