import React from 'react';
import type { Stats, DocumentoEmpresa, Empresa, DocumentoTipo } from '../types';
import { DashboardAlerts } from './DashboardAlerts';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
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
    <Card className="group flex flex-col gap-1 border border-[#E3E8F2] bg-white/80 py-2">
      <div className="flex items-center justify-between -mt-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B7A92]">{title}</p>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F4C5C] via-[#147D8C] to-[#0F4C5C] text-white shadow-[0_10px_22px_rgba(12,59,73,0.25)] ring-1 ring-white/60">
          {icon}
        </div>
      </div>
      <p className="font-mono text-3xl text-[#0F4C5C] leading-none text-center">{value}</p>
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
  const totalDocumentos = documentos.length;
  const documentosVencidos = documentos.filter((d) => d.status === 'VENCIDO').length;
  const documentosVencendo = documentos.filter((d) => d.status === 'VENCENDO').length;
  const pendentesAssinatura = stats.assinaturasPendentes;

  return (
    <div className="space-y-8">

      <Card className="relative overflow-hidden border border-[#D4DCE6] bg-gradient-to-br from-[#F7F9FC] via-white to-[#EDE3D5] shadow-[0_24px_70px_rgba(12,26,45,0.12)] -mt-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(192,121,84,0.08),transparent_30%),radial-gradient(circle_at_85%_-10%,rgba(15,76,92,0.10),transparent_36%)]" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#E3E8F2] to-transparent" />
        <div className="relative flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#6B7A92]">Resumo</p>
            <h3 className="text-base font-semibold text-[#0F4C5C] leading-snug">Indicadores da empresa selecionada</h3>
            <p className="text-xs text-[#4B5568] max-w-2xl">
              Exames, contratos e assinaturas em um só lugar. As ações rápidas ficam ao lado para facilitar o dia a dia.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-w-[260px] w-full lg:w-auto">
            <div className="rounded-2xl border border-[#E3E8F2] bg-white/85 p-4 shadow-[0_14px_32px_rgba(12,26,45,0.12)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[#6B7A92]">Empresa selecionada</p>
              <p className="text-lg font-semibold text-[#0F4C5C] mt-1 leading-tight">{selectedEmpresaNome}</p>
              <p className="text-sm text-[#4B5568] mt-2">Use o menu superior para trocar de empresa e atualizar os dados.</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Funcionarios" value={stats.totalFuncionarios} icon={<AppIcon name="users" />} />
        <StatCard title="Exames Atrasados" value={stats.examesAtrasados} icon={<AppIcon name="clipboard" />} />
        <StatCard title="Vencendo em 30 dias" value={stats.vencendo30Dias} icon={<AppIcon name="document" />} />
        <StatCard title="Em dia" value={stats.emDia} icon={<AppIcon name="check" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border border-[#E3E8F2] bg-white/80 h-full">
          <div className="-m-5 flex h-full flex-col p-4 pb-0">
            <div className="flex items-center justify-between -mt-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B7A92]">Documentos</p>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F4C5C] via-[#147D8C] to-[#0F4C5C] text-white shadow-[0_10px_22px_rgba(12,59,73,0.25)] ring-1 ring-white/60">
                <AppIcon name="document" className="h-4 w-4" />
              </div>
            </div>
            <p className="font-mono text-3xl text-[#0F4C5C] text-center leading-none mt-4 mb-8">{totalDocumentos}</p>
            <div className="flex-1" />
            <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3 pb-0 border-t border-[#E3E8F2] mb-[-6px]">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A5B2F]">Pend. assinatura</span>
                <span className="font-mono text-lg text-[#8A5B2F]">{pendentesAssinatura}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A1F1F]">Vencidos</span>
                <span className="font-mono text-lg text-[#8A1F1F]">{documentosVencidos}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A5B2F]">Vencendo 30d</span>
                <span className="font-mono text-lg text-[#8A5B2F]">{documentosVencendo}</span>
              </div>
            </div>
          </div>
        </Card>
        <Card className="border border-[#E3E8F2] bg-white/80 h-full">
          <div className="-m-5 flex h-full flex-col p-4 pb-0">
            <div className="flex items-center justify-between -mt-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B7A92]">Contratos</p>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F4C5C] via-[#147D8C] to-[#0F4C5C] text-white shadow-[0_10px_22px_rgba(12,59,73,0.25)] ring-1 ring-white/60">
                <AppIcon name="document" className="h-4 w-4" />
              </div>
            </div>
            <p className="font-mono text-3xl text-[#0F4C5C] text-center leading-none mt-4 mb-8">{stats.totalContratos}</p>
            <div className="flex-1" />
            <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3 pb-0 border-t border-[#E3E8F2] mb-[-6px]">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2F6E4A]">Em dia</span>
                <span className="font-mono text-lg text-[#2F6E4A]">{stats.contratosAtivos}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A5B2F]">Vencendo</span>
                <span className="font-mono text-lg text-[#8A5B2F]">{stats.contratosVencendo}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A1F1F]">Vencidos</span>
                <span className="font-mono text-lg text-[#8A1F1F]">{stats.contratosVencidos}</span>
              </div>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col gap-3 border border-[#E3E8F2] bg-white/80">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B7A92]">Ações Rápidas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            <QuickActionButton text="Importar Planilha" icon={<AppIcon name="document" />} onClick={onImport} />
            <QuickActionButton text="Cadastrar Funcionario" icon={<AppIcon name="users" />} onClick={onRegister} />
            <QuickActionButton text="Registrar Exame" icon={<AppIcon name="clipboard" />} onClick={onRegisterExame} />
          </div>
        </Card>
      </div>

      <DashboardAlerts documentos={documentos} empresas={empresas} documentoTipos={documentoTipos} />
    </div>
  );
};
