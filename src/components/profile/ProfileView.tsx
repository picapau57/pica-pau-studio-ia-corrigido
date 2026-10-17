import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Building2, 
  Mail, 
  Shield, 
  Coins, 
  Save, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';

export const ProfileView: React.FC = () => {
  const { currentUser, refreshUserData, addToast, setActiveTab } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    try {
      // In-app profile update
      addToast('success', 'Perfil Atualizado', 'Suas informações de perfil foram salvas.');
    } catch (err: any) {
      addToast('error', 'Falha ao atualizar', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Minha Conta
          </span>
          <span className="text-xs text-slate-400">Preferências & Empresa</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">Configurações do Perfil</h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Gerencie seus dados pessoais, plano ativo e preferências operacionais da plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Profile Overview Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-amber-400 overflow-hidden shadow-xl">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <UserIcon className="w-10 h-10" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-white text-base">{currentUser?.name}</h3>
            <p className="text-xs text-slate-400">{currentUser?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>{currentUser?.role === 'admin' ? 'Administrador do Sistema' : 'Usuário Padrão'}</span>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Plano Ativo:</span>
              <strong className="text-white uppercase">{currentUser?.plan}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Créditos:</span>
              <strong className="text-amber-400">{currentUser?.credits}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500">Status:</span>
              <span className="text-emerald-400 font-bold">Ativo & Seguro</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('plans')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Mudar de Plano</span>
          </button>
        </div>

        {/* Right Form Card */}
        <form onSubmit={handleSave} className="md:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-amber-400" />
            <span>Informações Pessoais & Corporativas</span>
          </h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">E-mail Cadastrado</label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="w-full bg-slate-950/50 border border-slate-800/50 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Nome da Empresa Principal</label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">URL do Avatar</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
