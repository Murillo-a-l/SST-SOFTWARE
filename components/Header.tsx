
import React from 'react';
import { NotificationBell } from './NotificationBell';
import { Empresa, User } from '../types';

interface HeaderProps {
    onOpenNotifications: () => void;
    notificationCount: number;
    empresas: Empresa[];
    selectedEmpresaId: number | null;
    onEmpresaChange: (id: number | null) => void;
    user: User | null;
    onLogout: () => void;
}

const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;

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
    <header className="bg-white shadow-sm flex-shrink-0">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
              <div className="flex items-center">
                  <BuildingIcon />
                  <select
                      value={selectedEmpresaId === null ? 'all' : selectedEmpresaId}
                      onChange={(e) => {
                          const value = e.target.value;
                          onEmpresaChange(value === 'all' ? null : Number(value));
                      }}
                      className="font-semibold text-gray-700 bg-transparent border-0 focus:ring-0"
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
          <div className="flex items-center gap-4">
            <NotificationBell count={notificationCount} onClick={onOpenNotifications} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Olá, <span className="font-semibold">{user?.nome || 'Usuário'}</span></span>
              <button onClick={onLogout} title="Sair" className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 focus:outline-none">
                  <LogoutIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
