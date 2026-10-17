import { 
  User, 
  BrandClient, 
  ProjectItem, 
  VideoTask, 
  SystemConfig, 
  CreditTransaction 
} from '../types';

export class ApiService {
  private static getHeaders(userId?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (userId) {
      headers['x-user-id'] = userId;
    }
    return headers;
  }

  // Auth & Profile
  static async getMe(userId?: string): Promise<{ user: User; config: SystemConfig }> {
    const res = await fetch('/api/auth/me', {
      headers: this.getHeaders(userId),
    });
    if (!res.ok) throw new Error('Falha ao autenticar');
    return res.json();
  }

  static async login(email: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao realizar login');
    return data;
  }

  static async register(name: string, email: string, companyName?: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, email, companyName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao registrar');
    return data;
  }

  // OpenAI DALL-E 3 Image Generation
  static async generateDalle3Image(params: {
    userId: string;
    prompt: string;
    aspectRatio: string;
    quality: 'standard' | 'hd';
    style?: string;
    clientName?: string;
    segment?: string;
    headline?: string;
    price?: string;
    cta?: string;
    phone?: string;
    engine?: 'auto' | 'dalle3' | 'creative';
  }) {
    const res = await fetch('/api/images/generate', {
      method: 'POST',
      headers: this.getHeaders(params.userId),
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  }

  static async enhancePrompt(prompt: string, style: string, segment?: string) {
    const res = await fetch('/api/images/enhance-prompt', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt, style, segment }),
    });
    if (!res.ok) throw new Error('Falha ao aprimorar prompt');
    return res.json();
  }

  // AI Copywriting
  static async generateCopywriting(userId: string, data: any) {
    const res = await fetch('/api/ai/copywrite', {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Falha ao gerar textos publicitários');
    return result;
  }

  // Video Pipeline
  static async getVideos(userId: string): Promise<{ tasks: VideoTask[] }> {
    const res = await fetch('/api/videos', {
      headers: this.getHeaders(userId),
    });
    return res.json();
  }

  static async createVideo(userId: string, data: any): Promise<{ task: VideoTask }> {
    const res = await fetch('/api/videos/create', {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Falha ao criar tarefa de vídeo');
    return result;
  }

  static async processVideo(userId: string, taskId: string): Promise<{ task: VideoTask }> {
    const res = await fetch(`/api/videos/process/${taskId}`, {
      method: 'POST',
      headers: this.getHeaders(userId),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Falha ao iniciar processamento do vídeo');
    return result;
  }

  // Brands / Clients
  static async getBrands(userId: string): Promise<{ brands: BrandClient[] }> {
    const res = await fetch('/api/brands', {
      headers: this.getHeaders(userId),
    });
    return res.json();
  }

  static async createBrand(userId: string, brand: Partial<BrandClient>): Promise<{ brand: BrandClient }> {
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(brand),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao salvar marca');
    return data;
  }

  static async updateBrand(userId: string, id: string, brand: Partial<BrandClient>): Promise<{ brand: BrandClient }> {
    const res = await fetch(`/api/brands/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify(brand),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao atualizar marca');
    return data;
  }

  static async deleteBrand(userId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/brands/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(userId),
    });
    return res.json();
  }

  // Projects
  static async getProjects(userId: string): Promise<{ projects: ProjectItem[] }> {
    const res = await fetch('/api/projects', {
      headers: this.getHeaders(userId),
    });
    return res.json();
  }

  static async saveProject(userId: string, project: Partial<ProjectItem>): Promise<{ project: ProjectItem }> {
    const url = project.id ? `/api/projects/${project.id}` : '/api/projects';
    const method = project.id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: this.getHeaders(userId),
      body: JSON.stringify(project),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao salvar projeto');
    return data;
  }

  static async deleteProject(userId: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(userId),
    });
    return res.json();
  }

  // Credits
  static async getCreditHistory(userId: string): Promise<{ currentBalance: number; transactions: CreditTransaction[] }> {
    const res = await fetch('/api/credits/history', {
      headers: this.getHeaders(userId),
    });
    return res.json();
  }

  static async rechargeCredits(userId: string, amount: number, packageTitle: string) {
    const res = await fetch('/api/credits/recharge', {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify({ amount, packageTitle }),
    });
    return res.json();
  }

  // Admin
  static async getAdminOverview(userId: string) {
    const res = await fetch('/api/admin/overview', {
      headers: this.getHeaders(userId),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Acesso negado');
    return data;
  }

  static async updateAdminConfig(userId: string, updates: any, customOpenAiKey?: string, customGeminiKey?: string) {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify({ updates, customOpenAiKey, customGeminiKey }),
    });
    return res.json();
  }

  static async adjustUserCredits(adminId: string, targetUserId: string, amount: number, reason: string) {
    const res = await fetch(`/api/admin/users/${targetUserId}/adjust-credits`, {
      method: 'POST',
      headers: this.getHeaders(adminId),
      body: JSON.stringify({ amount, reason }),
    });
    return res.json();
  }

  static async toggleUserStatus(adminId: string, targetUserId: string) {
    const res = await fetch(`/api/admin/users/${targetUserId}/toggle-status`, {
      method: 'POST',
      headers: this.getHeaders(adminId),
    });
    return res.json();
  }

  static async testOpenAiKey(adminId: string, apiKey?: string): Promise<{ valid: boolean; message: string; advice?: string }> {
    const res = await fetch('/api/admin/test-openai-key', {
      method: 'POST',
      headers: this.getHeaders(adminId),
      body: JSON.stringify({ apiKey }),
    });
    return res.json();
  }
}
