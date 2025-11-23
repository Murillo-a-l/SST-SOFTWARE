import React from 'react';
import type { Stats, DocumentoEmpresa, Empresa, DocumentoTipo } from '../types';
import { DashboardAlerts } from './DashboardAlerts';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { SectionHeader } from '../src/components/ui/SectionHeader';
import { AppIcon } from '../src/components/ui/AppIcon';
import { colors, typography } from '../src/styles/tokens';

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
    <Card className="group flex flex-col gap-3 border border-[#E3E8F2] bg-white/80">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B7A92]">{title}</p>
          <p className="font-mono text-3xl text-[#0F4C5C]">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F4C5C] via-[#147D8C] to-[#0F4C5C] text-white shadow-[0_10px_22px_rgba(12,59,73,0.25)] ring-1 ring-white/60">
          {icon}
        </div>
      </div>
      <p className="text-xs text-[#6B7A92]">Status atualizado</p>
    </Card>
  );
};

const QuickActionButton: React.FC<{ text: string; icon: React.ReactNode; onClick: () => void }> = ({ text, icon, onClick }) => (
  <Button
    variant="secondary"
    size="md"
    className="w-full justify-between rounded-2xl border border-[#E3E8F2] bg-white/80"
    onClick={onClick}
  >
    <span className="font-semibold text-[#0F4C5C]">{text}</span>
    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F7F9FC] text-[#C07954] shadow-inner">{icon}</span>
  </Button>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats, documentos, documentoTipos, empresas, selectedEmpresaNome, onImport, onRegister, onRegisterExame }) => {
  return (
    <div className="space-y-8">
      <SectionHeader
        label="Visão Geral"
        title="Dashboard"
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E3E8F2] bg-white/80 px-4 py-2 text-sm font-semibold text-[#0F4C5C] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#C07954] animate-pulse" aria-hidden />
            {selectedEmpresaNome}
          </span>
        }
      />

      <Card className="relative overflow-hidden border border-[#D4DCE6] bg-gradient-to-br from-[#F7F9FC] via-white to-[#EDE3D5] shadow-[0_24px_70px_rgba(12,26,45,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(192,121,84,0.12),transparent_30%),radial-gradient(circle_at_85%_-10%,rgba(15,76,92,0.14),transparent_36%)]" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#E3E8F2] to-transparent" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#6B7A92]">Health tech retrô-chique</p>
            <h3 className="text-2xl font-semibold text-[#0F4C5C] leading-tight">Visual premium, minimalista e pronto para narrar saúde ocupacional</h3>
            <p className="text-sm text-[#4B5568] max-w-2xl">
              Cards com brilho metálico suave, navegação de vidro e toques de cobre modernizam o painel sem perder a clareza clínica. Cada ação reforça a identidade premium com microinterações e hierarquia tipográfica refinada.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F7F1E3] text-[#8A5B2F] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] border border-[#D9B26D]">Matriz + filiais</span>
              <span className="rounded-full bg-[#F7F9FC] text-[#0F4C5C] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] border border-[#E3E8F2]">Monitoramento clínico</span>
              <span className="rounded-full bg-white text-[#147D8C] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] border border-[#D4DCE6]">Retro-futurista</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 min-w-[260px] w-full lg:w-auto">
            <div className="rounded-2xl border border-[#E3E8F2] bg-white/85 p-4 shadow-[0_14px_32px_rgba(12,26,45,0.12)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6B7A92]">Selo</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-lg font-semibold text-[#0F4C5C]">Clinical Grade</p>
                <span className="rounded-full bg-[#0F4C5C] text-white text-[11px] px-3 py-1 uppercase tracking-[0.18em] shadow-[0_10px_24px_rgba(12,59,73,0.25)]">HX</span>
              </div>
              <p className="text-sm text-[#4B5568] mt-2">Narrativa health-tech com contraste premium e feedback imediato.</p>
            </div>
            <div className="rounded-2xl border border-[#E3E8F2] bg-[#F7F9FC]/80 p-4 shadow-inner">
              <div className="flex items-center gap-2 text-[#147D8C] font-semibold">
                <AppIcon name="check" className="h-4 w-4" />
                <span>Estética minimalista com toque retrô</span>
              </div>
              <div className="flex items-center gap-2 text-[#C07954] font-semibold mt-2">
                <AppIcon name="document" className="h-4 w-4" />
                <span>Documentos e alertas com storytelling visual</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Funcionários" value={stats.totalFuncionarios} icon={<AppIcon name="users" />} />
        <StatCard title="Exames Atrasados" value={stats.examesAtrasados} icon={<AppIcon name="clipboard" />} />
        <StatCard title="Vencendo em 30 dias" value={stats.vencendo30Dias} icon={<AppIcon name="document" />} />
        <StatCard title="Em dia" value={stats.emDia} icon={<AppIcon name="check" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Assinaturas Pendentes" value={stats.assinaturasPendentes} icon={<AppIcon name="document" />} />
        <Card className="flex flex-col gap-3 border border-[#E3E8F2] bg-white/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B7A92]">Contratos</p>
              <p className="font-mono text-3xl text-[#0F4C5C]">{stats.totalContratos}</p>
            </div>
            <AppIcon name="document" className="text-[#6B7A92] h-5 w-5" />
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#E3E8F2]">
            <div className="rounded-2xl bg-[#E3F3EA] p-3 text-center border border-[#B8D8C6]">
              <p className="text-[11px] font-semibold text-[#2F6E4A] uppercase tracking-[0.14em]">Em dia</p>
              <p className="font-mono text-xl text-[#2F6E4A]">{stats.contratosAtivos}</p>
            </div>
            <div className="rounded-2xl bg-[#FFF7E6] p-3 text-center border border-[#E8D3A8]">
              <p className="text-[11px] font-semibold text-[#8A5B2F] uppercase tracking-[0.14em]">Vencendo</p>
              <p className="font-mono text-xl text-[#8A5B2F]">{stats.contratosVencendo}</p>
            </div>
            <div className="rounded-2xl bg-[#FDECEC] p-3 text-center border border-[#E4B2B2]">
              <p className="text-[11px] font-semibold text-[#8A1F1F] uppercase tracking-[0.14em]">Vencidos</p>
              <p className="font-mono text-xl text-[#8A1F1F]">{stats.contratosVencidos}</p>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col gap-3 border border-[#E3E8F2] bg-white/80">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B7A92]">Ações Rápidas</p>
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
