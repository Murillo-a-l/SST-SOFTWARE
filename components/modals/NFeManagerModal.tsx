import React, { useState, useEffect } from 'react';
import { NFe, DbData, ServicoPrestado, Empresa } from '../../types';
import { api, ApiError, NFSeEmissaoResponse } from '../../services/apiService';
import toast from 'react-hot-toast';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    nfe: NFe | null;
    data: DbData;
}

export const NFeManagerModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onSaveSuccess,
    data
}) => {
    const [empresaSelecionada, setEmpresaSelecionada] = useState<number | null>(null);
    const [servicosPrestados, setServicosPrestados] = useState<ServicoPrestado[]>([]);
    const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
    const [observacao, setObservacao] = useState('');
    const [isEmitindo, setIsEmitindo] = useState(false);
    const [nfeEmitida, setNfeEmitida] = useState<NFSeEmissaoResponse | null>(null);

    // Carrega serviços prestados quando empresa é selecionada
    useEffect(() => {
        if (empresaSelecionada) {
            carregarServicosPrestados();
        } else {
            setServicosPrestados([]);
            setServicosSelecionados([]);
        }
    }, [empresaSelecionada]);

    const carregarServicosPrestados = async () => {
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

    const calcularValorTotal = () => {
        return servicosPrestados
            .filter(s => servicosSelecionados.includes(s.id))
            .reduce((acc, s) => acc + Number(s.valorCobrado), 0);
    };

    const handleEmitir = async () => {
        if (!empresaSelecionada) {
            toast.error('Selecione uma empresa');
            return;
        }

        if (servicosSelecionados.length === 0) {
            toast.error('Selecione pelo menos um serviço');
            return;
        }

        setIsEmitindo(true);
        try {
            const response = await api.nfes.emitir({
                empresaId: empresaSelecionada,
                servicosPrestadosIds: servicosSelecionados,
                observacao: observacao || undefined
            });

            setNfeEmitida(response);
            toast.success(response.message);
            onSaveSuccess();
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Erro ao emitir NFSe');
            }
        } finally {
            setIsEmitindo(false);
        }
    };

    const handleFechar = () => {
        setEmpresaSelecionada(null);
        setServicosPrestados([]);
        setServicosSelecionados([]);
        setObservacao('');
        setNfeEmitida(null);
        onClose();
    };

    if (!isOpen) return null;

    // Se NFSe foi emitida, mostra tela de sucesso
    if (nfeEmitida) {
        return (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
                <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-2xl">
                    <div className="p-4 border-b flex justify-between items-center bg-green-50">
                        <h2 className="text-xl font-bold text-green-700">NFS-e Emitida com Sucesso!</h2>
                        <button onClick={handleFechar} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {nfeEmitida.response.numero && (
                                    <div>
                                        <span className="font-semibold">Número:</span>
                                        <span className="ml-2">{nfeEmitida.response.numero}</span>
                                    </div>
                                )}
                                {nfeEmitida.response.serie && (
                                    <div>
                                        <span className="font-semibold">Série:</span>
                                        <span className="ml-2">{nfeEmitida.response.serie}</span>
                                    </div>
                                )}
                                {nfeEmitida.response.data && (
                                    <div>
                                        <span className="font-semibold">Data:</span>
                                        <span className="ml-2">{nfeEmitida.response.data}</span>
                                    </div>
                                )}
                                {nfeEmitida.response.hora && (
                                    <div>
                                        <span className="font-semibold">Hora:</span>
                                        <span className="ml-2">{nfeEmitida.response.hora}</span>
                                    </div>
                                )}
                                {nfeEmitida.response.codigoVerificador && (
                                    <div className="col-span-2">
                                        <span className="font-semibold">Código Verificador:</span>
                                        <span className="ml-2 font-mono">{nfeEmitida.response.codigoVerificador}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {nfeEmitida.response.link && (
                            <div>
                                <a
                                    href={nfeEmitida.response.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Visualizar NFS-e
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
                        <button
                            onClick={handleFechar}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Emitir NFS-e</h2>
                    <button onClick={handleFechar} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {/* Seleção de Empresa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
                        <select
                            value={empresaSelecionada || ''}
                            onChange={e => setEmpresaSelecionada(e.target.value ? Number(e.target.value) : null)}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="">Selecione uma empresa...</option>
                            {data.empresas.map(empresa => (
                                <option key={empresa.id} value={empresa.id}>
                                    {empresa.nomeFantasia} - {empresa.cnpj}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lista de Serviços Prestados */}
                    {empresaSelecionada && (
                        <>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">Serviços Pendentes de Faturamento</h3>
                                    {servicosPrestados.length > 0 && (
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

                                {servicosPrestados.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        Nenhum serviço pendente para esta empresa
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {servicosPrestados.map(servico => (
                                            <div
                                                key={servico.id}
                                                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                    servicosSelecionados.includes(servico.id)
                                                        ? 'bg-blue-50 border-blue-300'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                                onClick={() => handleToggleServico(servico.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={servicosSelecionados.includes(servico.id)}
                                                        onChange={() => {}}
                                                        className="mt-1"
                                                    />
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

                            {/* Observações */}
                            {servicosSelecionados.length > 0 && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Observações (opcional)
                                        </label>
                                        <textarea
                                            value={observacao}
                                            onChange={e => setObservacao(e.target.value)}
                                            rows={3}
                                            className="w-full p-2 border rounded-lg"
                                            placeholder="Observações adicionais para a nota fiscal..."
                                        />
                                    </div>

                                    {/* Resumo */}
                                    <div className="bg-gray-50 rounded-lg p-4 border">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-sm text-gray-600">
                                                    {servicosSelecionados.length} {servicosSelecionados.length === 1 ? 'serviço selecionado' : 'serviços selecionados'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600">Valor Total</div>
                                                <div className="text-2xl font-bold text-green-700">
                                                    R$ {calcularValorTotal().toFixed(2)}
                                                </div>
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
                        onClick={handleFechar}
                        disabled={isEmitindo}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleEmitir}
                        disabled={isEmitindo || servicosSelecionados.length === 0}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEmitindo ? 'Emitindo...' : 'Emitir NFS-e'}
                    </button>
                </div>
            </div>
        </div>
    );
};
