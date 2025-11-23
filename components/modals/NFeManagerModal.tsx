// @ts-nocheck
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { NFe, Empresa, ServicoPrestado } from '../../types';
import { nfeApi, ApiError } from '../../services/apiService';
import { modalOverlay, modalPanel, modalHeader, modalBody, modalFooter } from '../common/modalStyles';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Select } from '../common/Select';

interface NFeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  nfe?: NFe | null;
  data: { empresas: Empresa[]; servicosPrestados: ServicoPrestado[] };
}

const initialState: Partial<NFe> = {
  empresaId: undefined,
  numero: '',
  dataEmissao: '',
  valor: undefined,
  descricaoServicos: '',
  status: 'EM_ELABORACAO',
};

export const NFeManagerModal: React.FC<NFeManagerModalProps> = ({ isOpen, onClose, onSaveSuccess, nfe, data }) => {
  const [formData, setFormData] = useState<Partial<NFe>>(initialState);
  const [selectedServicos, setSelectedServicos] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(nfe ? { ...nfe } : initialState);
      setSelectedServicos([]);
    }
  }, [isOpen, nfe]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServicoToggle = (id: number) => {
    setSelectedServicos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!formData.empresaId || !formData.valor || !formData.dataEmissao || !formData.descricaoServicos) {
      toast.error('Empresa, valor, data de emissão e descrição são obrigatórios.');
      return;
    }
    setIsSaving(true);
    const payload: any = {
      empresaId: Number(formData.empresaId),
      numero: formData.numero || undefined,
      dataEmissao: formData.dataEmissao,
      valor: formData.valor,
      descricaoServicos: formData.descricaoServicos,
      status: formData.status || 'EM_ELABORACAO',
      servicosPrestadosIds: selectedServicos,
    };
    try {
      if (nfe) {
        await nfeApi.update(nfe.id, payload);
        toast.success('NFe atualizada com sucesso!');
      } else {
        await nfeApi.create(payload);
        toast.success('NFe criada com sucesso!');
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Erro ao salvar NFe.');
      } else {
        toast.error('Erro ao salvar NFe. Verifique a conexão e tente novamente.');
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
            <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Notas Fiscais</p>
            <h2 className="text-lg font-semibold text-slate-800">{nfe ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}</h2>
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
            </div>
            <InputField label="Número" name="numero" value={formData.numero || ''} onChange={handleChange} />
            <InputField label="Data Emissão*" name="dataEmissao" type="date" value={(formData as any).dataEmissao || ''} onChange={handleChange} />
            <InputField label="Valor*" name="valor" type="number" value={formData.valor?.toString() || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Descrição dos serviços*</label>
            <textarea
              name="descricaoServicos"
              value={formData.descricaoServicos || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#D5D8DC] bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A6EA5]/40 focus:border-[#3A6EA5]"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Serviços Prestados (opcional)</label>
            <div className="max-h-40 overflow-y-auto border border-[#E0E3E7] rounded-lg p-2 space-y-1">
              {data.servicosPrestados.map(s => (
                <label key={s.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedServicos.includes(s.id)}
                    onChange={() => handleServicoToggle(s.id)}
                  />
                  <span>{s.nome}</span>
                </label>
              ))}
              {data.servicosPrestados.length === 0 && <p className="text-xs text-slate-500">Nenhum serviço prestado cadastrado.</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <Select name="status" value={formData.status || 'EM_ELABORACAO'} onChange={handleChange}>
              <option value="EM_ELABORACAO">Em elaboração</option>
              <option value="EMITIDA">Emitida</option>
              <option value="CANCELADA">Cancelada</option>
            </Select>
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
