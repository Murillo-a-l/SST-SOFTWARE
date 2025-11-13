import React from 'react';

interface MainMenuProps {
    onImport: () => void;
    onRegister: () => void;
    onReport: () => void;
    onSettings: () => void;
    onBackup: () => void;
}

const MenuButton: React.FC<{ text: string, icon: string, onClick: () => void, className?: string }> = ({ text, icon, onClick, className }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center space-x-2 text-sm font-semibold text-white px-4 py-3 rounded-lg shadow-md hover:opacity-90 transition-transform transform hover:scale-105 ${className}`}
    >
        <span>{icon}</span>
        <span>{text}</span>
    </button>
);


export const MainMenu: React.FC<MainMenuProps> = ({ onImport, onRegister, onReport, onSettings, onBackup }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2">
        <MenuButton text="Importar Planilha" icon="📂" onClick={onImport} className="bg-blue-500" />
        <MenuButton text="Cadastrar Manual" icon="➕" onClick={onRegister} className="bg-green-500" />
        <MenuButton text="Gerar Relatório" icon="📋" onClick={onReport} className="bg-amber-500" />
        <MenuButton text="Configurações" icon="⚙️" onClick={onSettings} className="bg-purple-500" />
        <MenuButton text="Backup" icon="💾" onClick={onBackup} className="bg-gray-500" />
    </div>
  );
};
