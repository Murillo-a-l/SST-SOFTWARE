// @ts-nocheck
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { funcionarioApi, ApiError } from '../../services/apiService';
import { Funcionario, Empresa } from '../../types';
import { SearchableSelect } from '../common/SearchableSelect';
import { modalOverlay, modalPanel, modalHeader, modalBody, modalFooter } from '../common/modalStyles';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  empresas: Empresa[];
  initialName?: string | null;
  onOpenEmpresaManager: (initialName?: string) => void;
}

const initialFormState: Omit<Funcionario, 'id' | 'created_at' | 'ativo' | 'empresaId'> & { empresaId: string } = {
  empresaId: '',
  nome: '',
  matricula: '',
  cpf: '',
  whatsapp: '',
  cargo: '',
  setor: '',
  data_admissao: '',
  data_ultimo_exame: null,
  tipo_ultimo_exame: null,
};

const formatCPF = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const CadastroManualModal: React.FC<ModalProps> = ({ isOpen, onClose, onSaveSuccess, empresas, initialName, onOpenEmpresaManager }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialFormState,
        nome: initialName || '',
      });
    }
  }, [isOpen, initialName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'cpf') value = formatCPF(value);
    if (name === 'whatsapp') value = formatPhone(value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.empresaId || !formData.nome || !formData.cargo) {
      toast.error('Empresa, Nome e Cargo são obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        empresaId: Number(formData.empresaId),
        nome: formData.nome,
        matricula: formData.matricula || undefined,
        cpf: formData.cpf || undefined,
        whatsapp: formData.whatsapp || undefined,
        cargo: formData.cargo,
        setor: formData.setor || undefined,
        dataAdmissao: formData.data_admissao || undefined,
        dataUltimoExame: formData.data_ultimo_exame || undefined,
        tipoUltimoExame: formData.tipo_ultimo_exame || undefined,
      };

      await funcionarioApi.create(dataToSave);
      toast.success(`Funcionário "${formData.nome}" cadastrado com sucesso!`);
      onSaveSuccess();
      onClose();
      setFormData(initialFormState);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(`Erro ao cadastrar funcionário: ${err.message}`);
      } else {
        toast.error('Erro ao cadastrar funcionário. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={modalOverlay}>
      <div className={`${modalPanel} max-w-3xl max-h-[90vh] flex flex-col`}>
        <div className={`${modalHeader} border-b border-[#E0E3E7]`}>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7B8EA3]">Funcionários</p>
            <h2 className="text-xl font-semibold text-slate-900">Cadastrar Funcionário</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>

        <div className={`${modalBody} space-y-4 overflow-y-auto`}>
          <div className="space-y-2">
            <label htmlFor="empresaId" className="block text-sm font-medium text-slate-700">Empresa*</label>
            <SearchableSelect
              options={(empresas || []).map(e => ({ id: e.id, label: e.nomeFantasia }))}
              value={formData.empresaId ? Number(formData.empresaId) : null}
              onChange={(id) => setFormData(prev => ({ ...prev, empresaId: id ? String(id) : '' }))}
              placeholder="Buscar ou selecionar empresa..."
              onAddNew={(searchTerm) => onOpenEmpresaManager(searchTerm)}
              addNewLabel={(searchTerm) => `+ Adicionar nova empresa: "${searchTerm}"`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Nome*" name="nome" value={formData.nome} onChange={handleChange} />
            <InputField label="Matrícula" name="matricula" value={formData.matricula || ''} onChange={handleChange} />
            <InputField label="CPF" name="cpf" value={formData.cpf || ''} onChange={handleChange} maxLength={14} />
            <InputField label="WhatsApp/Telefone" name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} maxLength={15} />
            <InputField label="Cargo*" name="cargo" value={formData.cargo} onChange={handleChange} />
            <InputField label="Setor" name="setor" value={formData.setor || ''} onChange={handleChange} />
            <InputField label="Data de Admissão" name="data_admissao" type="date" value={formData.data_admissao || ''} onChange={handleChange} />
          </div>
        </div>

        <div className={`${modalFooter} border-t border-[#E0E3E7]`}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSaving} className="px-5">Cancelar</Button>
          <Button size="md" onClick={handleSave} disabled={isSaving || !formData.empresaId || !formData.nome || !formData.cargo} className="px-5">
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', maxLength }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
    <Input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className="mt-1"
    />
  </div>
);
