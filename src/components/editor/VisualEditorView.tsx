import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Layers, 
  Plus, 
  Trash2, 
  Copy, 
  Undo, 
  Redo, 
  Download, 
  Save, 
  Type, 
  Image as ImageIcon, 
  Sliders, 
  Move, 
  Maximize, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  Check,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CanvasLayer, ProjectFormat, ProjectItem } from '../../types';
import { ApiService } from '../../services/api';

export const VisualEditorView: React.FC = () => {
  const { currentUser, editorProject, addToast, setActiveTab, selectedBrand } = useApp();

  const [title, setTitle] = useState(editorProject?.title || 'Arte Publicitária');
  const [format, setFormat] = useState<ProjectFormat>(editorProject?.format || '1:1');
  const [layers, setLayers] = useState<CanvasLayer[]>(editorProject?.layers || []);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<CanvasLayer[][]>([editorProject?.layers || []]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editorProject?.layers && editorProject.layers.length > 0) {
      setLayers(editorProject.layers);
      setHistory([editorProject.layers]);
      setHistoryIndex(0);
      if (editorProject.title) setTitle(editorProject.title);
      if (editorProject.format) setFormat(editorProject.format);
    }
  }, [editorProject]);

  const pushHistory = (newLayers: CanvasLayer[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newLayers);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setLayers(newLayers);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayers(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayers(history[historyIndex + 1]);
    }
  };

  // Layer CRUD
  const handleAddTextLayer = (type: 'title' | 'price' | 'cta') => {
    const id = `layer_${Date.now()}`;
    let newLayer: CanvasLayer;

    if (type === 'price') {
      newLayer = {
        id,
        type: 'text',
        content: 'R$ 99,90',
        x: 10,
        y: 70,
        fontSize: 32,
        color: selectedBrand?.secondaryColor || '#f59e0b',
        fontWeight: '900',
        zIndex: layers.length + 1
      };
    } else if (type === 'cta') {
      newLayer = {
        id,
        type: 'badge',
        content: 'COMPRE PELO WHATSAPP',
        x: 10,
        y: 84,
        fontSize: 16,
        color: '#0b132b',
        backgroundColor: selectedBrand?.secondaryColor || '#f59e0b',
        fontWeight: 'bold',
        borderRadius: 8,
        zIndex: layers.length + 1
      };
    } else {
      newLayer = {
        id,
        type: 'text',
        content: 'SEU TÍTULO AQUI',
        x: 10,
        y: 15,
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold',
        zIndex: layers.length + 1
      };
    }

    pushHistory([...layers, newLayer]);
    setSelectedLayerId(id);
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const updateSelectedLayer = (updates: Partial<CanvasLayer>) => {
    if (!selectedLayerId) return;
    const newLayers = layers.map(l => (l.id === selectedLayerId ? { ...l, ...updates } : l));
    pushHistory(newLayers);
  };

  const handleDeleteLayer = (id: string) => {
    const newLayers = layers.filter(l => l.id !== id);
    pushHistory(newLayers);
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const handleDuplicateLayer = (id: string) => {
    const target = layers.find(l => l.id === id);
    if (!target) return;
    const duplicate: CanvasLayer = {
      ...target,
      id: `layer_${Date.now()}`,
      x: Math.min(target.x + 5, 80),
      y: Math.min(target.y + 5, 80),
      zIndex: layers.length + 1
    };
    pushHistory([...layers, duplicate]);
    setSelectedLayerId(duplicate.id);
  };

  const handleBringForward = (id: string) => {
    const newLayers = [...layers];
    const idx = newLayers.findIndex(l => l.id === id);
    if (idx < newLayers.length - 1) {
      const temp = newLayers[idx];
      newLayers[idx] = newLayers[idx + 1];
      newLayers[idx + 1] = temp;
      newLayers.forEach((l, i) => { l.zIndex = i + 1; });
      pushHistory(newLayers);
    }
  };

  const handleSendBackward = (id: string) => {
    const newLayers = [...layers];
    const idx = newLayers.findIndex(l => l.id === id);
    if (idx > 0) {
      const temp = newLayers[idx];
      newLayers[idx] = newLayers[idx - 1];
      newLayers[idx - 1] = temp;
      newLayers.forEach((l, i) => { l.zIndex = i + 1; });
      pushHistory(newLayers);
    }
  };

  // Save project to backend
  const handleSaveProject = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const bgImg = layers.find(l => l.type === 'image')?.content || '';
      await ApiService.saveProject(currentUser.id, {
        id: editorProject?.id,
        title,
        format,
        type: 'image',
        thumbnailUrl: bgImg || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
        sourceImageUrl: bgImg,
        layers,
        clientId: selectedBrand?.id,
        clientName: selectedBrand?.name,
        status: 'completed'
      });
      addToast('success', 'Projeto Salvo', 'Sua composição foi guardada na Biblioteca de Projetos.');
    } catch (err: any) {
      addToast('error', 'Falha ao salvar', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // High quality Real Canvas render & download
  const handleExportCanvas = (exportFormat: 'png' | 'jpeg') => {
    const canvas = document.createElement('canvas');
    let width = 1080;
    let height = 1080;

    if (format === '9:16') {
      width = 1080;
      height = 1920;
    } else if (format === '16:9') {
      width = 1920;
      height = 1080;
    } else if (format === '4:5') {
      width = 1080;
      height = 1350;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background default dark
    ctx.fillStyle = '#0b132b';
    ctx.fillRect(0, 0, width, height);

    // Render layers sorted by zIndex
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const bgImageLayer = sorted.find(l => l.type === 'image');

    const renderElements = () => {
      sorted.forEach(l => {
        if (l.type === 'image') return; // already drawn

        const x = (l.x / 100) * width;
        const y = (l.y / 100) * height;
        const scaleFactor = width / 400; // relative to preview canvas
        const fontSize = (l.fontSize || 20) * scaleFactor;

        ctx.font = `${l.fontWeight || 'bold'} ${fontSize}px sans-serif`;

        if (l.type === 'badge' && l.backgroundColor) {
          const textMetrics = ctx.measureText(l.content);
          const padX = 14 * scaleFactor;
          const padY = 8 * scaleFactor;
          ctx.fillStyle = l.backgroundColor;
          ctx.beginPath();
          ctx.roundRect(x, y - fontSize, textMetrics.width + padX * 2, fontSize + padY * 2, 8 * scaleFactor);
          ctx.fill();

          ctx.fillStyle = l.color || '#ffffff';
          ctx.fillText(l.content, x + padX, y + padY);
        } else {
          // Text with drop shadow
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 8 * scaleFactor;
          ctx.fillStyle = l.color || '#ffffff';
          ctx.fillText(l.content, x, y);
          ctx.shadowBlur = 0;
        }
      });

      const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${exportFormat}`;
      link.click();
      addToast('success', 'Exportação Concluída', `Arte salva em ${exportFormat.toUpperCase()}.`);
    };

    if (bgImageLayer?.content) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        renderElements();
      };
      img.onerror = () => {
        renderElements();
      };
      img.src = bgImageLayer.content;
    } else {
      renderElements();
    }
  };

  const getAspectRatioClasses = () => {
    switch (format) {
      case '9:16':
        return 'aspect-[9/16] max-h-[580px]';
      case '16:9':
        return 'aspect-[16/9] max-h-[380px]';
      case '4:5':
        return 'aspect-[4/5] max-h-[540px]';
      case '1:1':
      default:
        return 'aspect-square max-h-[480px]';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Bar with Title, Proportions, Undo/Redo & Save */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-transparent font-black text-lg text-white border-b border-transparent hover:border-slate-700 focus:border-amber-400 focus:outline-none"
            />
            <p className="text-xs text-slate-400">Editor Visual de Artes Publicitárias</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Formats */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            {(['1:1', '9:16', '16:9', '4:5'] as ProjectFormat[]).map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  format === f ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-40"
              title="Desfazer"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-40"
              title="Refazer"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Save & Export */}
          <button
            onClick={handleSaveProject}
            disabled={isSaving}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>

          <button
            onClick={() => handleExportCanvas('png')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Exportar PNG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Toolbar (Layer additions & layer stack) - 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Inserir Elementos</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleAddTextLayer('title')}
                className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs text-white font-semibold flex items-center gap-2 transition-colors"
              >
                <Type className="w-4 h-4 text-blue-400" />
                <span>+ Texto / Título</span>
              </button>

              <button
                onClick={() => handleAddTextLayer('price')}
                className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs text-white font-semibold flex items-center gap-2 transition-colors"
              >
                <span className="font-black text-amber-400 text-sm">$</span>
                <span>+ Preço em Destaque</span>
              </button>

              <button
                onClick={() => handleAddTextLayer('cta')}
                className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-xs text-white font-semibold flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>+ Botão / Selo de CTA</span>
              </button>
            </div>
          </div>

          {/* Layer List */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Camadas ({layers.length})</span>
              <Layers className="w-3.5 h-3.5 text-amber-400" />
            </h3>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {[...layers].reverse().map(l => (
                <div
                  key={l.id}
                  onClick={() => setSelectedLayerId(l.id)}
                  className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    selectedLayerId === l.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="truncate max-w-[130px]">
                    {l.type === 'image' ? 'Imagem de Fundo' : l.content}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); handleDuplicateLayer(l.id); }}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Duplicar"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {l.type !== 'image' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteLayer(l.id); }}
                        className="p-1 text-slate-400 hover:text-red-400"
                        title="Excluir"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Canvas Viewport - 6 cols */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-3xl p-6 min-h-[500px]">
          <div
            ref={canvasRef}
            className={`relative bg-slate-950 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl w-full mx-auto select-none ${getAspectRatioClasses()}`}
          >
            {layers.map(layer => {
              if (layer.type === 'image') {
                return (
                  <img
                    key={layer.id}
                    src={layer.content}
                    alt="Canvas Background"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ zIndex: layer.zIndex }}
                  />
                );
              }

              const isSelected = selectedLayerId === layer.id;

              return (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayerId(layer.id)}
                  style={{
                    position: 'absolute',
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    fontSize: `${layer.fontSize || 20}px`,
                    color: layer.color || '#ffffff',
                    backgroundColor: layer.type === 'badge' ? layer.backgroundColor || '#ef4444' : 'transparent',
                    padding: layer.type === 'badge' ? '6px 14px' : '0',
                    borderRadius: layer.type === 'badge' ? `${layer.borderRadius || 6}px` : '0',
                    fontWeight: layer.fontWeight || 'bold',
                    zIndex: layer.zIndex,
                    cursor: 'grab'
                  }}
                  className={`transition-shadow ${
                    isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black rounded' : ''
                  }`}
                >
                  {layer.content}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Inspector & Settings - 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          {selectedLayer && selectedLayer.type !== 'image' ? (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 animate-in fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Propriedades do Elemento</span>
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
              </h3>

              {/* Text content edit */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Conteúdo do Texto</label>
                <textarea
                  rows={2}
                  value={selectedLayer.content}
                  onChange={e => updateSelectedLayer({ content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Position controls */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block">Posição X (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={selectedLayer.x}
                    onChange={e => updateSelectedLayer({ x: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">{selectedLayer.x}%</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Posição Y (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={selectedLayer.y}
                    onChange={e => updateSelectedLayer({ y: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-400">{selectedLayer.y}%</span>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Tamanho da Fonte ({selectedLayer.fontSize}px)
                </label>
                <input
                  type="range"
                  min="12"
                  max="64"
                  value={selectedLayer.fontSize || 20}
                  onChange={e => updateSelectedLayer({ fontSize: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Color picker */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Cor do Texto</label>
                  <input
                    type="color"
                    value={selectedLayer.color || '#ffffff'}
                    onChange={e => updateSelectedLayer({ color: e.target.value })}
                    className="w-full h-8 bg-slate-950 rounded cursor-pointer"
                  />
                </div>
                {selectedLayer.type === 'badge' && (
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Cor do Fundo</label>
                    <input
                      type="color"
                      value={selectedLayer.backgroundColor || '#ef4444'}
                      onChange={e => updateSelectedLayer({ backgroundColor: e.target.value })}
                      className="w-full h-8 bg-slate-950 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Layer order */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleBringForward(selectedLayer.id)}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200 flex items-center justify-center gap-1"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Para Frente</span>
                </button>
                <button
                  onClick={() => handleSendBackward(selectedLayer.id)}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200 flex items-center justify-center gap-1"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Para Trás</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500 space-y-2">
              <Sliders className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">Selecione um elemento na arte para ajustar fontes, cores e posição.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
