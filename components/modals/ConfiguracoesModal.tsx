
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenPeriodicidade: () => void;
    onOpenCargos: () => void;
    onOpenAmbientes: () => void;
    onOpenRiscos: () => void;
    onOpenExames: () => void;
    onOpenDocumentoTipos: () => void;
    onOpenUsuarios: () => void;
}

const SectionCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">{title}</h3>
        {children}
    </div>
);


export const ConfiguracoesModal: React.FC<ModalProps> = (props) => {
    const { 
        isOpen, 
        onClose, 
        onOpenPeriodicidade, 
        onOpenCargos,
        onOpenAmbientes,
        onOpenRiscos,
        onOpenExames,
        onOpenDocumentoTipos,
        onOpenUsuarios,
    } = props;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-50 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold">⚙️ Configurações e Gerenciamento</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto">
                    <SectionCard title="Central de Gerenciamento">
                        <p className="text-sm text-gray-600 mb-4">Acesse os gerenciadores para configurar os dados base do seu sistema.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ManagementButton onClick={onOpenUsuarios} icon="👥" label="Gerenciar Usuários" />
                            <ManagementButton onClick={onOpenDocumentoTipos} icon="📄" label="Tipos de Documento" />
                            <ManagementButton onClick={onOpenCargos} icon="👔" label="Cargos Padronizados" />
                            <ManagementButton onClick={onOpenPeriodicidade} icon="📅" label="Periodicidades por Cargo" />
                            <ManagementButton onClick={onOpenAmbientes} icon="🏢" label="Ambientes de Trabalho" />
                            <ManagementButton onClick={onOpenRiscos} icon="⚠️" label="Riscos Ocupacionais" />
                            <ManagementButton onClick={onOpenExames} icon="🔬" label="Exames Disponíveis" />
                        </div>
                    </SectionCard>
                     <div className="text-center mt-4">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ManagementButton: React.FC<{onClick: () => void; icon: string; label: string;}> = ({ onClick, icon, label }) => (
    <button
        onClick={onClick}
        className="flex items-center space-x-3 text-left w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
        <span className="text-2xl">{icon}</span>
        <div>
            <p className="font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-500">Clique para abrir o gerenciador</p>
        </div>
    </button>
);
