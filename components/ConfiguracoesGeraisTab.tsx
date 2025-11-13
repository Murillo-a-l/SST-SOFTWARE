import React from 'react';

interface ConfiguracoesGeraisTabProps {
    onOpenConfiguracoes: () => void;
    onOpenBackup: () => void;
    onOpenConfigNFSe: () => void;
}

const SettingsCard: React.FC<{ title: string; description: string; buttonText: string; icon: string; onClick: () => void }> = 
({ title, description, buttonText, icon, onClick }) => {
    return (
        <div className="bg-gray-50 p-6 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-4xl">{icon}</div>
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            <button 
                onClick={onClick}
                className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition shadow-sm w-full sm:w-auto"
            >
                {buttonText}
            </button>
        </div>
    );
};

export const ConfiguracoesGeraisTab: React.FC<ConfiguracoesGeraisTabProps> = ({ onOpenConfiguracoes, onOpenBackup, onOpenConfigNFSe }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações Gerais</h2>
            <div className="space-y-6">
                <SettingsCard
                    icon="⚙️"
                    title="Gerenciamento PCMSO"
                    description="Configure os dados base do sistema, como cargos, riscos, exames e periodicidades."
                    buttonText="Abrir Gerenciador"
                    onClick={onOpenConfiguracoes}
                />
                <SettingsCard
                    icon="📄"
                    title="Configuração de NFS-e"
                    description="Configure as credenciais para emissão de Nota Fiscal de Serviço Eletrônica (IPM/AtendeNet)."
                    buttonText="Configurar NFS-e"
                    onClick={onOpenConfigNFSe}
                />
                 <SettingsCard
                    icon="💾"
                    title="Backup e Restauração"
                    description="Exporte todos os seus dados para um arquivo seguro ou restaure a partir de um backup."
                    buttonText="Abrir Backup"
                    onClick={onOpenBackup}
                />
            </div>
        </div>
    );
};
