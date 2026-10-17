import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Key, 
  Users, 
  Coins, 
  DollarSign, 
  Activity, 
  Save, 
  Lock, 
  Unlock, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertTriangle,
  Sliders,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { User, CreditTransaction, SystemConfig } from '../../types';

export const AdminPanelView: React.FC = () => {
  const { currentUser, refreshUserData, addToast, setActiveTab } = useApp();

  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Form keys
  const [openAiKeyInput, setOpenAiKeyInput] = useState('');
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string; advice?: string } | null>(null);

  const handleTestOpenAiKey = async () => {
    if (!currentUser) return;
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await ApiService.testOpenAiKey(currentUser.id, openAiKeyInput.trim() || undefined);
      setTestResult(res);
      if (res.valid) {
        addToast('success', 'Chave Válida!', res.message);
      } else {
        addToast('warning', 'Atenção na Chave', res.message);
      }
    } catch (err: any) {
      setTestResult({
        valid: false,
        message: err.message || 'Falha ao testar chave.'
      });
    } finally {
      setTestingKey(false);
    }
  };

  // Credit cost configs
  const [dalleStandardCost, setDalleStandardCost] = useState(8);
  const [dalleHdCost, setDalleHdCost] = useState(15);
  const [copyCost, setCopyCost] = useState(1);
  const [videoCost, setVideoCost] = useState(20);

  // Credit adjustment modal
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<User | null>(null);
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState<number>(50);
  const [adjustmentReason, setAdjustmentReason] = useState('Bônus promocional');

  const loadAdminData = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const data = await ApiService.getAdminOverview(currentUser.id);
      setMetrics(data.metrics);
      setUsers(data.users || []);
      setTransactions(data.recentTransactions || []);
      setConfig(data.config);

      setDalleStandardCost(data.config.dalle3StandardCreditCost);
      setDalleHdCost(data.config.dalle3HdCreditCost);
      setCopyCost(data.config.copywritingCreditCost);
      setVideoCost(data.config.videoSceneCreditCost);
    } catch (err: any) {
      addToast('error', 'Acesso Negado', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [currentUser]);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Acesso Exclusivo para Administrador</h2>
        <p className="text-xs text-slate-400">
          Você está conectado como usuário comum. Utilize o botão "Admin" no topo da página para alternar o perfil de testes.
        </p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
        >
          Voltar ao Painel
        </button>
      </div>
    );
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await ApiService.updateAdminConfig(
        currentUser.id,
        {
          dalle3StandardCreditCost: Number(dalleStandardCost),
          dalle3HdCreditCost: Number(dalleHdCost),
          copywritingCreditCost: Number(copyCost),
          videoSceneCreditCost: Number(videoCost)
        },
        openAiKeyInput ? openAiKeyInput : undefined,
        geminiKeyInput ? geminiKeyInput : undefined
      );

      addToast('success', 'Configurações Salvas', 'As chaves e tabelas de crédito foram atualizadas com segurança.');
      setOpenAiKeyInput('');
      setGeminiKeyInput('');
      await loadAdminData();
      await refreshUserData();
    } catch (err: any) {
      addToast('error', 'Falha ao salvar', err.message);
    }
  };

  const handleToggleUserStatus = async (targetUser: User) => {
    if (!currentUser) return;
    try {
      await ApiService.toggleUserStatus(currentUser.id, targetUser.id);
      addToast('info', 'Status Atualizado', `A conta de ${targetUser.name} foi ${targetUser.active ? 'bloqueada' : 'ativada'}.`);
      loadAdminData();
    } catch (err: any) {
      addToast('error', 'Erro', err.message);
    }
  };

  const handleApplyCreditAdjustment = async () => {
    if (!currentUser || !selectedUserForCredit) return;
    try {
      await ApiService.adjustUserCredits(
        currentUser.id,
        selectedUserForCredit.id,
        Number(creditAdjustmentAmount),
        adjustmentReason
      );

      addToast('success', 'Créditos Ajustados', `Ajuste de ${creditAdjustmentAmount} créditos aplicado para ${selectedUserForCredit.name}.`);
      setSelectedUserForCredit(null);
      loadAdminData();
      refreshUserData();
    } catch (err: any) {
      addToast('error', 'Erro', err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              Área Restrita
            </span>
            <span className="text-xs text-slate-400">Controle Operacional & Chaves de Provedores</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Painel Administrativo</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Gerenciamento global de usuários, taxas de créditos, chaves da OpenAI e auditoria.
          </p>
        </div>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Usuários Registrados</span>
            <span className="text-2xl font-black text-white">{metrics?.totalUsers ?? 0}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">{metrics?.activeUsers ?? 0} ativos</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Créditos Consumidos</span>
            <span className="text-2xl font-black text-amber-400">{metrics?.totalCreditsConsumed ?? 0}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Operações atômicas</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Custo Estimado APIs</span>
            <span className="text-2xl font-black text-emerald-400">${metrics?.estimatedCostUsd ?? '0.00'}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">OpenAI + Gemini</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total de Transações</span>
            <span className="text-2xl font-black text-white">{metrics?.totalTransactions ?? 0}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Auditoria contínua</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Provider Configuration & Credit Rates (5/12) */}
        <form onSubmit={handleSaveConfig} className="lg:col-span-5 space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Chaves de Provedores de IA</span>
            </h3>

            {/* OpenAI Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-semibold">OpenAI API Key (DALL-E 3)</label>
                <span className={`text-[10px] font-bold ${config?.openaiApiKeyConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {config?.openaiApiKeyConfigured ? '✓ Conectada (sk-...)' : 'Não configurada'}
                </span>
              </div>
              <input
                type="text"
                placeholder="sk-proj-..."
                value={openAiKeyInput}
                onChange={e => setOpenAiKeyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
              />
              {openAiKeyInput && (openAiKeyInput.trim().startsWith('curl') || openAiKeyInput.includes('$OPENAI_API_KEY')) && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-[11px] leading-relaxed">
                  ⚠️ <strong>Comando curl detectado:</strong> Você colou o comando de exemplo da documentação. Por favor, acesse <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline font-bold text-amber-400">platform.openai.com/api-keys</a>, crie uma "Secret Key" que começa com <code className="font-mono bg-black/40 px-1 rounded text-white">sk-...</code> e cole aqui.
                </div>
              )}
              {openAiKeyInput && openAiKeyInput.trim().startsWith('sk-') && (
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Formato de chave correto (inicia com sk-...)</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestOpenAiKey}
                  disabled={testingKey}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>{testingKey ? 'Testando Conexão...' : 'Testar Chave OpenAI'}</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs space-y-1 ${testResult.valid ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200' : 'bg-red-950/80 border border-red-500/40 text-red-200'}`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {testResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                    <span>{testResult.valid ? 'Chave Autenticada com Sucesso' : 'Falha de Autenticação na OpenAI'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                  {testResult.advice && (
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <strong>Recomendação:</strong> {testResult.advice}
                    </p>
                  )}
                </div>
              )}

              <p className="text-[10px] text-slate-500">
                A chave deve começar estritamente com <span className="font-mono text-amber-400">sk-...</span>. Para gerar sem precisar de chave externa, use o Motor Criativo Pica-Pau IA no Estúdio.
              </p>
            </div>

            {/* Gemini Key */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-semibold">Google Gemini API Key</label>
                <span className={`text-[10px] font-bold ${config?.geminiApiKeyConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {config?.geminiApiKeyConfigured ? '✓ Conectada' : 'Não detectada'}
                </span>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKeyInput}
                onChange={e => setGeminiKeyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
              />
              <p className="text-[10px] text-slate-500">
                Utilizada para aprimoramento de prompts, copywriting e roteiros.
              </p>
            </div>
          </div>

          {/* Credit Rates Control */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Taxas de Crédito por Modalidade</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">DALL-E 3 Standard</label>
                <input
                  type="number"
                  min="1"
                  value={dalleStandardCost}
                  onChange={e => setDalleStandardCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">DALL-E 3 HD</label>
                <input
                  type="number"
                  min="1"
                  value={dalleHdCost}
                  onChange={e => setDalleHdCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Copywriting IA</label>
                <input
                  type="number"
                  min="1"
                  value={copyCost}
                  onChange={e => setCopyCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cena de Vídeo</label>
                <input
                  type="number"
                  min="1"
                  value={videoCost}
                  onChange={e => setVideoCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações do Sistema</span>
            </button>
          </div>
        </form>

        {/* Right: User Management Table (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Gestão de Contas de Usuários ({users.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="pb-3">Usuário</th>
                    <th className="pb-3">Plano</th>
                    <th className="pb-3">Créditos</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-white">{u.name}</div>
                        <span className="text-[10px] text-slate-400">{u.email}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-amber-400">
                        {u.credits}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {u.active ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedUserForCredit(u)}
                          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold rounded text-[11px] transition-colors"
                          title="Ajustar créditos"
                        >
                          ± Créditos
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`p-1.5 rounded transition-colors ${
                            u.active ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-emerald-400'
                          }`}
                          title={u.active ? 'Bloquear conta' : 'Desbloquear conta'}
                        >
                          {u.active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Adjustment Modal */}
      {selectedUserForCredit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Ajuste de Créditos</h3>
              <button
                onClick={() => setSelectedUserForCredit(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Ajustando créditos para: <strong>{selectedUserForCredit.name}</strong> (Saldo atual: {selectedUserForCredit.credits})
              </p>

              <div>
                <label className="text-slate-400 block mb-1">Quantidade de Créditos (positivo ou negativo)</label>
                <input
                  type="number"
                  value={creditAdjustmentAmount}
                  onChange={e => setCreditAdjustmentAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Motivo do Ajuste (Auditoria)</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedUserForCredit(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyCreditAdjustment}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
