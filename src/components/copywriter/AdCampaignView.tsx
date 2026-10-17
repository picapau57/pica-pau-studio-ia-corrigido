import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Video, 
  Coins, 
  RotateCcw, 
  Briefcase, 
  Share2, 
  Hash,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { BrandClient } from '../../types';

export const AdCampaignView: React.FC = () => {
  const { 
    currentUser, 
    systemConfig, 
    refreshUserData, 
    addToast, 
    selectedBrand, 
    setSelectedBrand, 
    setActiveTab 
  } = useApp();

  const [brands, setBrands] = useState<BrandClient[]>([]);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [segment, setSegment] = useState('');
  const [productOrService, setProductOrService] = useState('');
  const [benefits, setBenefits] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [priceOrOffer, setPriceOrOffer] = useState('');
  const [contacts, setContacts] = useState('');
  const [website, setWebsite] = useState('');
  const [objective, setObjective] = useState('Conversão e Vendas Rápidas');
  const [tone, setTone] = useState('Persuasivo, Moderno e Confiante');
  const [platform, setPlatform] = useState('instagram');

  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignResult, setCampaignResult] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      if (!currentUser) return;
      try {
        const res = await ApiService.getBrands(currentUser.id);
        setBrands(res.brands || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBrands();
  }, [currentUser]);

  useEffect(() => {
    if (selectedBrand) {
      setCompanyName(selectedBrand.name);
      setSegment(selectedBrand.segment);
      setContacts(selectedBrand.whatsapp || selectedBrand.phone || '');
      setWebsite(selectedBrand.website || '');
      setTargetAudience(selectedBrand.targetAudience || '');
      setTone(selectedBrand.toneOfVoice || 'Persuasivo e Profissional');
    }
  }, [selectedBrand]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('success', 'Copiado!', 'Texto copiado para a área de transferência.');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!companyName.trim() || !productOrService.trim()) {
      addToast('warning', 'Campos obrigatórios', 'Informe o nome da empresa e o produto/serviço.');
      return;
    }

    const cost = systemConfig?.copywritingCreditCost || 1;
    if (currentUser.credits < cost) {
      addToast('error', 'Créditos Insuficientes', `Você precisa de ${cost} crédito para gerar a campanha.`);
      return;
    }

    setIsGenerating(true);
    setCampaignResult(null);

    try {
      const res = await ApiService.generateCopywriting(currentUser.id, {
        companyName,
        segment,
        productOrService,
        benefits,
        targetAudience,
        priceOrOffer,
        contacts,
        website,
        objective,
        tone,
        platform
      });

      setCampaignResult(res);
      addToast('success', 'Campanha Criada!', 'Textos, títulos, legendas e roteiros gerados com sucesso.');
      refreshUserData();
    } catch (err: any) {
      let friendlyMsg = err.message || 'Falha ao gerar campanha.';
      if (friendlyMsg.includes('503') || friendlyMsg.includes('high demand') || friendlyMsg.includes('UNAVAILABLE')) {
        friendlyMsg = 'A API de IA estava com alta demanda momentânea. O motor resiliente foi ativado.';
      }
      addToast('error', 'Falha na Geração', friendlyMsg);
    } finally {
      setIsGenerating(false);
      refreshUserData();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Gemini 3.8 Flash
            </span>
            <span className="text-xs text-slate-400">Copywriting & Estratégia de Conteúdo</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Gerador de Anúncios Publicitários</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Crie títulos, textos curtos, legendas persuasivas e roteiros respeitando dados comerciais reais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2 text-xs">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Custo:</span>
            <strong className="text-amber-400">
              {systemConfig?.copywritingCreditCost || 1} crédito
            </strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (5/12) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>Dados Comerciais</span>
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Empresa / Marca *</label>
              <input
                type="text"
                placeholder="Ex: Pica-Pau Soluções"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Segmento</label>
                <input
                  type="text"
                  placeholder="Ex: Imobiliária"
                  value={segment}
                  onChange={e => setSegment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Plataforma</label>
                <select
                  value={platform}
                  onChange={e => setPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="instagram">Instagram & Facebook</option>
                  <option value="tiktok">TikTok & Reels</option>
                  <option value="google">Google Ads</option>
                  <option value="whatsapp">Disparos WhatsApp</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Produto ou Serviço *</label>
              <input
                type="text"
                placeholder="Ex: Consultoria de Gestão e Automação"
                value={productOrService}
                onChange={e => setProductOrService(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Principais Benefícios Reais</label>
              <textarea
                rows={2}
                placeholder="Ex: Aumento de 40% em agilidade, suporte dedicado 24/7, sem burocracia..."
                value={benefits}
                onChange={e => setBenefits(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Preço ou Condição</label>
                <input
                  type="text"
                  placeholder="Ex: Planos a partir de R$ 99/mês"
                  value={priceOrOffer}
                  onChange={e => setPriceOrOffer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="Ex: (11) 98765-4321"
                  value={contacts}
                  onChange={e => setContacts(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Público-Alvo</label>
              <input
                type="text"
                placeholder="Ex: Pequenos empresários e profissionais liberais"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Tom da Comunicação</label>
              <input
                type="text"
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Elaborando Estratégia de Conteúdo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Gerar Campanha Completa (1 Crédito)</span>
              </>
            )}
          </button>
        </form>

        {/* Right Output Display (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          {!campaignResult ? (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
              <Megaphone className="w-12 h-12 mx-auto text-slate-700" />
              <h3 className="font-bold text-white text-sm">Nenhum anúncio gerado ainda</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Preencha os dados comerciais da sua empresa ou cliente ao lado para produzir títulos, legendas, roteiros e prompts inteligentes.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Headlines */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Títulos de Alto Impacto (Headlines)</span>
                </h3>

                <div className="space-y-2">
                  {campaignResult.headlines?.map((h: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between group"
                    >
                      <span className="font-bold text-xs text-white">{h}</span>
                      <button
                        onClick={() => handleCopy(h, `h_${i}`)}
                        className="p-1.5 rounded text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        {copiedKey === `h_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Long Caption / Feed post */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <span>Legenda Completa para Redes Sociais</span>
                  </h3>
                  <button
                    onClick={() => handleCopy(campaignResult.longCaption, 'longCaption')}
                    className="p-1.5 rounded text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedKey === 'longCaption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {campaignResult.longCaption}
                </div>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {campaignResult.hashtags?.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* DALL-E 3 Image Prompt Suggestion */}
              {campaignResult.imagePromptSuggestion && (
                <div className="p-5 bg-slate-900 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span>Prompt Recomendado para o DALL-E 3</span>
                    </h3>
                    <button
                      onClick={() => handleCopy(campaignResult.imagePromptSuggestion, 'dallePrompt')}
                      className="p-1.5 rounded text-slate-400 hover:text-amber-400 transition-colors"
                    >
                      {copiedKey === 'dallePrompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed italic">
                    "{campaignResult.imagePromptSuggestion}"
                  </p>

                  <button
                    onClick={() => setActiveTab('image-studio')}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Ir para o Estúdio de Imagens com este Prompt</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
