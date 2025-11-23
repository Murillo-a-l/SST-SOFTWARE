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
    <header className="h-20 flex-shrink-0 px-4 lg:px-6 pt-3">
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[#D4DCE6] bg-white/70 backdrop-blur-xl shadow-[0_18px_45px_rgba(12,26,45,0.08)]">
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_10%_20%,rgba(192,121,84,0.12),transparent_35%),radial-gradient(circle_at_82%_-6%,rgba(15,76,92,0.16),transparent_38%)]" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#C07954]/60 to-transparent" />
        <div className="relative flex h-full items-center justify-between px-5">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-3 rounded-2xl border border-[#E3E8F2] bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
              <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-[#0F4C5C] via-[#147D8C] to-[#C07954] p-[2px] shadow-[0_12px_30px_rgba(12,59,73,0.25)]">
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white/90 text-[#0F4C5C]">
                  <AppIcon name="building" className="h-5 w-5" />
                </div>
                <span className="absolute -bottom-1 right-1 rounded-full bg-[#0F4C5C] px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_6px_12px_rgba(12,59,73,0.35)]">
                  hx
                </span>
              </div>
              <div className="leading-tight">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#6B7A92]">Ocupalli</p>
                <p className="text-base font-semibold text-[#0F4C5C]">Painel Clínico</p>
              </div>
              <span className="ml-2 rounded-full border border-[#D9B26D] bg-[#F7F1E3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A5B2F]">
                Clinical grade
              </span>
            </div>

            <div className="group relative flex-1 min-w-[260px] max-w-xl rounded-2xl border border-[#D4DCE6] bg-[#F7F9FC]/90 px-3 py-3 shadow-[0_10px_30px_rgba(12,59,73,0.08)] transition-all duration-200 focus-within:border-[#0F4C5C] focus-within:shadow-[0_14px_40px_rgba(12,59,73,0.16)]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-white/40 to-transparent pointer-events-none" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE3D5] text-[#8A5B2F] shadow-inner">
                  <AppIcon name="building" className="h-5 w-5" />
                </div>
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 right-2 my-auto h-fit px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-[#4B5568] shadow-sm transition-colors duration-150 pointer-events-none group-focus-within:bg-[#0F4C5C] group-focus-within:text-white">
                    Selecionar
                  </span>
                  <CatalystCombobox
                    options={empresaOptions}
                    value={selectedValue}
                    onChange={(value) => {
                      onEmpresaChange(value === 'all' ? null : Number(value));
                    }}
                    placeholder="Selecione a empresa..."
                    className="w-full"
                    inputClassName="bg-transparent border border-[#E3E8F2] py-2.5 pl-3 pr-28 text-sm font-semibold text-[#1F2A3D] placeholder:text-[#6B7A92] focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C] rounded-xl"
                    title={empresaOptions.find((opt) => opt.value === selectedValue)?.label || ''}
                  />
                  <span className="absolute -top-3 left-2 bg-white px-2 text-[11px] uppercase tracking-[0.18em] text-[#6B7A92]">
                    Empresa
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell count={notificationCount} onClick={onOpenNotifications} />
            <div className="flex items-center gap-3 rounded-full border border-[#E3E8F2] bg-white/80 px-4 py-1.5 shadow-[0_10px_24px_rgba(12,59,73,0.08)]">
              <span className="text-sm text-[#1F2A3D]">
                Olá, <span className="font-semibold text-[#0F4C5C]">{user?.nome || 'Usuário'}</span>
              </span>
              <button
                onClick={onLogout}
                title="Sair"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F9FC] text-[#6B7A92] transition-all duration-150 hover:-translate-y-[1px] hover:bg-[#0F4C5C] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/30"
              >
                <AppIcon name="logout" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
