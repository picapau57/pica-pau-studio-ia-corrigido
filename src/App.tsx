import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ImageStudioView } from './components/images/ImageStudioView';
import { VideoStudioView } from './components/videos/VideoStudioView';
import { AdCampaignView } from './components/copywriter/AdCampaignView';
import { VisualEditorView } from './components/editor/VisualEditorView';
import { ProjectLibraryView } from './components/library/ProjectLibraryView';
import { BrandsManagerView } from './components/brands/BrandsManagerView';
import { CreditsManagerView } from './components/credits/CreditsManagerView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminPanelView } from './components/admin/AdminPanelView';
import { PlansPricingView } from './components/plans/PlansPricingView';
import { LandingPageView } from './components/institutional/LandingPageView';

const MainContent: React.FC = () => {
  const { activeTab, isLoading } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center font-black text-slate-950 text-xl animate-pulse">
          PP
        </div>
        <p className="text-xs font-semibold text-slate-400">Carregando Pica-Pau Studio IA...</p>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'image-studio':
        return <ImageStudioView />;
      case 'video-studio':
        return <VideoStudioView />;
      case 'ad-campaign':
        return <AdCampaignView />;
      case 'visual-editor':
        return <VisualEditorView />;
      case 'library':
        return <ProjectLibraryView />;
      case 'brands':
        return <BrandsManagerView />;
      case 'credits':
        return <CreditsManagerView />;
      case 'profile':
        return <ProfileView />;
      case 'admin':
        return <AdminPanelView />;
      case 'plans':
        return <PlansPricingView />;
      case 'institutional':
        return <LandingPageView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070c14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-400 selection:text-slate-950">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090e17] to-[#060910]">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
