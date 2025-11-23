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
    <header className="h-16 flex-shrink-0 px-4 lg:px-6 border-b border-[${colors.border.subtle}] bg-[${colors.background.surface}] shadow-[0_6px_18px_rgba(12,26,45,0.04)]">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-3 rounded-2xl border border-[${colors.border.subtle}] bg-[${colors.background.surfaceMuted}] px-3 py-2 shadow-[0_4px_12px_rgba(12,26,45,0.06)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[${colors.accent.primary}] text-white shadow-inner">
              <AppIcon name="building" className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className={`${typography.mono} text-[${colors.accent.secondary}]`}>OCUPALLI</p>
              <p className={`${typography.subtitle} text-[${colors.text.primary}]`}>Painel Clínico</p>
            </div>
          </div>

          <div className="group relative flex-1 min-w-[260px] max-w-xl rounded-2xl border border-[${colors.border.subtle}] bg-[${colors.background.surface}] px-3 py-2 shadow-[0_10px_24px_rgba(12,26,45,0.06)] focus-within:border-[${colors.accent.primary}]">
            <div className="relative flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[${colors.background.surfaceMuted}] text-[${colors.accent.primary}]">
                <AppIcon name="building" className="h-4 w-4" />
              </div>
              <div className="relative flex-1">
                <span className={`${typography.mono} absolute -top-3 left-2 bg-[${colors.background.surface}] px-2 text-[${colors.accent.secondary}]`}>EMPRESA</span>
                <CatalystCombobox
                  options={empresaOptions}
                  value={selectedValue}
                  onChange={(value) => {
                    onEmpresaChange(value === 'all' ? null : Number(value));
                  }}
                  placeholder="Selecione a empresa..."
                  className="w-full"
                  inputClassName={`bg-transparent border border-[${colors.border.subtle}] py-2.5 pl-3 pr-24 text-sm font-semibold text-[${colors.text.primary}] placeholder:text-[${colors.text.secondary}] focus:ring-2 focus:ring-[${colors.accent.primary}]/20 focus:border-[${colors.accent.primary}] rounded-xl`}
                  title={empresaOptions.find((opt) => opt.value === selectedValue)?.label || ''}
                />
                <span className="absolute inset-y-0 right-2 my-auto h-fit px-3 py-1 rounded-full text-[11px] font-semibold bg-[${colors.background.surfaceMuted}] text-[${colors.text.secondary}] shadow-sm">
                  Selecionar
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-[${colors.border.subtle}] bg-[${colors.background.surfaceMuted}] text-[${colors.text.secondary}]">
            <span className={typography.mono}>SYS · OK</span>
            <span className="h-2 w-2 rounded-full bg-[${colors.accent.retro}]" />
          </div>
          <NotificationBell count={notificationCount} onClick={onOpenNotifications} />
          <div className="flex items-center gap-3 rounded-full border border-[${colors.border.subtle}] bg-[${colors.background.surface}] px-4 py-1.5 shadow-[0_8px_20px_rgba(12,26,45,0.06)]">
            <span className="text-sm text-[${colors.text.secondary}]">
              Olá, <span className="font-semibold text-[${colors.text.primary}]">{user?.nome || 'Usuário'}</span>
            </span>
            <button
              onClick={onLogout}
              title="Sair"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[${colors.background.surfaceMuted}] text-[${colors.text.secondary}] transition-all duration-150 hover:-translate-y-[1px] hover:bg-[${colors.accent.primary}] hover:text-white focus:outline-none focus:ring-2 focus:ring-[${colors.accent.primary}]/30"
            >
              <AppIcon name="logout" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
