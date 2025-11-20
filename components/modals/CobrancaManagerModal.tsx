import React, { useState, useEffect } from 'react';
import { Cobranca, DbData, ServicoPrestado } from '../../types';
import { api, ApiError } from '../../services/apiService';
import toast from 'react-hot-toast';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    cobranca: Cobranca | null;
    data: DbData;
}

export const CobrancaManagerModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onSaveSuccess,
    cobranca,
    data
}) => {
    const isEditing = !!cobranca;

    const [empresaSelecionada, setEmpresaSelecionada] = useState<number | null>(
        cobranca?.empresaId || null
    );
    const [servicosPrestados, setServicosPrestados] = useState<ServicoPrestado[]>([]);
    const [servicosSelecionados, setServicosSelecionados] = useState<number[]>(
        cobranca?.servicosPrestados?.map(sp => sp.id) || []
    );

    const [formData, setFormData] = useState({
        dataEmissao: cobranca?.dataEmissao
            ? new Date(cobranca.dataEmissao).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        dataVencimento: cobranca?.dataVencimento
            ? new Date(cobranca.dataVencimento).toISOString().split('T')[0]
            : '',
        dataPagamento: cobranca?.dataPagamento
            ? new Date(cobranca.dataPagamento).toISOString().split('T')[0]
            : '',
        valorDesconto: cobranca?.valorDesconto?.toString() || '0',
        valorJuros: cobranca?.valorJuros?.toString() || '0',
        valorMulta: cobranca?.valorMulta?.toString() || '0',
        observacoes: cobranca?.observacoes || '',
        status: cobranca?.status || 'PENDENTE'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingServicos, setIsLoadingServicos] = useState(false);

    // Carrega serviços prestados quando empresa é selecionada
    useEffect(() => {
        if (empresaSelecionada && !isEditing) {
            carregarServicosPrestados();
        } else if (!empresaSelecionada && !isEditing) {
            setServicosPrestados([]);
            setServicosSelecionados([]);
        }
    }, [empresaSelecionada]);

    // Carrega serviços prestados na edição
    useEffect(() => {
        if (isEditing && cobranca?.servicosPrestados) {
            setServicosPrestados(cobranca.servicosPrestados);
        }
    }, [isEditing, cobranca]);

    const carregarServicosPrestados = async () => {
        setIsLoadingServicos(true);
        try {
            const servicos = await api.servicosPrestados.getAll({
                empresaId: empresaSelecionada!,
                status: 'PENDENTE'
            });
            setServicosPrestados(servicos);
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao carregar serviços prestados');
            }
        } finally {
            setIsLoadingServicos(false);
        }
    };

    const handleToggleServico = (servicoId: number) => {
        setServicosSelecionados(prev => {
            if (prev.includes(servicoId)) {
                return prev.filter(id => id !== servicoId);
            } else {
                return [...prev, servicoId];
            }
        });
    };

    const handleSelecionarTodos = () => {
        if (servicosSelecionados.length === servicosPrestados.length) {
            setServicosSelecionados([]);
        } else {
            setServicosSelecionados(servicosPrestados.map(s => s.id));
        }
    };

    const calcularValorServicos = () => {
        return servicosPrestados
            .filter(s => servicosSelecionados.includes(s.id))
            .reduce((acc, s) => acc + Number(s.valorCobrado), 0);
    };

    const calcularValorTotal = () => {
        const valorServicos = calcularValorServicos();
        const desconto = Number(formData.valorDesconto) || 0;
        const juros = Number(formData.valorJuros) || 0;
        const multa = Number(formData.valorMulta) || 0;

        return valorServicos - desconto + juros + multa;
    };

    const handleSave = async () => {
        // Validações
        if (!empresaSelecionada) {
            toast.error('Selecione uma empresa');
            return;
        }

        if (!isEditing && servicosSelecionados.length === 0) {
            toast.error('Selecione pelo menos um serviço');
            return;
        }

        if (!formData.dataVencimento) {
            toast.error('Data de vencimento é obrigatória');
            return;
        }

        // Validar datas
        const dataEmissao = new Date(formData.dataEmissao);
        const dataVencimento = new Date(formData.dataVencimento);

        if (dataVencimento < dataEmissao) {
            toast.error('Data de vencimento não pode ser anterior à data de emissão');
            return;
        }

        if (formData.dataPagamento) {
            const dataPagamento = new Date(formData.dataPagamento);
            if (dataPagamento < dataEmissao) {
                toast.error('Data de pagamento não pode ser anterior à data de emissão');
                return;
            }
        }

        setIsSaving(true);
        try {
            const valorTotal = calcularValorTotal();

            const dataToSave = {
                empresaId: Number(empresaSelecionada),
                dataEmissao: formData.dataEmissao,
                dataVencimento: formData.dataVencimento,
                dataPagamento: formData.dataPagamento || undefined,
                valorTotal,
                valorDesconto: Number(formData.valorDesconto) || 0,
                valorJuros: Number(formData.valorJuros) || 0,
                valorMulta: Number(formData.valorMulta) || 0,
                observacoes: formData.observacoes || undefined,
                status: formData.status as 'PENDENTE' | 'PAGA' | 'VENCIDA' | 'CANCELADA',
                servicosPrestadosIds: servicosSelecionados
            };

            if (isEditing) {
                await api.cobrancas.update(cobranca.id, dataToSave);
                toast.success('Cobrança atualizada com sucesso!');
            } else {
                await api.cobrancas.create(dataToSave);
                toast.success('Cobrança criada com sucesso!');
            }

            onSaveSuccess();
            handleClose();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao salvar cobrança');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setEmpresaSelecionada(null);
        setServicosPrestados([]);
        setServicosSelecionados([]);
        setFormData({
            dataEmissao: new Date().toISOString().split('T')[0],
            dataVencimento: '',
            dataPagamento: '',
            valorDesconto: '0',
            valorJuros: '0',
            valorMulta: '0',
            observacoes: '',
            status: 'PENDENTE'
        });
        onClose();
    };

    if (!isOpen) return null;

    const empresaNome = empresaSelecionada
        ? data.empresas.find(e => e.id === empresaSelecionada)?.nomeFantasia
        : '';

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {isEditing ? 'Editar Cobrança' : 'Nova Cobrança'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {/* Seleção de Empresa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Empresa *
                        </label>
                        <select
                            value={empresaSelecionada || ''}
                            onChange={e => setEmpresaSelecionada(e.target.value ? Number(e.target.value) : null)}
                            disabled={isEditing}
                            className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                        >
                            <option value="">Selecione uma empresa...</option>
                            {(data.empresas || []).map(empresa => (
                                <option key={empresa.id} value={empresa.id}>
                                    {empresa.nomeFantasia} - {empresa.cnpj}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Datas */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Emissão *
                            </label>
                            <input
                                type="date"
                                value={formData.dataEmissao}
                                onChange={e => setFormData({ ...formData, dataEmissao: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Vencimento *
                            </label>
                            <input
                                type="date"
                                value={formData.dataVencimento}
                                onChange={e => setFormData({ ...formData, dataVencimento: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Pagamento
                            </label>
                            <input
                                type="date"
                                value={formData.dataPagamento}
                                onChange={e => setFormData({ ...formData, dataPagamento: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="PENDENTE">Pendente</option>
                            <option value="PAGA">Paga</option>
                            <option value="VENCIDA">Vencida</option>
                            <option value="CANCELADA">Cancelada</option>
                        </select>
                    </div>

                    {/* Lista de Serviços Prestados */}
                    {empresaSelecionada && (
                        <>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">
                                        {isEditing ? 'Serviços Vinculados' : 'Serviços Pendentes de Faturamento'}
                                    </h3>
                                    {!isEditing && servicosPrestados.length > 0 && (
                                        <button
                                            onClick={handleSelecionarTodos}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            {servicosSelecionados.length === servicosPrestados.length
                                                ? 'Desmarcar Todos'
                                                : 'Selecionar Todos'}
                                        </button>
                                    )}
                                </div>

                                {isLoadingServicos ? (
                                    <div className="text-center text-gray-500 py-8">
                                        Carregando serviços...
                                    </div>
                                ) : servicosPrestados.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        {isEditing
                                            ? 'Nenhum serviço vinculado a esta cobrança'
                                            : 'Nenhum serviço pendente para esta empresa'}
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {servicosPrestados.map(servico => (
                                            <div
                                                key={servico.id}
                                                className={`border rounded-lg p-3 ${
                                                    isEditing
                                                        ? 'bg-gray-50'
                                                        : 'cursor-pointer transition-colors'
                                                } ${
                                                    servicosSelecionados.includes(servico.id)
                                                        ? 'bg-blue-50 border-blue-300'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                                onClick={() => !isEditing && handleToggleServico(servico.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {!isEditing && (
                                                        <input
                                                            type="checkbox"
                                                            checked={servicosSelecionados.includes(servico.id)}
                                                            onChange={() => {}}
                                                            className="mt-1"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="font-medium">
                                                            {servico.servico?.nome || 'Serviço'}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Data: {new Date(servico.dataRealizacao).toLocaleDateString('pt-BR')}
                                                            {servico.funcionario && ` • Funcionário: ${servico.funcionario.nome}`}
                                                            {servico.descricaoAdicional && (
                                                                <div className="mt-1">Obs: {servico.descricaoAdicional}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="font-semibold text-green-700">
                                                        R$ {Number(servico.valorCobrado).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Valores Adicionais */}
                            {servicosSelecionados.length > 0 && (
                                <>
                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold mb-3">Ajustes de Valor</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Desconto (R$)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.valorDesconto}
                                                    onChange={e => setFormData({ ...formData, valorDesconto: e.target.value })}
                                                    className="w-full p-2 border rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Juros (R$)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.valorJuros}
                                                    onChange={e => setFormData({ ...formData, valorJuros: e.target.value })}
                                                    className="w-full p-2 border rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Multa (R$)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.valorMulta}
                                                    onChange={e => setFormData({ ...formData, valorMulta: e.target.value })}
                                                    className="w-full p-2 border rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Observações */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Observações
                                        </label>
                                        <textarea
                                            value={formData.observacoes}
                                            onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                                            rows={3}
                                            className="w-full p-2 border rounded-lg"
                                            placeholder="Observações adicionais sobre esta cobrança..."
                                        />
                                    </div>

                                    {/* Resumo Financeiro */}
                                    <div className="bg-gray-50 rounded-lg p-4 border">
                                        <h3 className="font-semibold mb-3">Resumo Financeiro</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Valor dos Serviços:</span>
                                                <span className="font-medium">R$ {calcularValorServicos().toFixed(2)}</span>
                                            </div>
                                            {Number(formData.valorDesconto) > 0 && (
                                                <div className="flex justify-between text-red-600">
                                                    <span>Desconto:</span>
                                                    <span>- R$ {Number(formData.valorDesconto).toFixed(2)}</span>
                                                </div>
                                            )}
                                            {Number(formData.valorJuros) > 0 && (
                                                <div className="flex justify-between text-orange-600">
                                                    <span>Juros:</span>
                                                    <span>+ R$ {Number(formData.valorJuros).toFixed(2)}</span>
                                                </div>
                                            )}
                                            {Number(formData.valorMulta) > 0 && (
                                                <div className="flex justify-between text-orange-600">
                                                    <span>Multa:</span>
                                                    <span>+ R$ {Number(formData.valorMulta).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 flex justify-between items-center">
                                                <span className="font-semibold">Valor Total:</span>
                                                <span className="text-2xl font-bold text-green-700">
                                                    R$ {calcularValorTotal().toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {servicosSelecionados.length} {servicosSelecionados.length === 1 ? 'serviço selecionado' : 'serviços selecionados'}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2 border-t">
                    <button
                        onClick={handleClose}
                        disabled={isSaving}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || (!isEditing && servicosSelecionados.length === 0)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Salvando...' : isEditing ? 'Atualizar Cobrança' : 'Criar Cobrança'}
                    </button>
                </div>
            </div>
        </div>
    );
};