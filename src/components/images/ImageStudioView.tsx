import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Wand2, 
  RotateCcw, 
  Download, 
  Palette, 
  Coins, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Eye, 
  Briefcase, 
  Copy, 
  Maximize2,
  Sliders,
  DollarSign,
  PhoneCall,
  Megaphone,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { BrandClient, CanvasLayer, ProjectFormat } from '../../types';

export const ImageStudioView: React.FC = () => {
  const { 
    currentUser, 
    systemConfig, 
    refreshUserData, 
    addToast, 
    openInVisualEditor, 
    selectedBrand, 
    setSelectedBrand,
    setActiveTab 
  } = useApp();

  const [brands, setBrands] = useState<BrandClient[]>([]);

  // Studio Form State
  const [prompt, setPrompt] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [segment, setSegment] = useState('Comércio & Serviços');
  const [productOrService, setProductOrService] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [adObjective, setAdObjective] = useState('Conversão & Vendas');
  const [visualStyle, setVisualStyle] = useState('Fotografia Publicitária Comercial');
  const [aspectRatio, setAspectRatio] = useState<ProjectFormat>('1:1');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [engine, setEngine] = useState<'creative' | 'dalle3'>('creative');

  // Commercial Text Overlay Layer Fields (Exact preservation)
  const [includeTextLayer, setIncludeTextLayer] = useState(true);
  const [headline, setHeadline] = useState('');
  const [price, setPrice] = useState('');
  const [cta, setCta] = useState('Peça pelo WhatsApp');
  const [phone, setPhone] = useState('');
  const [badgeText, setBadgeText] = useState('OFERTA ESPECIAL');

  // Output and Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    imageUrl: string;
    revisedPrompt?: string;
    creditsDeducted: number;
    transactionId: string;
    format: string;
    engineUsed?: 'dalle3' | 'creative';
    modelUsed?: string;
    note?: string;
    warning?: {
      code: string;
      message: string;
      actionableAdvice: string;
    };
  } | null>(null);

  const [errorDetails, setErrorDetails] = useState<{
    code: string;
    message: string;
    actionableAdvice: string;
  } | null>(null);

  // Load registered client brands
  useEffect(() => {
    const fetchBrands = async () => {
      if (!currentUser) return;
      try {
        const res = await ApiService.getBrands(currentUser.id);
        setBrands(res.brands || []);
      } catch (err) {
        console.error('Falha ao carregar marcas:', err);
      }
    };
    fetchBrands();
  }, [currentUser]);

  // Apply selected brand kit into form
  useEffect(() => {
    if (selectedBrand) {
      setCompanyName(selectedBrand.name);
      setSegment(selectedBrand.segment || 'Tecnologia & Serviços');
      setPhone(selectedBrand.whatsapp || selectedBrand.phone || '');
      setTargetAudience(selectedBrand.targetAudience || '');
    }
  }, [selectedBrand]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = e.target.value;
    if (!brandId) {
      setSelectedBrand(null);
      return;
    }
    const b = brands.find(item => item.id === brandId);
    if (b) setSelectedBrand(b);
  };

  // Enhance prompt with Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      addToast('warning', 'Atenção', 'Digite uma descrição inicial antes de aprimorar o prompt.');
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await ApiService.enhancePrompt(prompt, visualStyle, segment);
      if (res.enhancedPrompt) {
        setPrompt(res.enhancedPrompt);
        addToast('success', 'Prompt Aprimorado', 'Seu prompt foi enriquecido com técnicas publicitárias para o DALL-E 3.');
      }
    } catch (err: any) {
      addToast('error', 'Falha ao aprimorar', err.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Execute Generation
  const handleGenerate = async (e?: React.FormEvent, forceEngine?: 'creative' | 'dalle3') => {
    if (e) e.preventDefault();
    if (!currentUser) return;

    const chosenEngine = forceEngine || engine;

    if (!prompt.trim()) {
      addToast('warning', 'Campo obrigatório', 'Descreva a imagem que deseja gerar.');
      return;
    }

    const creditCost = quality === 'hd' 
      ? (systemConfig?.dalle3HdCreditCost || 15) 
      : (systemConfig?.dalle3StandardCreditCost || 8);

    if (currentUser.credits < creditCost) {
      addToast('error', 'Créditos Insuficientes', `Você precisa de ${creditCost} créditos para gerar com qualidade ${quality.toUpperCase()}. Seu saldo atual é ${currentUser.credits}.`);
      setActiveTab('credits');
      return;
    }

    setIsGenerating(true);
    setErrorDetails(null);
    setGeneratedResult(null);

    try {
      const result = await ApiService.generateDalle3Image({
        userId: currentUser.id,
        prompt: prompt.trim(),
        aspectRatio,
        quality,
        style: 'vivid',
        clientName: companyName,
        segment,
        headline,
        price,
        cta,
        phone,
        engine: chosenEngine
      });

      if (!result.success) {
        setErrorDetails(result.error);
        addToast('error', 'Falha na Geração', result.error?.message || 'Não foi possível gerar a imagem.');
      } else {
        setGeneratedResult(result);
        if (result.warning) {
          addToast('info', 'Arte Gerada com Sucesso!', result.note || 'Sua arte publicitária foi criada pelo Motor Criativo Pica-Pau IA.');
        } else {
          const engineLabel = result.engineUsed === 'dalle3' ? 'OpenAI DALL-E 3' : 'Motor Criativo Pica-Pau IA';
          addToast('success', 'Imagem Criada!', `Arte gerada com sucesso via ${engineLabel}. Consumo: ${result.creditsDeducted} créditos.`);
        }
        refreshUserData();
      }
    } catch (err: any) {
      setErrorDetails({
        code: 'NETWORK_ERROR',
        message: err.message || 'Falha de comunicação com o servidor.',
        actionableAdvice: 'Verifique sua conexão e tente novamente.'
      });
      addToast('error', 'Erro', 'Falha de conexão com a API.');
    } finally {
      setIsGenerating(false);
      refreshUserData();
    }
  };

  // Build layers for Visual Editor
  const handleOpenInEditor = () => {
    if (!generatedResult?.imageUrl) return;

    const layers: CanvasLayer[] = [
      {
        id: 'bg_image',
        type: 'image',
        content: generatedResult.imageUrl,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        zIndex: 1
      }
    ];

    if (includeTextLayer) {
      if (badgeText) {
        layers.push({
          id: 'layer_badge',
          type: 'badge',
          content: badgeText.toUpperCase(),
          x: 8,
          y: 8,
          fontSize: 14,
          color: '#ffffff',
          backgroundColor: selectedBrand?.accentColor || '#ef4444',
          fontWeight: 'bold',
          borderRadius: 6,
          zIndex: 10
        });
      }

      if (headline) {
        layers.push({
          id: 'layer_headline',
          type: 'text',
          content: headline.toUpperCase(),
          x: 8,
          y: 18,
          fontSize: 26,
          color: '#ffffff',
          fontWeight: '900',
          zIndex: 11
        });
      }

      if (price) {
        layers.push({
          id: 'layer_price',
          type: 'text',
          content: price,
          x: 8,
          y: 72,
          fontSize: 34,
          color: selectedBrand?.secondaryColor || '#f59e0b',
          fontWeight: '900',
          zIndex: 12
        });
      }

      if (cta || phone) {
        layers.push({
          id: 'layer_cta',
          type: 'badge',
          content: phone ? `${cta}: ${phone}` : cta,
          x: 8,
          y: 85,
          fontSize: 16,
          color: '#0b132b',
          backgroundColor: selectedBrand?.secondaryColor || '#f59e0b',
          fontWeight: 'bold',
          borderRadius: 8,
          zIndex: 13
        });
      }
    }

    openInVisualEditor({
      title: headline || `Arte DALL-E 3 - ${companyName || 'Campanha'}`,
      format: aspectRatio,
      type: 'image',
      thumbnailUrl: generatedResult.imageUrl,
      sourceImageUrl: generatedResult.imageUrl,
      layers,
      commercialData: {
        headline,
        price,
        cta,
        phone,
        product: productOrService
      },
      clientId: selectedBrand?.id,
      clientName: companyName,
      promptUsed: prompt,
      modelUsed: `dall-e-3 (${quality})`
    });
  };

  // Download raw image directly
  const handleDownloadImage = (format: 'png' | 'jpeg') => {
    if (!generatedResult?.imageUrl) return;
    const link = document.createElement('a');
    link.href = generatedResult.imageUrl;
    link.download = `pica-pau-studio-dalle3-${Date.now()}.${format}`;
    link.click();
    addToast('success', 'Download Iniciado', `Arquivo ${format.toUpperCase()} transferido.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Studio Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              OpenAI DALL-E 3 Oficial
            </span>
            <span className="text-xs text-slate-400">Geração de Imagens & Anúncios</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Estúdio de Criação de Imagens</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Gere fotografias comerciais com IA e monte artes publicitárias preservando dados reais.
          </p>
        </div>

        {/* Cost estimate badge */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <div className="text-xs">
              <span className="text-slate-400">Custo Estimado:</span>{' '}
              <strong className="text-amber-400">
                {quality === 'hd' ? systemConfig?.dalle3HdCreditCost || 15 : systemConfig?.dalle3StandardCreditCost || 8} créditos
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Inputs (7/12) */}
        <form onSubmit={handleGenerate} className="lg:col-span-7 space-y-6">
          {/* Brand & Client Selection */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>Marca ou Cliente (Brand Kit)</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveTab('brands')}
                className="text-[11px] text-amber-400 hover:underline font-semibold"
              >
                + Gerenciar Clientes
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={selectedBrand?.id || ''}
                  onChange={handleBrandChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">Selecione uma marca cadastrada (ou digite abaixo)...</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.segment})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Nome da empresa/marca"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Segmento Comercial</label>
                <input
                  type="text"
                  placeholder="Ex: Pizzaria, Advocacia, Imobiliária..."
                  value={segment}
                  onChange={e => setSegment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Produto ou Serviço em Destaque</label>
                <input
                  type="text"
                  placeholder="Ex: Pizza artesanal ao forno a lenha"
                  value={productOrService}
                  onChange={e => setProductOrService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* AI Engine Selector */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Motor de Inteligência Artificial</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                {engine === 'creative' ? 'Ativo e Pronto' : (systemConfig?.openaiApiKeyConfigured ? 'OpenAI Conectado' : 'Requer Chave sk-...')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEngine('creative')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  engine === 'creative'
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-300">Motor Criativo Pica-Pau</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                    RECOMENDADO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Incluso e 100% pronto. Cria fotografias e artes comerciais de alto impacto sem exigir chaves de API externas.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEngine('dalle3')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  engine === 'dalle3'
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">OpenAI DALL-E 3</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    API EXTERNA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Utiliza a API oficial da OpenAI. Requer chave <code className="text-amber-400 font-mono">sk-...</code> válida no painel admin.
                </p>
              </button>
            </div>
          </div>

          {/* Prompt Section with Gemini Booster */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Descrição da Imagem (Prompt DALL-E 3) *</span>
              </label>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>{isEnhancing ? 'Otimizando com IA...' : 'Melhorar Prompt com IA'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ex: Uma pizza artesanal de borda dourada saindo fumegante de um forno a lenha, queijo derretendo, manjericão fresco, iluminação de estúdio gastronômico, textura apetitosa e ultra realista..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed resize-none"
            />
          </div>

          {/* Formats, Proportions & Quality */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Configuração Técnica do DALL-E 3</span>
            </h3>

            {/* Proportions */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-2">Formato & Proporção de Destino</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: '1:1', label: 'Feed Quadrado', desc: '1024x1024 (1:1)' },
                  { id: '9:16', label: 'Stories / Reels', desc: '1024x1792 (9:16)' },
                  { id: '16:9', label: 'YouTube / Banner', desc: '1792x1024 (16:9)' },
                  { id: '4:5', label: 'Feed Retrato', desc: '1024x1792 (4:5)' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id as ProjectFormat)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      aspectRatio === item.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs block">{item.label}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality and Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Qualidade DALL-E 3</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setQuality('standard')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      quality === 'standard'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Standard (8 créditos)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality('hd')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      quality === 'hd'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    HD Ultra (15 créditos)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Estilo Visual</label>
                <select
                  value={visualStyle}
                  onChange={e => setVisualStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Fotografia Publicitária Comercial">Fotografia Comercial</option>
                  <option value="Produto em Destaque com Fundo Limpo">Produto em Destaque</option>
                  <option value="Publicidade Moderna Minimalista">Publicidade Moderna</option>
                  <option value="Ambiente Corporativo Sofisticado">Ambiente Corporativo</option>
                  <option value="Gastronomia Apetite Appeal">Gastronomia Premium</option>
                  <option value="Moda & Estética Editorial">Moda & Editorial</option>
                  <option value="Tecnologia Futurista & Neon">Tecnologia & Tech</option>
                  <option value="Ilustração 3D Renderizada">Ilustração 3D</option>
                </select>
              </div>
            </div>
          </div>

          {/* Commercial Text Layers - Preserving Exact User Values */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Camadas de Texto Comercial (Preservação Exata)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeText"
                  checked={includeTextLayer}
                  onChange={e => setIncludeTextLayer(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="includeText" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Habilitar Sobreposição
                </label>
              </div>
            </div>

            {includeTextLayer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Selo / Badge de Destaque</label>
                  <input
                    type="text"
                    placeholder="Ex: OFERTA EXCLUSIVA"
                    value={badgeText}
                    onChange={e => setBadgeText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Título de Impacto</label>
                  <input
                    type="text"
                    placeholder="Ex: NOVO CARDÁPIO ESPECIAL"
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Preço ou Condição Real</label>
                  <input
                    type="text"
                    placeholder="Ex: Por apenas R$ 49,90"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">WhatsApp / Telefone de Contato</label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 98765-4321"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Processando Imagem Publicitária...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>
                  {engine === 'creative' ? 'Gerar Imagem com Motor Criativo Pica-Pau' : 'Gerar Imagem com OpenAI DALL-E 3'} ({quality === 'hd' ? 15 : 8} Créditos)
                </span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Real Preview, Diagnosis & Export (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preview Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Pré-Visualização da Produção</span>
              </h3>
              {generatedResult && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {generatedResult.engineUsed === 'dalle3' ? 'DALL-E 3 Concluído' : 'Motor Criativo Concluído'}
                </span>
              )}
            </div>

            {/* Canvas/Preview Viewport */}
            <div className="relative w-full aspect-square bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center group shadow-inner">
              {isGenerating ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                  <p className="text-xs font-bold text-white">Criando obra visual publicitária...</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Consumo atômico reservado no servidor com garantia de estorno imediato se houver falha.
                  </p>
                </div>
              ) : generatedResult?.imageUrl ? (
                <>
                  <img
                    src={generatedResult.imageUrl}
                    alt="Arte publicitária gerada"
                    className="w-full h-full object-cover"
                  />

                  {/* Editable Overlay layer simulation */}
                  {includeTextLayer && (
                    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        {badgeText && (
                          <span 
                            className="inline-block px-2.5 py-1 text-[11px] font-black rounded text-white shadow-lg"
                            style={{ backgroundColor: selectedBrand?.accentColor || '#ef4444' }}
                          >
                            {badgeText.toUpperCase()}
                          </span>
                        )}
                        {headline && (
                          <h2 className="text-lg font-black text-white drop-shadow-md leading-tight max-w-[85%]">
                            {headline.toUpperCase()}
                          </h2>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {price && (
                          <div 
                            className="text-2xl font-black drop-shadow-lg"
                            style={{ color: selectedBrand?.secondaryColor || '#f59e0b' }}
                          >
                            {price}
                          </div>
                        )}
                        {(cta || phone) && (
                          <span 
                            className="inline-block px-3 py-1.5 text-xs font-bold rounded-lg text-slate-950 shadow-lg"
                            style={{ backgroundColor: selectedBrand?.secondaryColor || '#f59e0b' }}
                          >
                            {phone ? `${cta}: ${phone}` : cta}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-8 space-y-2 text-slate-500">
                  <Palette className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-xs">Sua arte publicitária será renderizada aqui.</p>
                </div>
              )}
            </div>

            {/* Production Notice for Resilient Auto-Failover */}
            {generatedResult?.warning && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Arte Concluída com Sucesso pelo Motor Criativo Pica-Pau IA</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/90">{generatedResult.note}</p>
                {generatedResult.warning.actionableAdvice && (
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-amber-500/20">
                    <strong className="text-amber-300">Dica:</strong> {generatedResult.warning.actionableAdvice}
                  </p>
                )}
              </div>
            )}

            {/* Error Diagnostics Box with 1-Click Recovery */}
            {errorDetails && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-100 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Erro diagnosticado: {errorDetails.code}</span>
                </div>
                <p className="text-xs leading-relaxed">{errorDetails.message}</p>
                <div className="pt-2 border-t border-red-900/50 text-[11px] text-red-200">
                  <strong>Como resolver:</strong> {errorDetails.actionableAdvice}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  ✓ Garantia atômica: Nenhum crédito foi cobrado da sua conta.
                </div>

                {/* 1-Click Recovery Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEngine('creative');
                      handleGenerate(undefined, 'creative');
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>✨ Gerar Esta Arte com o Motor Criativo Pica-Pau Agora</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('admin')}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>🔑 Configurar Chave OpenAI no Painel Administrativo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Actions Bar if Generated */}
            {generatedResult && (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenInEditor}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span>Abrir Camadas no Editor Visual</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadImage('png')}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadImage('jpeg')}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar JPEG</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
