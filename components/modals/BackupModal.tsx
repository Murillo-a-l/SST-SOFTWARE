import React, { useState, useRef } from 'react';
import { exportBackup, importBackup } from '../../services/dbService';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDataChange: () => void;
}

export const BackupModal: React.FC<ModalProps> = ({ isOpen, onClose, onDataChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleExport = () => {
        exportBackup();
        toast.error("Backup exportado com sucesso! Verifique sua pasta de downloads.");
    };

    const handleImportClick = () => {
        if (window.confirm("Atenção! Restaurar um backup irá substituir TODOS os dados atuais. Esta ação é irreversível. Deseja continuar?")) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsRestoring(true);
        try {
            await importBackup(file);
            toast.error("Backup restaurado com sucesso! A aplicação será atualizada.");
            onDataChange();
            onClose();
        } catch (error: any) {
            toast.error(`Erro ao restaurar backup: ${error.message}`);
        } finally {
            setIsRestoring(false);
            // Reset file input
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center px-4 py-6">
            <div className="bg-white rounded-2xl border border-[#DADFE3] shadow-lg w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">💾 Backup e Restauração</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-800">Exportar Dados</h3>
                        <p className="text-sm text-gray-600 mt-1 mb-3">Salve todos os dados da aplicação em um arquivo JSON. Guarde este arquivo em um local seguro.</p>
                        <button 
                            onClick={handleExport}
                            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                        >
                            Exportar Backup (.json)
                        </button>
                    </div>
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-gray-800">Importar Dados</h3>
                        <p className="text-sm text-gray-600 mt-1 mb-3">
                            <span className="font-bold text-red-600">Atenção:</span> Esta ação substituirá todos os dados atuais.
                        </p>
                        <button 
                            onClick={handleImportClick}
                            disabled={isRestoring}
                            className="w-full bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition disabled:bg-gray-400"
                        >
                            {isRestoring ? 'Restaurando...' : 'Importar Backup (.json)'}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            className="hidden"
                        />
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300">Fechar</button>
                </div>
            </div>
        </div>
    );
};