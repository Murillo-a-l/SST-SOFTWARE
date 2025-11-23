// @ts-nocheck
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Cobranca, Empresa } from '../../types';
import { cobrancaApi, ApiError } from '../../services/apiService';
import { modalOverlay, modalPanel, modalHeader, modalBody, modalFooter } from '../common/modalStyles';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Select } from '../common/Select';

interface CobrancaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  cobranca?: Cobranca | null;
  empresas: Empresa[];
}

const initialState: Partial<Cobranca> = {
  empresaId: undefined,
  valorTotal: undefined,
  dataEmissao: '',
  dataVencimento: '',
  status: 'PENDENTE',
  observacoes: '',
};

export const CobrancaManagerModal: React.FC<CobrancaManagerModalProps> = ({ isOpen, onClose, onSaveSuccess, cobranca, empresas }) => {
  const [formData, setFormData] = useState<Partial<Cobranca>>(initialState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(cobranca ? { ...cobranca } : initialState);
    }
  }, [isOpen, cobranca]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.empresaId || !formData.valorTotal || !formData.dataEmissao || !formData.dataVencimento) {
      toast.error('Empresa, valor, data de emissão e vencimento são obrigatórios.');
      return;
    }
    setIsSaving(true);
    const payload: any = {
      empresaId: Number(formData.empresaId),
      valorTotal: Number(formData.valorTotal),
      dataEmissao: formData.dataEmissao,
      dataVencimento: formData.dataVencimento,
      status: formData.status || 'PENDENTE',
      observacoes: formData.observacoes || '',
    };
    try {
      if (cobranca) {
        await cobrancaApi.update(cobranca.id, payload);
        toast.success('Cobrança atualizada com sucesso!');
      } else {
        await cobrancaApi.create(payload);
        toast.success('Cobrança criada com sucesso!');
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Erro ao salvar cobrança.');
      } else {
        toast.error('Erro ao salvar cobrança. Verifique a conexão e tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={modalOverlay}>
      <div className={`${modalPanel} max-w-2xl`}>
        <div className={modalHeader}>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Cobranças</p>
            <h2 className="text-lg font-semibold text-slate-800">{cobranca ? 'Editar Cobrança' : 'Nova Cobrança'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>
        <div className={`${modalBody} space-y-3`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Empresa*</label>
              <Select name="empresaId" value={formData.empresaId?.toString() || ''} onChange={handleChange}>
                <option value="">Selecione</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.nomeFantasia}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Valor Total*</label>
              <Input name="valorTotal" type="number" value={formData.valorTotal?.toString() || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Data Emissão*</label>
              <Input type="date" name="dataEmissao" value={(formData as any).dataEmissao || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Data Vencimento*</label>
              <Input type="date" name="dataVencimento" value={(formData as any).dataVencimento || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <Select name="status" value={formData.status || 'PENDENTE'} onChange={handleChange}>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGA">Paga</option>
                <option value="VENCIDA">Vencida</option>
                <option value="CANCELADA">Cancelada</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Observações</label>
              <textarea
                name="observacoes"
                value={formData.observacoes || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D5D8DC] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/40 focus:border-[#3A6EA5]"
                rows={3}
              />
            </div>
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
