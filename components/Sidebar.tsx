// @ts-nocheck
import React from 'react';
import type { View } from '../types';
import { AppIcon } from '../src/components/ui/AppIcon';

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
            ? 'bg-[#E8ECF0] border-l-4 border-[#3A6EA5] text-[#2F5C8C] font-semibold shadow-sm'
            : 'text-slate-700 hover:bg-[#F1F3F5] hover:text-slate-900'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
        title={isCollapsed ? label : ''}
      >
        <AppIcon name={iconName} className={`w-5 h-5 ${isActive ? 'text-[#2F5C8C]' : 'text-[#6A7381]'}`} />
        {!isCollapsed && <span className="ml-3 whitespace-nowrap text-sm font-medium">{label}</span>}
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
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-[#D5D8DC] flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20 px-3' : 'w-60 px-4'}`}>
      <div className={`flex items-center h-16 border-b border-[#E0E3E7] ${isCollapsed ? 'justify-center' : 'justify-between'} py-4 mb-4`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
          <AppIcon name="dashboard" className="h-6 w-6 text-[#2F5C8C]" />
          {!isCollapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-800">Saude Ocupacional</p>
              <p className="text-xs text-slate-500">Painel Clinico</p>
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
      <div className="mt-auto pt-4 border-t border-[#E0E3E7]">
        <button
          onClick={onToggle}
          className={`flex items-center w-full px-3 py-2 rounded-full border border-[#D5D8DC] bg-white text-slate-600 hover:bg-[#F1F3F5] transition-colors duration-200 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {!isCollapsed && <span className="text-sm font-medium">{isCollapsed ? 'Expandir' : 'Recolher'} menu</span>}
          <span className="w-5 h-5 text-[#6A7381]">
            {isCollapsed ? <AppIcon name="chevron-right" /> : <AppIcon name="chevron-left" />}
          </span>
        </button>
      </div>
    </aside>
  );
};
