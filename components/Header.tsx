
import React from 'react';
import { NotificationBell } from './NotificationBell';
import { Empresa, User } from '../types';
import { AppIcon } from '../src/components/ui/AppIcon';

interface HeaderProps {
    onOpenNotifications: () => void;
    notificationCount: number;
    empresas: Empresa[];
    selectedEmpresaId: number | null;
    onEmpresaChange: (id: number | null) => void;
    user: User | null;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, notificationCount, empresas, selectedEmpresaId, onEmpresaChange, user, onLogout }) => {
  const sortedEmpresas = React.useMemo(() => {
    const matrices = (empresas || []).filter(e => !e.matrizId);
    const filiais = (empresas || []).filter(e => e.matrizId);
    
    const result: {id: number, name: string, isFilial: boolean}[] = [];

    matrices.sort((a,b) => a.nomeFantasia.localeCompare(b.nomeFantasia)).forEach(matriz => {
      result.push({ id: matriz.id, name: matriz.nomeFantasia, isFilial: false });
      filiais
        .filter(f => f.matrizId === matriz.id)
        .sort((a,b) => a.nomeFantasia.localeCompare(b.nomeFantasia))
        .forEach(filial => {
          result.push({ id: filial.id, name: filial.nomeFantasia, isFilial: true });
        });
    });

    return result;
  }, [empresas]);

  return (
    <header className="h-16 bg-white border-b border-[#D5D8DC] flex-shrink-0">
      <div className="w-full max-w-7xl mx-auto h-full px-6">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-[#F4F6F8] border border-[#D5D8DC] px-3 py-2 shadow-sm">
              <AppIcon name="building" className="h-5 w-5 text-[#6A7381]" />
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#7B8EA3]">Contexto</span>
                <select
                  value={selectedEmpresaId === null ? 'all' : selectedEmpresaId}
                  onChange={(e) => {
                    const value = e.target.value;
                    onEmpresaChange(value === 'all' ? null : Number(value));
                  }}
                  className="text-sm font-semibold text-slate-800 bg-transparent border-0 focus:ring-0 focus:outline-none"
                  aria-label="Selecionar Contexto da Empresa"
                >
                  <option value="all">Visão Geral (Todas as Empresas)</option>
                  {sortedEmpresas.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.isFilial ? `↳ ${e.name}` : e.name}
                    </option>
                  ))}
                </select>
    <header className="bg-white border-b border-[#D5D8DC] flex-shrink-0">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F4F6F8] border border-[#D5D8DC]">
                  <BuildingIcon />
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-[#7B8EA3]">Contexto</span>
                    <select
                        value={selectedEmpresaId === null ? 'all' : selectedEmpresaId}
                        onChange={(e) => {
                            const value = e.target.value;
                            onEmpresaChange(value === 'all' ? null : Number(value));
                        }}
                        className="text-sm font-semibold text-slate-800 bg-transparent border-0 focus:ring-0 focus:outline-none"
                        aria-label="Selecionar Contexto da Empresa"
                    >
                        <option value="all">Visão Geral (Todas as Empresas)</option>
                        {sortedEmpresas.map(e => (
                          <option key={e.id} value={e.id}>
                            {e.isFilial ? `↳ ${e.name}` : e.name}
                          </option>
                        ))}
                    </select>
                  </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell count={notificationCount} onClick={onOpenNotifications} />
            <div className="flex items-center gap-3 rounded-full bg-[#F4F6F8] border border-[#D5D8DC] px-3 py-1.5">
              <span className="text-sm text-slate-700">Olá, <span className="font-semibold">{user?.nome || 'Usuário'}</span></span>
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
