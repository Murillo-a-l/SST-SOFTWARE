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
    <div className={`rounded-2xl border border-[#E0E3E7] bg-white p-4 flex flex-col gap-2 shadow-sm ${color}`}>
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">{title}</div>
        <div className="text-xl">{icon}</div>
      </div>
      <p className="font-mono text-2xl text-[#2F5C8C]">{value}</p>
      <p className="text-xs text-slate-500">Status atualizado</p>
    </div>
  );
};

const QuickActionButton: React.FC<{ text: string, icon: React.ReactNode, onClick: () => void }> = ({ text, icon, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center space-x-3 text-left w-full rounded-full border border-[#D5D8DC] bg-[#F4F6F8] px-3 py-2 text-sm text-slate-700 hover:bg-[#E4E7EB] hover:border-[#C9CDD2] transition-all duration-200"
    >
        <div className="text-[#2F5C8C]">{icon}</div>
        <span className="font-semibold text-slate-800">{text}</span>
    </button>
);

// SVG Icons for Quick Actions
const ImportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const ClipboardPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h3m-3 0h-3m3-3h3m-3 0h-3" /></svg>;


export const Dashboard: React.FC<DashboardProps> = ({ stats, documentos, documentoTipos, empresas, selectedEmpresaNome, onImport, onRegister, onRegisterExame }) => {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Visão Geral</p>
        <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
        <p className="text-sm text-[#2F5C8C] font-medium">{selectedEmpresaNome}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Funcionários" value={stats.totalFuncionarios} color="" icon="👥" />
        <StatCard title="Exames Atrasados" value={stats.examesAtrasados} color="" icon="⚠️" />
        <StatCard title="Vencendo em 30 dias" value={stats.vencendo30Dias} color="" icon="📅" />
        <StatCard title="Em dia" value={stats.emDia} color="" icon="✅" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Assinaturas Pendentes" value={stats.assinaturasPendentes} color="" icon="✍️" />
        <div className="rounded-2xl border border-[#E0E3E7] bg-white p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Contratos</p>
                    <p className="font-mono text-2xl text-[#2F5C8C]">{stats.totalContratos}</p>
                </div>
                <span className="text-2xl">📜</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E0E3E7]">
                <div className="rounded-xl bg-[#E3F3EA] p-3 text-center">
                    <p className="text-[11px] font-semibold text-[#2F6E4A]">Em dia</p>
                    <p className="font-mono text-lg text-[#2F6E4A]">{stats.contratosAtivos}</p>
                </div>
                <div className="rounded-xl bg-[#FFF7E6] p-3 text-center">
                    <p className="text-[11px] font-semibold text-[#8A5B2F]">Vencendo</p>
                    <p className="font-mono text-lg text-[#8A5B2F]">{stats.contratosVencendo}</p>
                </div>
                <div className="rounded-xl bg-[#FDECEC] p-3 text-center">
                    <p className="text-[11px] font-semibold text-[#8A1F1F]">Vencidos</p>
                    <p className="font-mono text-lg text-[#8A1F1F]">{stats.contratosVencidos}</p>
                </div>
            </div>
        </div>
        <div className="rounded-2xl border border-[#E0E3E7] bg-white p-5 shadow-sm flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Ações Rápidas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                <QuickActionButton text="Importar Planilha" icon={<ImportIcon />} onClick={onImport} />
                <QuickActionButton text="Cadastrar Funcionário" icon={<UserPlusIcon />} onClick={onRegister} />
                <QuickActionButton text="Registrar Exame" icon={<ClipboardPlusIcon />} onClick={onRegisterExame} />
            </div>
        </div>
      </div>

      <DashboardAlerts documentos={documentos} empresas={empresas} documentoTipos={documentoTipos} />

    </div>
  );
};
