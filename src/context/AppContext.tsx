import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, SystemConfig, BrandClient, ProjectItem } from '../types';
import { ApiService } from '../services/api';

export type NavigationTab = 
  | 'dashboard' 
  | 'image-studio' 
  | 'video-studio' 
  | 'ad-campaign' 
  | 'visual-editor' 
  | 'library' 
  | 'brands' 
  | 'credits' 
  | 'profile' 
  | 'admin' 
  | 'plans' 
  | 'institutional';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  systemConfig: SystemConfig | null;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedBrand: BrandClient | null;
  setSelectedBrand: (brand: BrandClient | null) => void;
  editorProject: Partial<ProjectItem> | null;
  setEditorProject: (proj: Partial<ProjectItem> | null) => void;
  openInVisualEditor: (proj: Partial<ProjectItem>) => void;
  refreshUserData: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
  removeToast: (id: string) => void;
  isLoading: boolean;
  switchUserRole: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedBrand, setSelectedBrand] = useState<BrandClient | null>(null);
  const [editorProject, setEditorProject] = useState<Partial<ProjectItem> | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const addToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      const data = await ApiService.getMe(currentUser?.id);
      setCurrentUser(data.user);
      setSystemConfig(data.config);
    } catch (err) {
      console.error('Erro ao atualizar dados do usuário:', err);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const storedUserId = localStorage.getItem('picapau_user_id') || 'usr_admin_01';
        const data = await ApiService.getMe(storedUserId);
        setCurrentUser(data.user);
        setSystemConfig(data.config);
      } catch (err) {
        console.error('Inicialização:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const openInVisualEditor = useCallback((proj: Partial<ProjectItem>) => {
    setEditorProject(proj);
    setActiveTab('visual-editor');
  }, []);

  const switchUserRole = useCallback(async () => {
    if (!currentUser) return;
    try {
      // Toggle between admin and a standard user
      const targetEmail = currentUser.role === 'admin' ? 'cliente.demo@empresa.com' : 'picapauinformatica@gmail.com';
      try {
        const res = await ApiService.login(targetEmail);
        setCurrentUser(res.user);
        localStorage.setItem('picapau_user_id', res.user.id);
        addToast('info', 'Perfil alternado', `Agora operando como ${res.user.name} (${res.user.role === 'admin' ? 'Administrador' : 'Usuário Padrão'})`);
      } catch {
        // If demo user doesn't exist yet, create it
        const registered = await ApiService.register('Cliente Empresa Demo', 'cliente.demo@empresa.com', 'Restaurante & Pizzaria Sabor');
        setCurrentUser(registered.user);
        localStorage.setItem('picapau_user_id', registered.user.id);
        addToast('info', 'Perfil de usuário criado', 'Alternado para perfil de usuário padrão (50 créditos).');
      }
    } catch (err: any) {
      addToast('error', 'Erro ao alternar perfil', err.message);
    }
  }, [currentUser, addToast]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        systemConfig,
        activeTab,
        setActiveTab,
        selectedBrand,
        setSelectedBrand,
        editorProject,
        setEditorProject,
        openInVisualEditor,
        refreshUserData,
        toasts,
        addToast,
        removeToast,
        isLoading,
        switchUserRole
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser utilizado dentro de AppProvider');
  return context;
};
