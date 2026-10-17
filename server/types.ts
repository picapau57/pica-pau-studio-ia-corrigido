/**
 * Types and interfaces for Pica-Pau Studio IA
 */

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  credits: number;
  plan: 'free' | 'pro' | 'agency' | 'enterprise';
  createdAt: string;
  avatarUrl?: string;
  active: boolean;
  companyName?: string;
}

export type CreditOperationType = 
  | 'dalle3_standard' 
  | 'dalle3_hd' 
  | 'gemini_copywriting' 
  | 'video_scene' 
  | 'credit_recharge' 
  | 'admin_adjustment' 
  | 'refund';

export type CreditTransactionStatus = 'reserved' | 'completed' | 'refunded' | 'failed';

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // positive for additions, negative for deductions
  operationType: CreditOperationType;
  status: CreditTransactionStatus;
  description: string;
  model: string;
  costUsdEstimated: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface BrandClient {
  id: string;
  userId: string;
  name: string;
  segment: string;
  description: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  phone: string;
  whatsapp: string;
  website: string;
  targetAudience: string;
  toneOfVoice: string;
  createdAt: string;
}

export interface CanvasLayer {
  id: string;
  type: 'image' | 'text' | 'badge' | 'logo' | 'shape';
  content: string; // text string, image URL, or svg shape
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width?: number; // percentage 0-100
  height?: number; // percentage 0-100
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: number;
  rotation?: number;
  opacity?: number;
  zIndex: number;
}

export type ProjectFormat = '1:1' | '9:16' | '16:9' | '4:5';

export interface ProjectItem {
  id: string;
  userId: string;
  clientId?: string;
  clientName?: string;
  title: string;
  format: ProjectFormat;
  type: 'image' | 'video' | 'campaign';
  thumbnailUrl: string;
  sourceImageUrl?: string;
  layers: CanvasLayer[];
  commercialData?: {
    price?: string;
    phone?: string;
    cta?: string;
    product?: string;
    headline?: string;
  };
  promptUsed?: string;
  modelUsed?: string;
  status: 'draft' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface VideoScene {
  id: string;
  order: number;
  durationSeconds: number;
  visualPrompt: string;
  narrationText: string;
  headlineText?: string;
  status: 'pending' | 'queued' | 'generating' | 'completed' | 'failed';
  videoUrl?: string;
  imageUrl?: string;
  errorMessage?: string;
}

export interface VideoTask {
  id: string;
  userId: string;
  clientId?: string;
  title: string;
  description: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  scenes: VideoScene[];
  voiceType: string;
  bgMusic: string;
  hasSubtitles: boolean;
  status: 'queued' | 'generating' | 'processing' | 'completed' | 'failed';
  progressPercentage: number;
  outputVideoUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemConfig {
  openaiApiKeyConfigured: boolean;
  geminiApiKeyConfigured: boolean;
  dalle3StandardCreditCost: number;
  dalle3HdCreditCost: number;
  copywritingCreditCost: number;
  videoSceneCreditCost: number;
  maintenanceMode: boolean;
  maxConcurrentTasks: number;
}
