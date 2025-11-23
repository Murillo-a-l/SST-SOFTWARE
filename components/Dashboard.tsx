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
    <Card className="group flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={`${typography.label} text-[${colors.text.secondary}]`}>{title}</p>
          <p className={`font-mono text-3xl text-[${colors.accent.primary}]`}>{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[${colors.background.surfaceMuted}] text-[${colors.accent.primary}] ring-1 ring-[${colors.border.subtle}]`}>
          {icon}
        </div>
      </div>
      <p className={`text-xs text-[${colors.text.secondary}]`}>Status atualizado</p>
    </Card>
  );
};

const QuickActionButton: React.FC<{ text: string; icon: React.ReactNode; onClick: () => void }> = ({ text, icon, onClick }) => (
  <Button
    variant="secondary"
    size="md"
    className={`w-full justify-between rounded-2xl bg-[${colors.background.surface}] border border-[${colors.border.subtle}]`}
    onClick={onClick}
  >
    <span className="font-semibold text-[color:inherit]">{text}</span>
    <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-[${colors.background.surfaceMuted}] text-[${colors.accent.secondary}] shadow-inner`}>{icon}</span>
  </Button>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats, documentos, documentoTipos, empresas, selectedEmpresaNome, onImport, onRegister, onRegisterExame }) => {
  return (
    <div className="space-y-8">
      <div
        className={`flex flex-wrap items-center gap-3 text-[${colors.accent.retro}] ${typography.mono} tracking-[0.24em]`}
      >
        <span>SISTEMA // ONLINE</span>
        <span className={`h-1 w-1 rounded-full bg-[${colors.accent.retro}]`} aria-hidden />
        <span>LATÊNCIA OK</span>
        <span className={`h-1 w-1 rounded-full bg-[${colors.accent.retro}]`} aria-hidden />
        <span>ÚLTIMA SINCRONIZAÇÃO: 2025-11-23 14:03</span>
      </div>

      <SectionHeader
        label="PCM SO · MÓDULO GERAL"
        title="Dashboard"
        actions={
          <span className={`inline-flex items-center gap-2 rounded-full border border-[${colors.border.subtle}] bg-[${colors.background.surface}] px-4 py-2 text-sm font-semibold text-[${colors.text.primary}] shadow-sm`}>
            <span className={`h-2 w-2 rounded-full bg-[${colors.accent.secondary}] animate-pulse`} aria-hidden />
            {selectedEmpresaNome}
          </span>
        }
      />

      <Card className={`relative overflow-hidden bg-[${colors.background.surface}]`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(192,121,84,0.08),transparent_30%),radial-gradient(circle_at_82%_-10%,rgba(15,76,92,0.1),transparent_34%)]" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[rgba(192,121,84,0.35)] to-transparent" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 max-w-3xl">
            <p className={`${typography.label} text-[${colors.text.secondary}]`}>Health tech retrô-chique</p>
            <h3 className={`text-2xl font-semibold text-[${colors.text.primary}] leading-tight`}>Visual premium, minimalista e pronto para narrar saúde ocupacional</h3>
            <p className={`text-sm text-[${colors.text.secondary}] max-w-2xl`}>
              Cards refinados, navegação translúcida e cobre discreto criam uma atmosfera clínica de alto padrão sem comprometer a rotina diária.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full bg-[${colors.background.surfaceMuted}] text-[${colors.accent.primary}] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] border border-[${colors.border.subtle}]`}>Matriz + filiais</span>
              <span className={`rounded-full bg-[${colors.background.surface}] text-[${colors.text.secondary}] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] border border-[${colors.border.subtle}]`}>Monitoramento clínico</span>
              <span className={`rounded-full bg-[${colors.background.surface}] text-[${colors.accent.secondary}] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] border border-[${colors.border.subtle}]`}>Retro-futurista</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 min-w-[260px] w-full lg:w-auto">
            <div className={`rounded-2xl border border-[${colors.border.subtle}] bg-[${colors.background.surface}] p-4 shadow-[0_12px_28px_rgba(12,26,45,0.08)]`}>
              <p className={`${typography.label} text-[${colors.text.secondary}]`}>Selo</p>
              <div className="flex items-center justify-between mt-1">
                <p className={`text-lg font-semibold text-[${colors.text.primary}]`}>Clinical Grade</p>
                <span className={`rounded-full bg-[${colors.accent.primary}] text-white text-[11px] px-3 py-1 uppercase tracking-[0.18em] shadow-[0_10px_24px_rgba(12,59,73,0.25)]`}>
                  HX
                </span>
              </div>
              <p className={`text-sm text-[${colors.text.secondary}] mt-2`}>Narrativa health-tech com contraste premium e feedback imediato.</p>
            </div>
            <div className={`rounded-2xl border border-[${colors.border.subtle}] bg-[${colors.background.surfaceMuted}] p-4 shadow-inner`}>
              <div className={`flex items-center gap-2 text-[${colors.accent.primary}] font-semibold`}>
                <AppIcon name="check" className="h-4 w-4" />
                <span>Estética minimalista com toque retrô</span>
              </div>
              <div className={`flex items-center gap-2 text-[${colors.accent.secondary}] font-semibold mt-2`}>
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
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${typography.label} text-[${colors.text.secondary}]`}>Contratos</p>
              <p className={`font-mono text-3xl text-[${colors.accent.primary}]`}>{stats.totalContratos}</p>
            </div>
            <AppIcon name="document" className={`text-[${colors.text.secondary}] h-5 w-5`} />
          </div>
          <div className={`grid grid-cols-3 gap-3 pt-3 border-t border-[${colors.border.subtle}]`}>
            <div className={`rounded-2xl bg-[${colors.background.surfaceMuted}] p-3 text-center border border-[${colors.border.subtle}]`}>
              <p className={`${typography.label} text-[${colors.status.success}]`}>Em dia</p>
              <p className={`font-mono text-xl text-[${colors.status.success}]`}>{stats.contratosAtivos}</p>
            </div>
            <div className={`rounded-2xl bg-[${colors.background.surface}] p-3 text-center border border-[${colors.border.subtle}]`}>
              <p className={`${typography.label} text-[${colors.status.warning}]`}>Vencendo</p>
              <p className={`font-mono text-xl text-[${colors.status.warning}]`}>{stats.contratosVencendo}</p>
            </div>
            <div className={`rounded-2xl bg-[${colors.background.surface}] p-3 text-center border border-[${colors.border.subtle}]`}>
              <p className={`${typography.label} text-[${colors.status.danger}]`}>Vencidos</p>
              <p className={`font-mono text-xl text-[${colors.status.danger}]`}>{stats.contratosVencidos}</p>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col gap-3">
          <p className={`${typography.label} text-[${colors.text.secondary}]`}>Ações Rápidas</p>
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
