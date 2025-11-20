import React, { useMemo } from 'react';
import { Funcionario, ExameRealizado } from '../../types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    funcionario: Funcionario | null;
    exames: ExameRealizado[];
}

export const FuncionarioDetailsModal: React.FC<ModalProps> = ({ isOpen, onClose, funcionario, exames }) => {

    const funcionarioExames = useMemo(() => {
        if (!funcionario) return [];
        return (exames || [])
            .filter(e => e.funcionario_id === funcionario.id)
            .sort((a, b) => new Date(b.data_realizacao).getTime() - new Date(a.data_realizacao).getTime());
    }, [funcionario, exames]);

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '—';
        try {
            const [year, month, day] = dateStr.split('-');
            if (day && month && year) return `${day}/${month}/${year}`;
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    if (!isOpen || !funcionario) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">📄 Detalhes do Funcionário</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-800">{funcionario.nome}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-sm">
                            <DetailItem label="Matrícula" value={funcionario.matricula} />
                            <DetailItem label="CPF" value={funcionario.cpf} />
                            <DetailItem label="Cargo" value={funcionario.cargo} />
                            <DetailItem label="Setor" value={funcionario.setor} />
                            <DetailItem label="Admissão" value={formatDate(funcionario.data_admissao)} />
                            <DetailItem label="WhatsApp" value={funcionario.whatsapp} />
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Histórico de Exames</h3>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Realização</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Observações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {funcionarioExames.map(exame => (
                                        <tr key={exame.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{exame.tipo_exame}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(exame.data_realizacao)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(exame.data_vencimento)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{exame.observacoes || 'N/A'}</td>
                                        </tr>
                                    ))}
                                    {funcionarioExames.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-4 text-sm text-gray-500">Nenhum exame registrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">Fechar</button>
                </div>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
    <div>
        <p className="font-semibold text-gray-600">{label}</p>
        <p className="text-gray-800">{value || 'N/A'}</p>
    </div>
);
