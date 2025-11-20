import React from 'react';
import type { Stats, DocumentoEmpresa, Empresa, DocumentoTipo } from '../types';
import { DashboardAlerts } from './DashboardAlerts';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { SectionHeader } from '../src/components/ui/SectionHeader';
import { AppIcon } from '../src/components/ui/AppIcon';

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

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => {
  return (
    <Card className="flex flex-col gap-2" subtitle={title}>
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">{title}</p>
        <div className="text-xl text-[#6A7381]">{icon}</div>
      </div>
      <p className="font-mono text-2xl text-[#2F5C8C]">{value}</p>
      <p className="text-xs text-slate-500">Status atualizado</p>
    </Card>
  );
};

const QuickActionButton: React.FC<{ text: string; icon: React.ReactNode; onClick: () => void }> = ({ text, icon, onClick }) => (
  <Button
    variant="secondary"
    className="w-full rounded-full justify-start px-4"
    onClick={onClick}
  >
    <span className="text-[#2F5C8C]">{icon}</span>
    <span className="font-semibold text-slate-800">{text}</span>
  </Button>
);


export const Dashboard: React.FC<DashboardProps> = ({ stats, documentos, documentoTipos, empresas, selectedEmpresaNome, onImport, onRegister, onRegisterExame }) => {
  return (
    <div className="space-y-8">
      <SectionHeader label="Visão Geral" title="Dashboard" actions={<p className="text-sm text-[#2F5C8C] font-medium">{selectedEmpresaNome}</p>} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Funcionários" value={stats.totalFuncionarios} icon={<AppIcon name="users" />} />
        <StatCard title="Exames Atrasados" value={stats.examesAtrasados} icon={<span>⚠️</span>} />
        <StatCard title="Vencendo em 30 dias" value={stats.vencendo30Dias} icon={<span>📅</span>} />
        <StatCard title="Em dia" value={stats.emDia} icon={<span>✅</span>} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Assinaturas Pendentes" value={stats.assinaturasPendentes} icon={<span>✍️</span>} />
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Contratos</p>
              <p className="font-mono text-2xl text-[#2F5C8C]">{stats.totalContratos}</p>
            </div>
            <span className="text-2xl text-[#6A7381]">📜</span>
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
        </Card>
        <Card className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#7B8EA3]">Ações Rápidas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            <QuickActionButton text="Importar Planilha" icon={<AppIcon name="document" />} onClick={onImport} />
            <QuickActionButton text="Cadastrar Funcionário" icon={<AppIcon name="users" />} onClick={onRegister} />
            <QuickActionButton text="Registrar Exame" icon={<AppIcon name="clipboard" />} onClick={onRegisterExame} />
          </div>
        </Card>
      </div>

      <DashboardAlerts documentos={documentos} empresas={empresas} documentoTipos={documentoTipos} />

    </div>
  );
};
