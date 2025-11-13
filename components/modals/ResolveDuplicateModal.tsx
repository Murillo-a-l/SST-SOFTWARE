import React, { useState, useEffect } from 'react';
import { Funcionario, DuplicateGroup } from '../../types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    duplicateGroup: DuplicateGroup | null;
    onMerge: (primaryId: number, secondaryIds: number[]) => void;
}

export const ResolveDuplicateModal: React.FC<ModalProps> = ({ isOpen, onClose, duplicateGroup, onMerge }) => {
    const [primaryId, setPrimaryId] = useState<number | null>(null);

    useEffect(() => {
        if (duplicateGroup) {
            // Auto-select the "best" record as primary (e.g., most fields filled, most recent exam)
            const bestRecord = duplicateGroup.funcionarios.reduce((best, current) => {
                const score = (f: Funcionario) => (f.cpf ? 2 : 0) + (f.matricula ? 1 : 0) + (f.data_ultimo_exame ? 2 : 0);
                return score(current) > score(best) ? current : best;
            });
            setPrimaryId(bestRecord.id);
        }
    }, [duplicateGroup]);

    const handleMerge = () => {
        if (!primaryId || !duplicateGroup) return;
        const secondaryIds = duplicateGroup.funcionarios.map(f => f.id).filter(id => id !== primaryId);
        onMerge(primaryId, secondaryIds);
    };

    if (!isOpen || !duplicateGroup) return null;

    const { type, identifier, funcionarios } = duplicateGroup;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Resolver Duplicidade de Cadastros</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                        <h3 className="font-semibold text-yellow-800">
                            {type === 'CPF' ? 'Duplicidade por CPF' : 'Duplicidade por Nome Similar'}
                        </h3>
                        <p className="text-sm text-gray-700">
                            Foram encontrados {funcionarios.length} registros para o identificador: <span className="font-bold">{identifier}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            Selecione o registro que deseja manter como principal. Os dados dos outros registros serão mesclados e o histórico de exames será transferido.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {funcionarios.map(func => (
                            <div key={func.id} className={`p-4 rounded-lg border-2 ${primaryId === func.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="primary-record"
                                        checked={primaryId === func.id}
                                        onChange={() => setPrimaryId(func.id)}
                                        className="h-5 w-5 text-blue-600"
                                    />
                                    <h4 className="font-bold text-lg">{func.nome}</h4>
                                </label>
                                <div className="mt-4 space-y-2 text-sm">
                                    <DetailRow label="Matrícula" value={func.matricula} />
                                    <DetailRow label="CPF" value={func.cpf} />
                                    <DetailRow label="Cargo" value={func.cargo} />
                                    <DetailRow label="Setor" value={func.setor} />
                                    <DetailRow label="Último Exame" value={func.data_ultimo_exame ? new Date(func.data_ultimo_exame).toLocaleDateString('pt-BR') : null} />
                                    <DetailRow label="Cadastrado em" value={new Date(func.created_at).toLocaleDateString('pt-BR')} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleMerge} disabled={!primaryId} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                        Mesclar e Resolver
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailRow: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
    <div className="flex justify-between">
        <span className="text-gray-500 font-medium">{label}:</span>
        <span className="text-gray-800 font-semibold text-right">{value || 'N/A'}</span>
    </div>
);