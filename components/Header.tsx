import React from 'react';
import { NotificationBell } from './NotificationBell';
import { Empresa, User } from '../types';
import { AppIcon } from '../src/components/ui/AppIcon';
import { CatalystCombobox } from './ui/CatalystCombobox';

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
    <header className="h-16 bg-white border-b border-[#D5D8DC] flex-shrink-0">
      <div className="w-full h-full px-6">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3 flex-1">
            <div className="group flex items-center gap-3 flex-1 min-w-[280px] max-w-md rounded-xl bg-white border border-[#E0E3E7] px-3 py-2 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0F2F5] border border-[#D5D8DC] text-[#2F5C8C]">
                <AppIcon name="building" className="h-5 w-5" />
              </div>
              <div className="relative flex-1">
                <span className="absolute inset-y-0 right-2 my-auto h-fit px-2 py-1 rounded-full text-[11px] font-semibold bg-[#E8ECF0] text-[#2F343A] transition-colors duration-150 pointer-events-none group-focus-within:bg-[#2F5C8C] group-focus-within:text-white">
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
                  inputClassName="bg-[#F4F6F8] border border-[#D5D8DC] py-2 pl-3 pr-24 text-sm font-semibold text-[#2F343A] placeholder:text-[#7B8EA3] focus:ring-2 focus:ring-[#3A6EA5]/30 focus:border-[#3A6EA5] rounded-lg"
                  title={empresaOptions.find((opt) => opt.value === selectedValue)?.label || ''}
                />
                <span className="absolute -top-2 left-2 bg-white px-2 text-[11px] uppercase tracking-[0.18em] text-[#7B8EA3]">
                  Empresa
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell count={notificationCount} onClick={onOpenNotifications} />
            <div className="flex items-center gap-3 rounded-full bg-[#F4F6F8] border border-[#D5D8DC] px-3 py-1.5">
              <span className="text-sm text-slate-700">
                Ola, <span className="font-semibold">{user?.nome || 'Usuario'}</span>
              </span>
              <button
                onClick={onLogout}
                title="Sair"
                className="p-1.5 text-[#7B8EA3] hover:text-[#D97777] rounded-full hover:bg-[#FDECEC] focus:outline-none transition-colors"
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
