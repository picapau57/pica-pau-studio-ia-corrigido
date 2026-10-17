import React from 'react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Video, 
  Image as ImageIcon 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PlansPricingView: React.FC = () => {
  const { currentUser, setActiveTab, addToast } = useApp();

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      period: 'para testar',
      creditsIncluded: '50 créditos no cadastro',
      description: 'Ideal para conhecer a plataforma e experimentar gerações iniciais.',
      features: [
        'Acesso ao DALL-E 3 Standard',
        'Até 6 imagens geradas',
        'Gerador de anúncios com Gemini',
        'Editor visual básico',
        '1 Brand Kit de cliente'
      ],
      popular: false,
      ctaText: 'Plano Inicial'
    },
    {
      id: 'pro',
      name: 'Criador Pro',
      price: 'R$ 97',
      period: '/mês',
      creditsIncluded: '300 créditos / mês',
      description: 'Perfeito para freelancers, criadores de conteúdo e profissionais autônomos.',
      features: [
        'DALL-E 3 Standard e HD',
        'Aprimoramento ilimitado de prompts',
        'Até 5 Brand Kits de clientes',
        'Editor visual completo com exportação em PNG/JPEG',
        'Acesso ao estúdio de vídeos promocionais',
        'Suporte por WhatsApp'
      ],
      popular: true,
      ctaText: 'Assinar Plano Pro'
    },
    {
      id: 'agency',
      name: 'Agência Pica-Pau',
      price: 'R$ 297',
      period: '/mês',
      creditsIncluded: '1.200 créditos / mês',
      description: 'Estrutura completa para agências de publicidade e produção em escala.',
      features: [
        'Tudo do Plano Pro',
        'Brand Kits de clientes ilimitados',
        'Fila prioritária de renderização de vídeos',
        'Geração de múltiplos anúncios em lote',
        'Exportação sem marca d’água',
        'Painel multi-usuário (em breve)',
        'Suporte técnico VIP dedicado'
      ],
      popular: false,
      ctaText: 'Plano Atual Ativo'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Custom',
      price: 'Sob Consulta',
      period: 'anual',
      creditsIncluded: 'Créditos personalizados',
      description: 'Para grandes empresas que necessitam de integrações diretas via API e SLA.',
      features: [
        'Volumes massivos de geração',
        'Chaves de API dedicadas da OpenAI e Google',
        'Treinamento de modelos personalizados',
        'Contratos e faturamento corporativo',
        'Gerente de contas exclusivo'
      ],
      popular: false,
      ctaText: 'Falar com Especialista'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    addToast('info', 'Plano Selecionado', 'Módulo de assinaturas preparado. Para recargas imediatas, acesse Gestão de Créditos.');
    setActiveTab('credits');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Planos & Escala Comercial</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Planos sob medida para seu negócio e clientes
        </h1>
        <p className="text-slate-400 text-xs leading-relaxed">
          Escolha o nível ideal de produção criativa. Todos os planos contam com controle de créditos atômico e garantia contra cobrança duplicada.
        </p>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {plans.map(plan => {
          const isCurrent = currentUser?.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative shadow-xl ${
                plan.popular
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-amber-500 shadow-amber-500/10 scale-105 z-10'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                  Mais Recomendado
                </span>
              )}

              <div>
                <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>

                <div className="my-4 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 block mt-1">
                    {plan.creditsIncluded}
                  </span>
                </div>

                <ul className="space-y-2.5 my-4 text-xs text-slate-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-md mt-4 ${
                  isCurrent
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/40 cursor-default'
                    : plan.popular
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {isCurrent ? 'Plano Atual Ativo' : plan.ctaText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
