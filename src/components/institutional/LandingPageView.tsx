import React from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Megaphone, 
  Layers, 
  ShieldCheck, 
  Coins, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Sliders 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPageView: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="min-h-full space-y-16 py-10 px-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="relative text-center max-w-3xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Plataforma Online de Publicidade Inteligente</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Crie Imagens Comerciais com <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white">DALL-E 3</span>, Vídeos e Anúncios de Alto Impacto
        </h1>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          O <strong>Pica-Pau Studio IA</strong> conecta as APIs mais avançadas de inteligência artificial em uma experiência unificada: gere fotos de produtos, roteiros em vídeo, copies publicitárias persuasivas e edite artes com total controle comercial.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('image-studio')}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all"
          >
            <span>Acessar Estúdio de Imagens</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-colors"
          >
            <span>Ver Painel Principal</span>
          </button>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">OpenAI DALL-E 3</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fotografias comerciais em alta definição com proporções para feed, stories, banners e e-commerce.
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Estúdio de Vídeos</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Roteiros estruturados cena a cena com acompanhamento assíncrono e montagem sequencial.
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">IA Copywriting</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Headlines magnéticas, legendas persuasivas e hashtags orientadas à conversão no mercado brasileiro.
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Editor Visual & Brand Kits</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Preserve preços reais, WhatsApp e identidade visual das marcas dos seus clientes sem distorções da IA.
          </p>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Arquitetura Segura & Créditos Atômicos</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Seus créditos só são cobrados após o sucesso da geração
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Nosso sistema efetua reserva atômica no banco de dados e executa estorno automático instantâneo se a API externa reportar qualquer erro de conexão ou moderação.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shrink-0 transition-colors"
        >
          Ir para a Aplicação
        </button>
      </div>
    </div>
  );
};
