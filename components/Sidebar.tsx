// @ts-nocheck
import React from 'react';
import type { View } from '../types';
import { AppIcon } from '../src/components/ui/AppIcon';
import { colors, shadows, typography } from '../src/styles/tokens';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

interface SidebarItemProps {
  iconName: React.ComponentProps<typeof AppIcon>['name'];
  label: string;
  view: View;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: (view: View) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ iconName, label, view, isActive, isCollapsed, onClick }) => {
  return (
    <li>
      <button
        onClick={() => onClick(view)}
        className={`group flex items-center w-full text-left px-3 py-2 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-[#0F4C5C] via-[#147D8C] to-[#0F4C5C] text-white shadow-[0_12px_30px_rgba(12,59,73,0.22)] border border-transparent'
            : 'border border-transparent text-[#1F2A3D] hover:border-[#E3E8F2] hover:bg-white/80 hover:shadow-[0_10px_24px_rgba(12,26,45,0.08)]'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
        title={isCollapsed ? label : ''}
      >
        <AppIcon name={iconName} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#6B7A92]'}`} />
        {!isCollapsed && <span className="ml-3 whitespace-nowrap text-sm font-semibold tracking-wide">{label}</span>}
      </button>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, onToggle }) => {
  const navItems: { view: View; label: string; icon: React.ComponentProps<typeof AppIcon>['name'] }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { view: 'empresas', label: 'Empresas', icon: 'building' },
    { view: 'funcionarios', label: 'Funcionarios', icon: 'users' },
    { view: 'financeiro', label: 'Financeiro', icon: 'finance' },
    { view: 'pcmso', label: 'PCMSO', icon: 'clipboard' },
    { view: 'relatorios', label: 'Relatorios', icon: 'reports' },
    { view: 'configuracoes', label: 'Configuracoes', icon: 'settings' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white/80 backdrop-blur-xl border-r border-[#D4DCE6] flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out shadow-[0_24px_70px_rgba(12,26,45,0.12)] ${
        isCollapsed ? 'w-20 px-3' : 'w-64 px-4'
      }`}
    >
      <div
        className={`flex items-center h-20 border-b border-[#E3E8F2] ${isCollapsed ? 'justify-center' : 'justify-between'} py-5 mb-5`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F4C5C] via-[#147D8C] to-[#C07954] text-white shadow-[0_14px_32px_rgba(12,59,73,0.35)]">
            <AppIcon name="dashboard" className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-[#0F4C5C]">Ocupalli</p>
              <p className="text-xs uppercase tracking-[0.18em] text-[#6B7A92]">Edição premium</p>
            </div>
          )}
        </div>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <SidebarItem
              key={item.view}
              iconName={item.icon}
              label={item.label}
              view={item.view}
              isActive={activeView === item.view}
              isCollapsed={isCollapsed}
              onClick={setActiveView}
            />
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-[#E3E8F2]">
        <button
          onClick={onToggle}
          className={`flex items-center w-full px-3 py-2 rounded-full border border-[#E3E8F2] bg-white/90 text-[#1F2A3D] hover:bg-[#F7F9FC] hover:-translate-y-[1px] transition-all duration-200 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {!isCollapsed && <span className="text-sm font-semibold">{isCollapsed ? 'Expandir' : 'Recolher'} menu</span>}
          <span className="w-5 h-5 text-[#6B7A92]">
            {isCollapsed ? <AppIcon name="chevron-right" /> : <AppIcon name="chevron-left" />}
          </span>
        </button>
      </div>
    </aside>
  );
};
