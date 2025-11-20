import React from 'react';
import type { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  view: View;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: (view: View) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, view, isActive, isCollapsed, onClick }) => {
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
        <span className={`w-6 h-6 ${isActive ? 'text-[#2F5C8C]' : 'text-[#6A7381]'}`}>{icon}</span>
        {!isCollapsed && <span className="ml-3 whitespace-nowrap text-sm font-medium">{label}</span>}
      </button>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, onToggle }) => {
  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { view: 'empresas', label: 'Empresas', icon: <BuildingOfficeIcon /> },
    { view: 'funcionarios', label: 'Funcionários', icon: <UsersIcon /> },
    { view: 'financeiro', label: 'Financeiro', icon: <CurrencyDollarIcon /> },
    { view: 'pcmso', label: 'PCMSO', icon: <ClipboardIcon /> },
    { view: 'relatorios', label: 'Relatórios', icon: <DocumentReportIcon /> },
    { view: 'configuracoes', label: 'Configurações', icon: <CogIcon /> },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-white border-r border-[#D5D8DC] flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20 px-3' : 'w-60 px-4'}`}>
      <div className={`flex items-center h-16 border-b border-[#E0E3E7] ${isCollapsed ? 'justify-center' : 'justify-between'} py-4 mb-4`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
          <span className="text-2xl font-bold text-[#2F5C8C]">🩺</span>
          {!isCollapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-800">Saúde Ocupacional</p>
              <p className="text-xs text-slate-500">Painel Clínico</p>
            </div>
          )}
        </div>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <SidebarItem
              key={item.view}
              icon={item.icon}
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
            className={`flex items-center w-full px-3 py-2 rounded-full border border-[#D5D8DC] bg-white text-slate-600 hover:bg-[#F1F3F5] transition-colors duration-200 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
         >
            {!isCollapsed && <span className="text-sm font-medium">{isCollapsed ? 'Expandir' : 'Recolher'} menu</span>}
            <span className="w-5 h-5 text-[#6A7381]">
                {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </span>
         </button>
      </div>
    </aside>
  );
};

// SVG Icons (Heroicons)
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const DocumentReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const BuildingOfficeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a.375.375 0 01.375.375v1.5a.375.375 0 01-.375.375H9a.375.375 0 01-.375-.375v-1.5A.375.375 0 019 6.75zM9 12.75h6.375a.375.375 0 01.375.375v1.5a.375.375 0 01-.375.375H9a.375.375 0 01-.375-.375v-1.5A.375.375 0 019 12.75z" /></svg>;
const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
