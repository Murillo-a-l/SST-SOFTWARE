import React, { useState } from 'react';
import { Empresa, DbData } from '../../types';

interface FinanceiroTabProps {
    empresa: Empresa;
    data: DbData;
    onDataChange: () => void;
}

type FinanceiroSubTab = 'servicos' | 'cobrancas' | 'nfe';

export const FinanceiroTab: React.FC<FinanceiroTabProps> = ({ empresa, data, onDataChange }) => {
    const [activeTab, setActiveTab] = useState<FinanceiroSubTab>('servicos');

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-gray-200 flex-shrink-0">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <SubTabButton name="servicos" label="Serviços Prestados" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SubTabButton name="cobrancas" label="Cobranças" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SubTabButton name="nfe" label="Notas Fiscais (NFS-e)" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>
            <div className="pt-5 flex-grow overflow-y-auto">
                {activeTab === 'servicos' && <p>Conteúdo da aba de Serviços Prestados aqui.</p>}
                {activeTab === 'cobrancas' && <p>Conteúdo da aba de Cobranças aqui.</p>}
                {activeTab === 'nfe' && <p>Conteúdo da aba de Notas Fiscais aqui.</p>}
            </div>
        </div>
    );
};

const SubTabButton: React.FC<{name: FinanceiroSubTab; label: string; activeTab: FinanceiroSubTab; setActiveTab: (tab: FinanceiroSubTab) => void;}> = 
({ name, label, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`${
            activeTab === name
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
    >
        {label}
    </button>
);