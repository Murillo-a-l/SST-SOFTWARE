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
          isCollapsed ? 'justify-center px-2' : ''
        }`}
        style={{
          background: isActive ? 'rgba(192, 121, 84, 0.18)' : 'transparent',
          color: isActive ? colors.accent.secondary : colors.text.primary,
          border: `1px solid ${isActive ? 'rgba(192, 121, 84, 0.35)' : colors.border.subtle}`,
          boxShadow: isActive ? '0 8px 20px rgba(192, 121, 84, 0.12)' : 'none',
          backdropFilter: isActive ? 'blur(10px)' : undefined,
        }}
        title={isCollapsed ? label : ''}
      >
        <AppIcon
          name={iconName}
          className="w-5 h-5"
          style={{ color: isActive ? colors.accent.secondary : colors.text.secondary }}
        />
        {!isCollapsed && (
          <span
            className="ml-3 whitespace-nowrap text-sm font-semibold tracking-wide"
            style={{ color: isActive ? colors.accent.secondary : colors.text.primary }}
          >
            {label}
          </span>
        )}
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
      className={`fixed top-0 left-0 h-screen flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[72px] px-2.5' : 'w-60 px-4'
      }`}
      style={{
        background: 'linear-gradient(135deg, #F7F9FC 0%, #FFFFFF 50%, #EDE3D5 100%)',
        borderRight: `1px solid ${colors.border.subtle}`,
        boxShadow: shadows.soft,
      }}
    >
      <div
        className={`flex items-center h-20 ${isCollapsed ? 'justify-center' : 'justify-between'} py-5 mb-5`}
        style={{ borderBottom: `1px solid ${colors.border.subtle}` }}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
            style={{
              background: `linear-gradient(135deg, ${colors.accent.primary} 0%, ${colors.accent.secondary} 100%)`,
              boxShadow: shadows.elevated,
            }}
          >
            <AppIcon name="dashboard" className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold" style={{ color: colors.accent.primary }}>OCUPALLI</p>
              <p
                className="text-xs uppercase tracking-[0.18em]"
                style={{ color: colors.text.secondary, fontFamily: typography.fontMono }}
              >
                Sistema ocupacional
              </p>
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
      <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
        <button
          onClick={onToggle}
          className={`flex items-center w-full px-3 py-2 rounded-full transition-all duration-200 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          style={{
            backgroundColor: colors.background.surface,
            color: colors.text.primary,
            border: `1px solid ${colors.border.subtle}`,
            boxShadow: shadows.soft,
          }}
        >
          {!isCollapsed && <span className="text-sm font-semibold">{isCollapsed ? 'Expandir' : 'Recolher'} menu</span>}
          <span className="w-5 h-5" style={{ color: colors.text.muted }}>
            {isCollapsed ? <AppIcon name="chevron-right" /> : <AppIcon name="chevron-left" />}
          </span>
        </button>
      </div>
    </aside>
  );
};
