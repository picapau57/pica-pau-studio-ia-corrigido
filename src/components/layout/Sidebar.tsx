import React from 'react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Video, 
  Megaphone, 
  Palette, 
  FolderKanban, 
  Briefcase, 
  Receipt, 
  ShieldAlert, 
  CreditCard, 
  Settings, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab, currentUser } = useApp();

  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    group: 'create' | 'manage' | 'system';
    badge?: string;
    adminOnly?: boolean;
  }> = [
    // Dashboard
    { id: 'dashboard', label: 'Painel Principal', icon: LayoutDashboard, group: 'manage' },
    
    // Creation modules
    { id: 'image-studio', label: 'Estúdio de Imagens', icon: ImageIcon, group: 'create', badge: 'DALL-E 3' },
    { id: 'video-studio', label: 'Estúdio de Vídeos', icon: Video, group: 'create' },
    { id: 'ad-campaign', label: 'Gerador de Anúncios', icon: Megaphone, group: 'create', badge: 'IA Copy' },
    { id: 'visual-editor', label: 'Editor Visual', icon: Palette, group: 'create' },

    // Management modules
    { id: 'library', label: 'Biblioteca de Projetos', icon: FolderKanban, group: 'manage' },
    { id: 'brands', label: 'Marcas & Clientes', icon: Briefcase, group: 'manage' },
    { id: 'credits', label: 'Gestão de Créditos', icon: Receipt, group: 'manage' },

    // System modules
    { id: 'plans', label: 'Planos & Assinaturas', icon: CreditCard, group: 'system' },
    { id: 'admin', label: 'Painel Administrativo', icon: ShieldAlert, group: 'system', adminOnly: true },
    { id: 'profile', label: 'Configurações do Perfil', icon: Settings, group: 'system' },
    { id: 'institutional', label: 'Apresentação / Landing', icon: Globe, group: 'system' }
  ];

  const handleSelect = (tab: NavigationTab) => {
    setActiveTab(tab);
  };

  return (
    <aside
      className={`h-[calc(100vh-4rem)] bg-slate-950 border-r border-slate-800/80 transition-all duration-300 flex flex-col justify-between shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="py-4 px-2.5 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Creation Group */}
        <div>
          {!collapsed && (
            <p className="px-2.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Criação & Inteligência
            </p>
          )}
          <div className="space-y-1">
            {navItems
              .filter(item => item.group === 'create')
              .map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all relative ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-950/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    {!collapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Management Group */}
        <div>
          {!collapsed && (
            <p className="px-2.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Gestão & Ativos
            </p>
          )}
          <div className="space-y-1">
            {navItems
              .filter(item => item.group === 'manage')
              .map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-blue-400 border border-blue-500/30 shadow-md font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                  </button>
                );
              })}
          </div>
        </div>

        {/* System & Settings Group */}
        <div>
          {!collapsed && (
            <p className="px-2.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Administração & Conta
            </p>
          )}
          <div className="space-y-1">
            {navItems
              .filter(item => item.group === 'system')
              .filter(item => !item.adminOnly || currentUser?.role === 'admin')
              .map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/80 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span className="font-semibold text-slate-300">Pica-Pau IA v2.5</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors mx-auto"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
