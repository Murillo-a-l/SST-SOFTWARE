import React from 'react';
import { NotificationBell } from './NotificationBell';
import { Empresa, User } from '../types';
import { AppIcon } from '../src/components/ui/AppIcon';
import { CatalystCombobox } from './ui/CatalystCombobox';
import { colors, typography } from '../src/styles/tokens';

interface HeaderProps {
  onOpenNotifications: () => void;
  notificationCount: number;
  empresas: Empresa[];
  selectedEmpresaId: number | null;
  onEmpresaChange: (id: number | null) => void;
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  notificationCount,
  empresas,
  selectedEmpresaId,
  onEmpresaChange,
  user,
  onLogout,
}) => {
  const empresaOptions = React.useMemo(() => {
    const matrices = (empresas || []).filter((e) => !e.matrizId);
    const filiais = (empresas || []).filter((e) => e.matrizId);

    const result: { value: string | number; label: string }[] = [
      { value: 'all', label: 'Visao Geral (todas as empresas)' },
    ];

    matrices
      .sort((a, b) => a.nomeFantasia.localeCompare(b.nomeFantasia))
      .forEach((matriz) => {
        result.push({ value: matriz.id, label: matriz.nomeFantasia });
        filiais
          .filter((f) => f.matrizId === matriz.id)
          .sort((a, b) => a.nomeFantasia.localeCompare(b.nomeFantasia))
          .forEach((filial) => {
            result.push({ value: filial.id, label: `-> ${filial.nomeFantasia}` });
          });
      });

    return result;
  }, [empresas]);

  const selectedValue = selectedEmpresaId === null ? 'all' : selectedEmpresaId;

  return (
    <header
      className="h-16 flex-shrink-0"
      style={{ backgroundColor: colors.background.surface, borderBottom: `1px solid ${colors.border.subtle}` }}
    >
      <div className="h-full w-full max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: colors.accent.primary, color: '#fff' }}
          >
            <AppIcon name="dashboard" className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p
              className="text-[11px] uppercase tracking-[0.18em]"
              style={{ fontFamily: typography.fontMono, color: colors.accent.secondary }}
            >
              OCUPALLI // v2.1
            </p>
            <p className="text-sm font-semibold" style={{ color: colors.text.primary }}>
              Console clinico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div
            className="flex-1 rounded-xl px-3 py-2 flex items-center gap-3"
            style={{
              backgroundColor: colors.background.surfaceMuted,
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            <span
              className="text-[11px] uppercase tracking-[0.18em] px-2 py-1 rounded-md"
              style={{ fontFamily: typography.fontMono, color: colors.accent.retro, backgroundColor: colors.background.surface }}
            >
              Empresa
            </span>
            <CatalystCombobox
              options={empresaOptions}
              value={selectedValue}
              onChange={(value) => {
                onEmpresaChange(value === 'all' ? null : Number(value));
              }}
              placeholder="Selecione a empresa..."
              className="w-full"
              inputClassName="border-none bg-transparent py-1.5 pl-2 pr-8 text-sm font-semibold text-[#111827] placeholder:text-[#6B7280] focus:ring-0 focus:border-0"
              title={empresaOptions.find((opt) => opt.value === selectedValue)?.label || ''}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell count={notificationCount} onClick={onOpenNotifications} />
          <div
            className="flex items-center gap-3 rounded-full px-3 py-1.5"
            style={{
              backgroundColor: colors.background.surfaceMuted,
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            <span className="text-sm" style={{ color: colors.text.primary }}>
              Ola, <span className="font-semibold" style={{ color: colors.accent.primary }}>{user?.nome || 'Usuario'}</span>
            </span>
            <button
              onClick={onLogout}
              title="Sair"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150"
              style={{ backgroundColor: colors.background.surface, color: colors.text.secondary, border: `1px solid ${colors.border.subtle}` }}
            >
              <AppIcon name="logout" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
