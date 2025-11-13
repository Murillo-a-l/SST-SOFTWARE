import React from 'react';

interface RelatoriosTabProps {
    onOpenGerarRelatorio: () => void;
    onOpenGerarRelatorioDocumentos: () => void;
}

export const RelatoriosTab: React.FC<RelatoriosTabProps> = ({ onOpenGerarRelatorio, onOpenGerarRelatorioDocumentos }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Central de Relatórios</h2>
            <p className="text-gray-600 mb-8">
                Gere relatórios detalhados sobre o status dos exames de seus funcionários ou a validade dos documentos de suas empresas. 
                Utilize os filtros avançados para extrair exatamente a informação que você precisa.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button 
                    onClick={onOpenGerarRelatorio} 
                    className="bg-amber-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-amber-600 transition-transform transform hover:scale-105 w-full sm:w-auto"
                >
                    📊 Relatório de Funcionários
                </button>
                <button 
                    onClick={onOpenGerarRelatorioDocumentos} 
                    className="bg-teal-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-teal-600 transition-transform transform hover:scale-105 w-full sm:w-auto"
                >
                    📄 Relatório de Documentos
                </button>
            </div>
        </div>
    );
};