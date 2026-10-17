import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Coins, 
  PlusCircle, 
  CheckCircle2, 
  RotateCcw, 
  Calendar, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { CreditTransaction } from '../../types';

export const CreditsManagerView: React.FC = () => {
  const { currentUser, systemConfig, refreshUserData, addToast } = useApp();

  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargingPack, setRechargingPack] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!currentUser) return;
    try {
      const res = await ApiService.getCreditHistory(currentUser.id);
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  const handleRecharge = async (amount: number, title: string) => {
    if (!currentUser) return;
    setRechargingPack(title);
    try {
      await ApiService.rechargeCredits(currentUser.id, amount, title);
      addToast('success', 'Recarga Realizada!', `Foram adicionados +${amount} créditos à sua conta.`);
      await refreshUserData();
      await loadHistory();
    } catch (err: any) {
      addToast('error', 'Falha na recarga', err.message);
    } finally {
      setRechargingPack(null);
    }
  };

  const creditPackages = [
    {
      title: 'Pacote Start',
      credits: 100,
      price: 'R$ 49',
      features: ['Ideal para pequenos comércios', '~12 imagens DALL-E 3', '100 copies com IA', 'Suporte padrão'],
      popular: false
    },
    {
      title: 'Pacote Criador Pro',
      credits: 350,
      price: 'R$ 139',
      features: ['Perfeito para profissionais liberais', '~43 imagens DALL-E 3', 'Suporte a vídeos publicitários', 'Geração em HD liberada'],
      popular: true
    },
    {
      title: 'Pacote Agência',
      credits: 1000,
      price: 'R$ 349',
      features: ['Projetado para agências e marcas', '~125 artes DALL-E 3', 'Fila de vídeo prioritária', 'Múltiplos Brand Kits'],
      popular: false
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Controle Atômico
            </span>
            <span className="text-xs text-slate-400">Ledger & Transações Auditáveis</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Gerenciamento de Créditos</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Visualize seu saldo, compre recargas e acompanhe todas as deduções e estornos com transparência.
          </p>
        </div>

        {/* Current Balance Big Badge */}
        <div className="px-5 py-3 bg-slate-900 border border-amber-500/40 rounded-2xl flex items-center gap-4 shadow-xl shadow-amber-950/20">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Saldo Atual Disponível
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-400">{currentUser?.credits ?? 0}</span>
              <span className="text-xs text-slate-400 font-bold">créditos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing / Recharge Packs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Pacotes de Recarga Imediata</span>
          </h3>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Créditos nunca expiram</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPackages.map(pkg => (
            <div
              key={pkg.title}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative shadow-lg ${
                pkg.popular
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500 shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow">
                  Mais Popular
                </span>
              )}

              <div>
                <h4 className="font-bold text-base text-white">{pkg.title}</h4>
                <div className="my-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{pkg.price}</span>
                  <span className="text-xs text-amber-400 font-bold">({pkg.credits} créditos)</span>
                </div>

                <ul className="space-y-2 my-4 text-xs text-slate-300">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleRecharge(pkg.credits, pkg.title)}
                disabled={rechargingPack === pkg.title}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  pkg.popular
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {rechargingPack === pkg.title ? 'Processando Recarga...' : `Adicionar +${pkg.credits} Créditos`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Table Breakdown */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Tabela de Tarifas por Operação de IA</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[11px]">DALL-E 3 Standard</span>
            <span className="font-black text-amber-400 text-base">{systemConfig?.dalle3StandardCreditCost || 8} créditos</span>
            <p className="text-[10px] text-slate-500">Resolução 1024x1024</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[11px]">DALL-E 3 Ultra HD</span>
            <span className="font-black text-amber-400 text-base">{systemConfig?.dalle3HdCreditCost || 15} créditos</span>
            <p className="text-[10px] text-slate-500">Resolução 1792x1024 ou HD</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[11px]">Campanha Copywriting</span>
            <span className="font-black text-blue-400 text-base">{systemConfig?.copywritingCreditCost || 1} crédito</span>
            <p className="text-[10px] text-slate-500">Headlines, copies e hashtags</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[11px]">Cena de Vídeo</span>
            <span className="font-black text-red-400 text-base">{systemConfig?.videoSceneCreditCost || 20} créditos</span>
            <p className="text-[10px] text-slate-500">Por cena renderizada</p>
          </div>
        </div>
      </div>

      {/* Transactions Audit Ledger */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            <span>Extrato Completo de Transações & Estornos</span>
          </h3>
          <span className="text-xs text-slate-500">{transactions.length} registros</span>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Nenhuma transação registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Operação / Descrição</th>
                  <th className="pb-3 font-semibold">Modelo</th>
                  <th className="pb-3 font-semibold">Data & Hora</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Créditos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map(tx => {
                  const isDeduction = tx.amount < 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-white">{tx.description}</div>
                        <span className="text-[10px] font-mono text-slate-500">{tx.id}</span>
                      </td>
                      <td className="py-3 text-slate-300">{tx.model}</td>
                      <td className="py-3 text-slate-400">
                        {new Date(tx.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : tx.status === 'refunded'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {tx.status === 'completed'
                            ? 'Concluído'
                            : tx.status === 'refunded'
                            ? 'Estornado'
                            : 'Reservado'}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-black text-sm ${
                        isDeduction ? 'text-slate-300' : 'text-amber-400'
                      }`}>
                        {isDeduction ? tx.amount : `+${tx.amount}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
