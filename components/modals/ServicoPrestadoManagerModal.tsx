// @ts-nocheck
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ServicoPrestado, CatalogoServico, Empresa, Funcionario } from '../../types';
import { servicoPrestadoApi, ApiError } from '../../services/apiService';
import { modalOverlay, modalPanel, modalHeader, modalBody, modalFooter } from '../common/modalStyles';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Select } from '../common/Select';

interface ServicoPrestadoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  servico?: ServicoPrestado | null;
  data: {
    catalogoServicos: CatalogoServico[];
    empresas: Empresa[];
    funcionarios: Funcionario[];
  };
  onOpenCatalogoManager: (initialName?: string) => void;
  onOpenEmpresaManager: (initialName?: string) => void;
  onOpenCadastroManual: (initialName?: string) => void;
}

const initialState: Partial<ServicoPrestado> = {
  empresaId: undefined,
  servicoId: undefined,
  funcionarioId: undefined,
  dataRealizacao: '',
  valorCobrado: undefined,
  quantidade: 1,
  descricaoAdicional: '',
  status: 'PENDENTE',
};

export const ServicoPrestadoManagerModal: React.FC<ServicoPrestadoManagerModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  servico,
  data,
  onOpenCatalogoManager,
  onOpenEmpresaManager,
  onOpenCadastroManual,
}) => {
  const [formData, setFormData] = useState<Partial<ServicoPrestado>>(initialState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(servico ? { ...servico } : initialState);
    }
  }, [isOpen, servico]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.empresaId || !formData.servicoId || !formData.dataRealizacao || formData.valorCobrado === undefined) {
      toast.error('Empresa, serviço, data e valor são obrigatórios.');
      return;
    }
    setIsSaving(true);
    const payload: any = {
      empresaId: Number(formData.empresaId),
      servicoId: Number(formData.servicoId),
      funcionarioId: formData.funcionarioId ? Number(formData.funcionarioId) : undefined,
      dataRealizacao: formData.dataRealizacao,
      valorCobrado: Number(formData.valorCobrado),
      quantidade: formData.quantidade || 1,
      descricaoAdicional: formData.descricaoAdicional || '',
      status: formData.status || 'PENDENTE',
    };
    try {
      if (servico) {
        await servicoPrestadoApi.update(servico.id, payload);
        toast.success('Serviço prestado atualizado com sucesso!');
      } else {
        await servicoPrestadoApi.create(payload);
        toast.success('Serviço prestado criado com sucesso!');
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Erro ao salvar serviço prestado.');
      } else {
        toast.error('Erro ao salvar serviço prestado. Verifique a conexão e tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={modalOverlay}>
      <div className={`${modalPanel} max-w-3xl`}>
        <div className={modalHeader}>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Serviços Prestados</p>
            <h2 className="text-lg font-semibold text-slate-800">{servico ? 'Editar Serviço Prestado' : 'Novo Serviço Prestado'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>
        <div className={`${modalBody} space-y-3`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Empresa*</label>
              <Select name="empresaId" value={formData.empresaId?.toString() || ''} onChange={handleChange}>
                <option value="">Selecione</option>
                {data.empresas.map(e => <option key={e.id} value={e.id}>{e.nomeFantasia}</option>)}
              </Select>
              <Button variant="ghost" size="sm" className="mt-1" onClick={() => onOpenEmpresaManager()}>+ Nova empresa</Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Serviço*</label>
              <Select name="servicoId" value={formData.servicoId?.toString() || ''} onChange={handleChange}>
                <option value="">Selecione</option>
                {data.catalogoServicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </Select>
              <Button variant="ghost" size="sm" className="mt-1" onClick={() => onOpenCatalogoManager()}>+ Novo serviço</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Funcionário (opcional)</label>
              <Select name="funcionarioId" value={formData.funcionarioId?.toString() || ''} onChange={handleChange}>
                <option value="">Sem funcionário</option>
                {data.funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </Select>
              <Button variant="ghost" size="sm" className="mt-1" onClick={() => onOpenCadastroManual()}>+ Novo funcionário</Button>
            </div>
            <InputField label="Data de Realização*" name="dataRealizacao" type="date" value={(formData as any).dataRealizacao || ''} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InputField label="Valor Cobrado*" name="valorCobrado" type="number" value={formData.valorCobrado?.toString() || ''} onChange={handleChange} />
            <InputField label="Quantidade" name="quantidade" type="number" value={formData.quantidade?.toString() || '1'} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <Select name="status" value={formData.status || 'PENDENTE'} onChange={handleChange}>
                <option value="PENDENTE">Pendente</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="CANCELADO">Cancelado</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Descrição adicional</label>
            <textarea
              name="descricaoAdicional"
              value={formData.descricaoAdicional || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#D5D8DC] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/40 focus:border-[#3A6EA5]"
              rows={3}
            />
          </div>
        </div>
        <div className={modalFooter}>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</Button>
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
