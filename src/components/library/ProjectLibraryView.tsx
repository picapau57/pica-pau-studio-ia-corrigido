import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Palette, 
  Plus, 
  Briefcase, 
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { ProjectItem, BrandClient } from '../../types';

export const ProjectLibraryView: React.FC = () => {
  const { currentUser, openInVisualEditor, addToast, setActiveTab } = useApp();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [brands, setBrands] = useState<BrandClient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadProjects = async () => {
    if (!currentUser) return;
    try {
      const [projRes, brandsRes] = await Promise.all([
        ApiService.getProjects(currentUser.id),
        ApiService.getBrands(currentUser.id)
      ]);
      setProjects(projRes.projects || []);
      setBrands(brandsRes.brands || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    try {
      await ApiService.deleteProject(currentUser.id, id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
      addToast('success', 'Projeto Excluído', 'O projeto foi removido com sucesso.');
    } catch (err: any) {
      addToast('error', 'Falha ao excluir', err.message);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clientName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = selectedFormat === 'all' || p.format === selectedFormat;
    const matchesClient = selectedClient === 'all' || p.clientId === selectedClient;
    return matchesSearch && matchesFormat && matchesClient;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Repositório Central
            </span>
            <span className="text-xs text-slate-400">Artes, Vídeos & Campanhas</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Biblioteca de Projetos</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Gerencie todos os materiais criados para suas marcas e clientes com filtros e exportação.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('image-studio')}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Criação</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome ou cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Format Filter */}
          <select
            value={selectedFormat}
            onChange={e => setSelectedFormat(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="all">Todos os Formatos</option>
            <option value="1:1">Quadrado (1:1)</option>
            <option value="9:16">Vertical Stories (9:16)</option>
            <option value="16:9">Horizontal (16:9)</option>
            <option value="4:5">Feed Retrato (4:5)</option>
          </select>

          {/* Client Filter */}
          <select
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="all">Todos os Clientes</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-16 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-700" />
          <h3 className="font-bold text-white text-sm">Nenhum projeto encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || selectedFormat !== 'all' || selectedClient !== 'all'
              ? 'Tente ajustar os filtros ou a busca acima.'
              : 'Você ainda não salvou nenhum projeto. Gere uma imagem ou crie uma composição no editor.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-md hover:shadow-xl"
            >
              <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Layers className="w-8 h-8 text-slate-700" />
                )}
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-amber-300 border border-slate-800">
                  {project.format}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                    <Briefcase className="w-3 h-3 text-amber-400" />
                    <span className="truncate">{project.clientName || 'Cliente Geral'}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {project.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => openInVisualEditor(project)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Palette className="w-3 h-3 text-amber-400" />
                    <span>Abrir Editor</span>
                  </button>

                  {deleteConfirmId === project.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1.5 py-1 text-slate-400 hover:text-white text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(project.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Excluir projeto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
