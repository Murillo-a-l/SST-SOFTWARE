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
            ? `bg-[${colors.background.surface}] text-[${colors.accent.primary}] border border-[${colors.accent.primary}] shadow-[${shadows.soft}]`
            : `text-[${colors.text.secondary}] border border-transparent hover:border-[${colors.border.subtle}] hover:bg-[${colors.background.surfaceMuted}]`
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
        title={isCollapsed ? label : ''}
      >
        <AppIcon name={iconName} className={`w-5 h-5 ${isActive ? `text-[${colors.accent.primary}]` : `text-[${colors.text.muted}]`}`} />
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
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[${colors.accent.primary}] via-[${colors.accent.primary}] to-[${colors.accent.primary}]/85 text-white/90 backdrop-blur-xl flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out shadow-[${shadows.elevated}] ${
        isCollapsed ? 'w-[72px] px-3' : 'w-60 px-4'
      }`}
    >
      <div
        className={`flex items-center h-20 border-b border-white/15 ${isCollapsed ? 'justify-center' : 'justify-between'} py-5 mb-5`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20">
            <AppIcon name="dashboard" className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold">Ocupalli</p>
              <p className={`${typography.mono} text-[${colors.accent.retro}]`}>system</p>
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
      <div className="mt-auto pt-4 border-t border-white/15">
        <button
          onClick={onToggle}
          className={`flex items-center w-full px-3 py-2 rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {!isCollapsed && <span className="text-sm font-semibold">{isCollapsed ? 'Expandir' : 'Recolher'} menu</span>}
          <span className="w-5 h-5">
            {isCollapsed ? <AppIcon name="chevron-right" /> : <AppIcon name="chevron-left" />}
          </span>
        </button>
      </div>
    </aside>
  );
};
