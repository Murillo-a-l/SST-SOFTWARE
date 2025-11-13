import React from 'react';
import type { Stats, DocumentoEmpresa, Empresa, DocumentoTipo } from '../types';
import { DashboardAlerts } from './DashboardAlerts';

interface DashboardProps {
  stats: Stats;
  documentos: DocumentoEmpresa[];
  documentoTipos: DocumentoTipo[];
  empresas: Empresa[];
  selectedEmpresaNome: string;
  onImport: () => void;
  onRegister: () => void;
  onRegisterExame: () => void;
}

const StatCard: React.FC<{ title: string; value: number; color: string; icon: string; }> = ({ title, value, color, icon }) => {
  return (
    <div className={`bg-white p-5 rounded-xl shadow-md flex items-center border-l-4 ${color}`}>
      <div className="text-3xl mr-4">{icon}</div>
      <div className="flex-grow text-center">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const QuickActionButton: React.FC<{ text: string, icon: React.ReactNode, onClick: () => void }> = ({ text, icon, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center space-x-3 text-left w-full bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-indigo-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
        <div className="text-indigo-600">{icon}</div>
        <span className="font-semibold text-gray-700">{text}</span>
    </button>
);

// SVG Icons for Quick Actions
const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const ClipboardPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h3m-3 0h-3m3-3h3m-3 0h-3" /></svg>;


export const Dashboard: React.FC<DashboardProps> = ({ stats, documentos, documentoTipos, empresas, selectedEmpresaNome, onImport, onRegister, onRegisterExame }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h2>
        <p className="text-md text-indigo-600 font-semibold">{selectedEmpresaNome}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <StatCard title="Total Funcionários" value={stats.totalFuncionarios} color="border-azul-serenity" icon="👥" />
        <StatCard title="Exames Atrasados" value={stats.examesAtrasados} color="border-vermelho-suave" icon="⚠️" />
        <StatCard title="Vencendo em 30 dias" value={stats.vencendo30Dias} color="border-amarelo-suave" icon="📅" />
        <StatCard title="Em dia" value={stats.emDia} color="border-verde-menta" icon="✅" />
        <StatCard title="Assinaturas Pendentes" value={stats.assinaturasPendentes} color="border-indigo-300" icon="✍️" />
        
        {/* Contract Stats Card */}
         <div className="bg-white p-5 rounded-xl shadow-md flex items-start border-l-4 border-lilas-pastel xl:col-span-2">
            <div className="text-3xl mr-4 pt-1">📜</div>
            <div className="flex-grow text-center">
                <p className="text-sm text-gray-500 font-medium">Contratos</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalContratos}</p>
                {/* Sub-stats Breakdown */}
                <div className="flex justify-between items-center pt-2 border-t mt-2 space-x-2">
                    <div className="text-center flex-1">
                        <p className="text-xs text-green-600 font-medium">EM DIA</p>
                        <p className="text-lg font-bold text-green-600">{stats.contratosAtivos}</p>
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-xs text-yellow-600 font-medium">VENCENDO</p>
                        <p className="text-lg font-bold text-yellow-600">{stats.contratosVencendo}</p>
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-xs text-red-600 font-medium">VENCIDOS</p>
                        <p className="text-lg font-bold text-red-600">{stats.contratosVencidos}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionButton text="Importar Planilha" icon={<ImportIcon />} onClick={onImport} />
            <QuickActionButton text="Cadastrar Funcionário" icon={<UserPlusIcon />} onClick={onRegister} />
            <QuickActionButton text="Registrar Exame" icon={<ClipboardPlusIcon />} onClick={onRegisterExame} />
        </div>
      </div>

      <DashboardAlerts documentos={documentos} empresas={empresas} documentoTipos={documentoTipos} />

    </div>
  );
};
