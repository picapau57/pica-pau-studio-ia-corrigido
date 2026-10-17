import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  Globe, 
  Phone, 
  Sparkles, 
  Palette, 
  Image as ImageIcon,
  Check,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { BrandClient } from '../../types';

export const BrandsManagerView: React.FC = () => {
  const { currentUser, setSelectedBrand, setActiveTab, addToast } = useApp();

  const [brands, setBrands] = useState<BrandClient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [segment, setSegment] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0b132b');
  const [secondaryColor, setSecondaryColor] = useState('#f59e0b');
  const [accentColor, setAccentColor] = useState('#ef4444');
  const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('Profissional e Persuasivo');

  const loadBrands = async () => {
    if (!currentUser) return;
    try {
      const res = await ApiService.getBrands(currentUser.id);
      setBrands(res.brands || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [currentUser]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setSegment('');
    setDescription('');
    setPrimaryColor('#0b132b');
    setSecondaryColor('#f59e0b');
    setAccentColor('#ef4444');
    setFontFamily('Plus Jakarta Sans');
    setPhone('');
    setWhatsapp('');
    setWebsite('');
    setTargetAudience('');
    setToneOfVoice('Profissional e Persuasivo');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: BrandClient) => {
    setEditingId(brand.id);
    setName(brand.name);
    setSegment(brand.segment);
    setDescription(brand.description);
    setPrimaryColor(brand.primaryColor);
    setSecondaryColor(brand.secondaryColor);
    setAccentColor(brand.accentColor);
    setFontFamily(brand.fontFamily);
    setPhone(brand.phone);
    setWhatsapp(brand.whatsapp);
    setWebsite(brand.website);
    setTargetAudience(brand.targetAudience);
    setToneOfVoice(brand.toneOfVoice);
    setIsModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!name.trim()) {
      addToast('warning', 'Atenção', 'Nome da marca ou empresa é obrigatório.');
      return;
    }

    try {
      const payload: Partial<BrandClient> = {
        name,
        segment,
        description,
        primaryColor,
        secondaryColor,
        accentColor,
        fontFamily,
        phone,
        whatsapp,
        website,
        targetAudience,
        toneOfVoice
      };

      if (editingId) {
        await ApiService.updateBrand(currentUser.id, editingId, payload);
        addToast('success', 'Marca Atualizada', 'Os dados do Brand Kit foram atualizados com sucesso.');
      } else {
        await ApiService.createBrand(currentUser.id, payload);
        addToast('success', 'Marca Cadastrada', 'Novo Brand Kit cadastrado para produção criativa.');
      }

      setIsModalOpen(false);
      loadBrands();
    } catch (err: any) {
      addToast('error', 'Falha ao salvar', err.message);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!currentUser) return;
    try {
      await ApiService.deleteBrand(currentUser.id, id);
      setBrands(prev => prev.filter(b => b.id !== id));
      addToast('success', 'Marca Removida', 'Cliente removido da base de dados.');
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Brand Kits & Clientes
            </span>
            <span className="text-xs text-slate-400">Identidade Visual & Contatos</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Marcas e Clientes</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Cadastre os perfis dos seus clientes para aplicar automaticamente paleta de cores, logotipo e contatos.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Brands Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map(brand => (
          <div
            key={brand.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-md group"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-slate-800"
                    style={{ backgroundColor: brand.primaryColor }}
                  />
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                      {brand.name}
                    </h3>
                    <span className="text-xs text-slate-400">{brand.segment}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(brand)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {brand.description && (
                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {brand.description}
                </p>
              )}

              {/* Color Swatches */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  Paleta de Cores
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg border border-slate-700 shadow"
                    style={{ backgroundColor: brand.primaryColor }}
                    title={`Primária: ${brand.primaryColor}`}
                  />
                  <div
                    className="w-6 h-6 rounded-lg border border-slate-700 shadow"
                    style={{ backgroundColor: brand.secondaryColor }}
                    title={`Secundária: ${brand.secondaryColor}`}
                  />
                  <div
                    className="w-6 h-6 rounded-lg border border-slate-700 shadow"
                    style={{ backgroundColor: brand.accentColor }}
                    title={`Destaque: ${brand.accentColor}`}
                  />
                  <span className="text-[11px] text-slate-400 font-mono ml-2">
                    {brand.fontFamily}
                  </span>
                </div>
              </div>

              {/* Contacts */}
              <div className="mt-3 space-y-1 text-xs text-slate-300">
                {brand.phone && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{brand.phone}</span>
                  </div>
                )}
                {brand.website && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Globe className="w-3 h-3 text-blue-400" />
                    <span className="truncate">{brand.website}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => {
                setSelectedBrand(brand);
                setActiveTab('image-studio');
              }}
              className="w-full py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950" />
              <span>Criar Artes para este Cliente</span>
            </button>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingId ? 'Editar Marca / Cliente' : 'Novo Brand Kit de Cliente'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nome da Empresa / Cliente *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Restaurante Pica-Pau Grill"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Segmento Comercial</label>
                <input
                  type="text"
                  value={segment}
                  onChange={e => setSegment(e.target.value)}
                  placeholder="Ex: Gastronomia & Eventos"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Cor Primária</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-full h-9 bg-slate-950 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cor Secundária</label>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="w-full h-9 bg-slate-950 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cor Destaque</label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-full h-9 bg-slate-950 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      setWhatsapp(e.target.value);
                    }}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Site</label>
                  <input
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://empresa.com.br"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Público-Alvo</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  placeholder="Ex: Famílias e profissionais da região"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tom de Voz</label>
                <input
                  type="text"
                  value={toneOfVoice}
                  onChange={e => setToneOfVoice(e.target.value)}
                  placeholder="Ex: Acolhedor, dinâmico e focado em sabor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
