import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Sparkles, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Clock, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  Layers, 
  Volume2, 
  Music, 
  FileText,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { VideoTask, VideoScene, BrandClient } from '../../types';

export const VideoStudioView: React.FC = () => {
  const { currentUser, systemConfig, refreshUserData, addToast, selectedBrand } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [voiceType, setVoiceType] = useState('Kore - Narradora Dinâmica');
  const [bgMusic, setBgMusic] = useState('Corporativa Inspiradora');
  const [hasSubtitles, setHasSubtitles] = useState(true);

  // Scenes list
  const [scenes, setScenes] = useState<Array<{
    visualPrompt: string;
    narrationText: string;
    headlineText: string;
    durationSeconds: number;
  }>>([
    {
      visualPrompt: 'Câmera se aproxima revelando um ambiente moderno e dinâmico, iluminação cinematográfica.',
      narrationText: 'Você busca mais agilidade e resultados surpreendentes para o seu negócio?',
      headlineText: 'TRANSFORME SEU NEGÓCIO',
      durationSeconds: 4
    },
    {
      visualPrompt: 'Demonstração dos produtos em ação, detalhes nítidos e transições fluidas.',
      narrationText: 'Conheça as soluções completas que elevam o seu padrão ao próximo nível.',
      headlineText: 'QUALIDADE COMPROVADA',
      durationSeconds: 5
    },
    {
      visualPrompt: 'Tela final com logotipo, contatos comerciais e chamada para ação.',
      narrationText: 'Fale conosco hoje mesmo e garanta condições especiais exclusivas!',
      headlineText: 'PEÇA PELO WHATSAPP',
      durationSeconds: 5
    }
  ]);

  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [activeTask, setActiveTask] = useState<VideoTask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (selectedBrand) {
      setTitle(`Comercial Promocional - ${selectedBrand.name}`);
      setDescription(`Vídeo publicitário de alta conversão para ${selectedBrand.name} focado em ${selectedBrand.segment}.`);
    } else {
      setTitle('Comercial Promocional de Alta Conversão');
      setDescription('Vídeo publicitário para redes sociais com roteiro dinâmico e chamada para ação.');
    }
  }, [selectedBrand]);

  const loadTasks = async () => {
    if (!currentUser) return;
    try {
      const res = await ApiService.getVideos(currentUser.id);
      setTasks(res.tasks || []);
      if (res.tasks && res.tasks.length > 0 && !activeTask) {
        setActiveTask(res.tasks[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleAddScene = () => {
    setScenes(prev => [
      ...prev,
      {
        visualPrompt: 'Nova cena com iluminação e estética publicitária.',
        narrationText: 'Texto que será narrado nesta cena.',
        headlineText: 'TÍTULO DA CENA',
        durationSeconds: 4
      }
    ]);
  };

  const handleRemoveScene = (index: number) => {
    if (scenes.length <= 1) {
      addToast('warning', 'Atenção', 'O vídeo precisa ter pelo menos 1 cena.');
      return;
    }
    setScenes(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateScene = (index: number, field: string, value: any) => {
    setScenes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCreateAndProcessVideo = async () => {
    if (!currentUser) return;
    if (!title.trim()) {
      addToast('warning', 'Campo obrigatório', 'Dê um título ao projeto de vídeo.');
      return;
    }

    const sceneCost = systemConfig?.videoSceneCreditCost || 20;
    const totalCost = scenes.length * sceneCost;

    if (currentUser.credits < totalCost) {
      addToast('error', 'Créditos Insuficientes', `Você precisa de ${totalCost} créditos (${scenes.length} cenas x ${sceneCost}). Saldo: ${currentUser.credits}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const createRes = await ApiService.createVideo(currentUser.id, {
        title,
        description,
        clientId: selectedBrand?.id,
        aspectRatio,
        scenes,
        voiceType,
        bgMusic,
        hasSubtitles
      });

      addToast('info', 'Vídeo Criado', 'Tarefa adicionada à fila. Iniciando renderização assíncrona...');
      
      // Trigger processing pipeline
      await ApiService.processVideo(currentUser.id, createRes.task.id);
      await loadTasks();
      refreshUserData();
      setActiveTask(createRes.task);
    } catch (err: any) {
      addToast('error', 'Falha no Vídeo', err.message);
    } finally {
      setIsSubmitting(false);
      refreshUserData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              Pipeline de Vídeos
            </span>
            <span className="text-xs text-slate-400">Roteiro, Cenas & Montagem</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Estúdio de Produção de Vídeos</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Estruture roteiros publicitários em cenas sequenciais com acompanhamento de fila e exportação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2 text-xs">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Custo Total:</span>
            <strong className="text-amber-400">
              {scenes.length * (systemConfig?.videoSceneCreditCost || 20)} créditos
            </strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Script & Scene Editor (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Info */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span>Dados Gerais da Campanha em Vídeo</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Título do Comercial</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Objetivo da Propaganda</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Formato</label>
                  <select
                    value={aspectRatio}
                    onChange={e => setAspectRatio(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                  >
                    <option value="16:9">Widescreen 16:9 (YouTube)</option>
                    <option value="9:16">Vertical 9:16 (Reels/TikTok)</option>
                    <option value="1:1">Quadrado 1:1 (Feed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Voz da Narração</label>
                  <select
                    value={voiceType}
                    onChange={e => setVoiceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                  >
                    <option value="Kore - Narradora Dinâmica">Kore - Dinâmica</option>
                    <option value="Fenrir - Voz Grave e Forte">Fenrir - Forte & Impacto</option>
                    <option value="Zephyr - Suave e Acolhedora">Zephyr - Suave</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Trilha Sonora</label>
                  <select
                    value={bgMusic}
                    onChange={e => setBgMusic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                  >
                    <option value="Corporativa Inspiradora">Corporativa Inspiradora</option>
                    <option value="Eletrônica Vibrante">Eletrônica Vibrante</option>
                    <option value="Acústica Leve">Acústica Leve</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Scene Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Divisão em Cenas Sequenciais ({scenes.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleAddScene}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Adicionar Cena</span>
              </button>
            </div>

            <div className="space-y-3">
              {scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-white">Cena {idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{scene.durationSeconds}s</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveScene(idx)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Remover cena"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Título ou Texto na Tela
                      </label>
                      <input
                        type="text"
                        value={scene.headlineText}
                        onChange={e => handleUpdateScene(idx, 'headlineText', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Narração de Voz
                      </label>
                      <textarea
                        rows={2}
                        value={scene.narrationText}
                        onChange={e => handleUpdateScene(idx, 'narrationText', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Prompt Visual da Cena
                      </label>
                      <input
                        type="text"
                        value={scene.visualPrompt}
                        onChange={e => handleUpdateScene(idx, 'visualPrompt', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Rendering */}
          <button
            type="button"
            onClick={handleCreateAndProcessVideo}
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Enviando para Fila de Renderização...</span>
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                <span>Renderizar Comercial em Vídeo ({scenes.length * 20} Créditos)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Player & Queue Monitor (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Preview Player */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-red-400" />
                <span>Player do Vídeo</span>
              </h3>
              {activeTask && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300">
                  {activeTask.status.toUpperCase()}
                </span>
              )}
            </div>

            {/* Video Viewport */}
            <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
              {activeTask?.outputVideoUrl ? (
                <video
                  src={activeTask.outputVideoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : activeTask?.status === 'generating' || activeTask?.status === 'processing' ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
                  <p className="text-xs font-bold text-white">Processando cenas e renderizando vídeo...</p>
                  <p className="text-[11px] text-slate-400">Progresso: {activeTask.progressPercentage}%</p>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-500 space-y-2">
                  <Video className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs">Selecione ou gere um vídeo para visualizar o player.</p>
                </div>
              )}
            </div>

            {activeTask?.outputVideoUrl && (
              <a
                href={activeTask.outputVideoUrl}
                download="comercial-picapau.mp4"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Baixar Vídeo em MP4</span>
              </a>
            )}
          </div>

          {/* Queue Monitor History */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Fila de Tarefas Assíncronas</span>
            </h3>

            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Nenhum vídeo em histórico.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {tasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setActiveTask(t)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      activeTask?.id === t.id
                        ? 'bg-slate-800 border-red-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white truncate max-w-[170px]">{t.title}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : t.status === 'generating' || t.status === 'processing'
                            ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                      <div
                        className="bg-red-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${t.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
