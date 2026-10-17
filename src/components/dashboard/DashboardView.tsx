import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Megaphone, 
  Layers, 
  Coins, 
  ArrowUpRight, 
  Clock, 
  Briefcase, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  Plus, 
  Download, 
  Palette,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { ProjectItem, VideoTask, BrandClient } from '../../types';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    systemConfig, 
    setActiveTab, 
    openInVisualEditor, 
    setSelectedBrand 
  } = useApp();

  const [recentProjects, setRecentProjects] = useState<ProjectItem[]>([]);
  const [videoTasks, setVideoTasks] = useState<VideoTask[]>([]);
  const [brands, setBrands] = useState<BrandClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      try {
        const [projRes, vidRes, brandsRes] = await Promise.all([
          ApiService.getProjects(currentUser.id),
          ApiService.getVideos(currentUser.id),
          ApiService.getBrands(currentUser.id)
        ]);
        setRecentProjects(projRes.projects || []);
        setVideoTasks(vidRes.tasks || []);
        setBrands(brandsRes.brands || []);
      } catch (err) {
        console.error('Falha ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Studio IA Criativo
              </span>
              <span className="text-xs text-slate-400">Plataforma Oficial de Produção</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white">{currentUser?.name}</span>!
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Crie imagens comerciais com <strong className="text-amber-400">DALL-E 3</strong>, roteiros e vídeos promocionais, anúncios de alta conversão e gerencie os materiais dos seus clientes com total segurança e controle de créditos.
            </p>
          </div>

          {/* Quick Credit Card */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between min-w-[220px] shadow-lg shadow-black/40">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Saldo Disponível</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">{currentUser?.credits ?? 0}</span>
              <span className="text-xs font-semibold text-slate-400">créditos</span>
            </div>
            <button
              onClick={() => setActiveTab('credits')}
              className="w-full text-center py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-md"
            >
              Recarregar Créditos
            </button>
          </div>
        </div>

        {/* API Warning banner if not configured */}
        {!systemConfig?.openaiApiKeyConfigured && (
          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-amber-200 text-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Atenção:</strong> A chave de API da OpenAI (DALL-E 3) ainda não foi detectada. Para gerar artes reais com DALL-E 3, configure sua chave no painel de administração.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('admin')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shrink-0 transition-colors"
            >
              Configurar Agora
            </button>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Criar Imagem */}
        <button
          onClick={() => setActiveTab('image-studio')}
          className="group text-left p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all shadow-md hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
              Criar Imagem com IA
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              DALL-E 3 com proporções 1:1, 9:16, 16:9 e camadas de texto comercial.
            </p>
          </div>
        </button>

        {/* Criar Vídeo */}
        <button
          onClick={() => setActiveTab('video-studio')}
          className="group text-left p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 rounded-2xl transition-all shadow-md hover:shadow-xl hover:shadow-red-500/10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-red-400 transition-colors">
              Criar Vídeo Promocional
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Roteiros estruturados em cenas, narração, legendas e montagem sequencial.
            </p>
          </div>
        </button>

        {/* Criar Anúncio */}
        <button
          onClick={() => setActiveTab('ad-campaign')}
          className="group text-left p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all shadow-md hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Megaphone className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
              Gerador de Anúncios
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Títulos de impacto, CTAs irresistíveis, hashtags e estratégias com Gemini.
            </p>
          </div>
        </button>

        {/* Criar Campanha Completa */}
        <button
          onClick={() => setActiveTab('visual-editor')}
          className="group text-left p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 rounded-2xl transition-all shadow-md hover:shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">
              Editor Visual Canvas
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Monte peças completas com logos, tipografia, preços reais e exporte em alta resolução.
            </p>
          </div>
        </button>
      </div>

      {/* Two Column Grid: Recent Projects & Active Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Projects (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Projetos & Artes Recentes</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                {recentProjects.length}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Ver Biblioteca Completa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentProjects.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-white text-sm">Nenhum projeto gerado ainda</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Crie sua primeira arte utilizando o Estúdio de Imagens com DALL-E 3 ou monte uma composição no Editor Visual.
              </p>
              <button
                onClick={() => setActiveTab('image-studio')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Começar Agora</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentProjects.slice(0, 4).map((project) => (
                <div
                  key={project.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col justify-between transition-all shadow-md hover:shadow-lg"
                >
                  <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-700" />
                    )}
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-amber-300 border border-slate-700">
                      {project.format}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                        <Briefcase className="w-3 h-3 text-amber-400" />
                        <span className="truncate">{project.clientName || 'Cliente Geral'}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {project.title}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">
                        {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <button
                        onClick={() => openInVisualEditor(project)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Palette className="w-3 h-3 text-amber-400" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Video Tasks & Brands Shortcuts (1/3 width) */}
        <div className="space-y-6">
          {/* Active Video Productions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-red-400" />
                <span>Vídeos & Filas IA</span>
              </h3>
              <button
                onClick={() => setActiveTab('video-studio')}
                className="text-xs text-amber-400 hover:underline font-medium"
              >
                Ver todos
              </button>
            </div>

            {videoTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Nenhum vídeo em processamento no momento.
              </p>
            ) : (
              <div className="space-y-3">
                {videoTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                        {task.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          task.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : task.status === 'generating' || task.status === 'processing'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : task.status === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.status === 'completed'
                          ? 'Concluído'
                          : task.status === 'generating'
                          ? 'Gerando Cenas'
                          : task.status === 'processing'
                          ? 'Renderizando'
                          : task.status === 'queued'
                          ? 'Na fila'
                          : 'Falhou'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${task.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brands & Clients Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Marcas & Clientes</span>
              </h3>
              <button
                onClick={() => setActiveTab('brands')}
                className="text-xs text-amber-400 hover:underline font-medium"
              >
                Gerenciar
              </button>
            </div>

            <div className="space-y-2">
              {brands.slice(0, 3).map((brand) => (
                <div
                  key={brand.id}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setActiveTab('image-studio');
                  }}
                  className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-800"
                      style={{ backgroundColor: brand.primaryColor }}
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-200 group-hover:text-amber-400 transition-colors">
                        {brand.name}
                      </h4>
                      <p className="text-[10px] text-slate-400">{brand.segment}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-medium">Usar BrandKit →</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('brands')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo Cliente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
