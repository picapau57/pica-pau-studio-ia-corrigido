import React from 'react';
import { 
  Sparkles, 
  Coins, 
  PlusCircle, 
  Shield, 
  User as UserIcon, 
  Building2, 
  Zap, 
  AlertTriangle, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    systemConfig, 
    setActiveTab, 
    selectedBrand, 
    setSelectedBrand, 
    switchUserRole,
    toasts,
    removeToast 
  } = useApp();

  return (
    <>
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-3 ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-100'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-100'
                : 'bg-slate-900/90 border-blue-500/50 text-slate-100'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs p-1 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Main Top Header */}
      <header className="h-16 bg-slate-950/95 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
              <span className="text-slate-950 font-black text-lg tracking-tighter">PP</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white tracking-tight text-base group-hover:text-amber-400 transition-colors">
                  Pica-Pau
                </span>
                <span className="text-amber-400 font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                  Studio IA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5">Produção Criativa Profissional</p>
            </div>
          </div>

          {/* OpenAI Status Pill */}
          <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-800">
            {systemConfig?.openaiApiKeyConfigured ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>OpenAI DALL-E 3 Conectado</span>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('admin')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs transition-colors"
                title="Motor Criativo Pica-Pau Ativo. Clique para configurar chave OpenAI no Painel Admin se desejar."
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Motor Criativo Ativo</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Credits, Actions & User */}
        <div className="flex items-center gap-3">
          {/* Active Brand Kit Indicator */}
          {selectedBrand && (
            <div 
              onClick={() => setActiveTab('brands')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700/60 rounded-lg text-xs text-slate-300 hover:border-amber-400/50 cursor-pointer transition-colors"
              title="Marca ativa para criação de artes"
            >
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: selectedBrand.primaryColor || '#f59e0b' }}
              />
              <span className="font-medium max-w-[120px] truncate">{selectedBrand.name}</span>
            </div>
          )}

          {/* Credits Widget with Atomic Counter */}
          <div 
            onClick={() => setActiveTab('credits')}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-850 hover:to-slate-800 border border-amber-500/30 px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-inner group"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block leading-none">
                Créditos
              </span>
              <span className="text-sm font-bold text-amber-400 leading-tight">
                {currentUser?.credits ?? 0}
              </span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('credits');
              }}
              className="ml-1 text-slate-400 hover:text-amber-400 p-0.5"
              title="Recarregar Créditos"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Role switcher button (Admin vs Client user demo) */}
          <button
            onClick={switchUserRole}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              currentUser?.role === 'admin'
                ? 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20'
            }`}
            title="Alternar entre Administrador e Usuário Comum para testar permissões"
          >
            {currentUser?.role === 'admin' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>Admin</span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Usuário</span>
              </>
            )}
          </button>

          {/* Profile Badge */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 pl-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-semibold text-xs overflow-hidden group-hover:border-amber-400 transition-colors">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser?.name?.substring(0, 2).toUpperCase() || 'PP'}</span>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
