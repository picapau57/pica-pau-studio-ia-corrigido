import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { 
  User, 
  CreditTransaction, 
  BrandClient, 
  ProjectItem, 
  VideoTask, 
  SystemConfig,
  CreditOperationType 
} from './types.js';

// ---------------------------------------------------------------------------
// Persistência
//  - Local (npm run dev / start): arquivo data/studio_db.json
//  - Vercel COM Redis (Upstash, via Marketplace): banco persistente (recomendado)
//  - Vercel SEM Redis: /tmp (temporário — os dados somem com frequência)
// ---------------------------------------------------------------------------
const ON_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = ON_VERCEL ? '/tmp/picapau-data' : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'studio_db.json');

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const REDIS_KEY = 'picapau:studio_db';
const redis: Redis | null = REDIS_URL && REDIS_TOKEN ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

export const persistenceMode: 'redis' | 'file' = redis ? 'redis' : 'file';

// Memory store
interface DatabaseSchema {
  users: User[];
  transactions: CreditTransaction[];
  brands: BrandClient[];
  projects: ProjectItem[];
  videoTasks: VideoTask[];
  config: SystemConfig;
  customOpenAiKey?: string;
  customGeminiKey?: string;
}

const defaultAdminUser: User = {
  id: 'usr_admin_01',
  name: 'Proprietário Pica-Pau',
  email: 'picapauinformatica@gmail.com',
  role: 'admin',
  credits: 500,
  plan: 'agency',
  active: true,
  companyName: 'Pica-Pau Soluções Criativas',
  createdAt: new Date().toISOString(),
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
};

const defaultDemoClient: BrandClient = {
  id: 'brand_01',
  userId: 'usr_admin_01',
  name: 'Pica-Pau Informática & Tech',
  segment: 'Tecnologia & Serviços Digitais',
  description: 'Empresa especializada em soluções de alta performance tecnológica e marketing digital.',
  primaryColor: '#0b132b',
  secondaryColor: '#f59e0b',
  accentColor: '#ef4444',
  fontFamily: 'Plus Jakarta Sans',
  phone: '(11) 98765-4321',
  whatsapp: '11987654321',
  website: 'https://picapau.com.br',
  targetAudience: 'Empreendedores, PMEs e clientes que buscam inovação e suporte ágil.',
  toneOfVoice: 'Moderno, confiante, acolhedor e focado em resultados.',
  createdAt: new Date().toISOString(),
};

const defaultSampleProject: ProjectItem = {
  id: 'proj_sample_01',
  userId: 'usr_admin_01',
  clientId: 'brand_01',
  clientName: 'Pica-Pau Informática & Tech',
  title: 'Campanha Black Friday - Upgrade Tecnológico',
  format: '1:1',
  type: 'image',
  thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
  sourceImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1024&q=80',
  commercialData: {
    headline: 'SUPER OFERTA DE TECNOLOGIA',
    product: 'Estação de Trabalho Pro Max',
    price: 'A partir de R$ 3.899',
    cta: 'Peça Já pelo WhatsApp!',
    phone: '(11) 98765-4321'
  },
  layers: [
    {
      id: 'layer_bg',
      type: 'image',
      content: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1024&q=80',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: 1
    },
    {
      id: 'layer_badge',
      type: 'badge',
      content: 'OFERTA EXCLUSIVA',
      x: 10,
      y: 10,
      fontSize: 16,
      color: '#ffffff',
      backgroundColor: '#ef4444',
      fontWeight: 'bold',
      zIndex: 10
    },
    {
      id: 'layer_title',
      type: 'text',
      content: 'ESTAÇÃO DE TRABALHO PRO MAX',
      x: 10,
      y: 22,
      fontSize: 26,
      color: '#ffffff',
      fontWeight: '800',
      zIndex: 11
    },
    {
      id: 'layer_price',
      type: 'text',
      content: 'R$ 3.899,00',
      x: 10,
      y: 75,
      fontSize: 32,
      color: '#f59e0b',
      fontWeight: '900',
      zIndex: 12
    },
    {
      id: 'layer_cta',
      type: 'badge',
      content: 'WHATSAPP: (11) 98765-4321',
      x: 10,
      y: 86,
      fontSize: 18,
      color: '#0b132b',
      backgroundColor: '#f59e0b',
      fontWeight: 'bold',
      zIndex: 13
    }
  ],
  status: 'completed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

let db: DatabaseSchema = {
  users: [defaultAdminUser],
  transactions: [
    {
      id: 'tx_init_01',
      userId: 'usr_admin_01',
      amount: 500,
      operationType: 'credit_recharge',
      status: 'completed',
      description: 'Créditos iniciais da conta Agência',
      model: 'system',
      costUsdEstimated: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  brands: [defaultDemoClient],
  projects: [defaultSampleProject],
  videoTasks: [],
  config: {
    openaiApiKeyConfigured: false,
    geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    dalle3StandardCreditCost: 8,
    dalle3HdCreditCost: 15,
    copywritingCreditCost: 1,
    videoSceneCreditCost: 20,
    maintenanceMode: false,
    maxConcurrentTasks: 4
  }
};

function applyParsed(parsed: any): void {
  if (parsed && Array.isArray(parsed.users)) {
    db = {
      ...db,
      ...parsed,
      config: {
        ...db.config,
        ...(parsed.config || {}),
        openaiApiKeyConfigured: Boolean(sanitizeApiKey(parsed.customOpenAiKey) || sanitizeApiKey(process.env.OPENAI_API_KEY)),
        geminiApiKeyConfigured: Boolean(process.env.GEMINI_API_KEY || parsed.customGeminiKey)
      }
    };
  }
}

// Initialize persistence (arquivo local)
function loadDb(): void {
  if (redis) return; // no modo Redis o carregamento é feito por hydrateDb() a cada requisição
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      applyParsed(JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')));
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Falha ao carregar banco local:', err);
  }
}

// Escritas pendentes no Redis (aguardadas antes de responder, p/ a Vercel não congelar a função)
let pendingWrite: Promise<unknown> = Promise.resolve();

function saveDb(): void {
  if (redis) {
    const snapshot = JSON.stringify(db);
    pendingWrite = pendingWrite
      .then(() => redis.set(REDIS_KEY, snapshot))
      .catch((err) => console.error('Falha ao salvar no Redis:', err));
    return;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Falha ao salvar banco local:', err);
  }
}

/** Carrega o estado mais recente do Redis (no-op em modo arquivo). */
export async function hydrateDb(): Promise<void> {
  if (!redis) return;
  try {
    await pendingWrite;
    const raw = await redis.get<unknown>(REDIS_KEY);
    if (raw) {
      applyParsed(typeof raw === 'string' ? JSON.parse(raw) : raw);
    } else {
      saveDb(); // primeiro acesso: grava o banco inicial
    }
  } catch (err) {
    console.error('Falha ao carregar do Redis:', err);
  }
}

/** Aguarda todas as gravações pendentes terminarem. */
export async function flushDb(): Promise<void> {
  await pendingWrite;
}

loadDb();

// Mutex / atomic transaction lock helper
class CreditMutex {
  private static locks: Map<string, Promise<void>> = new Map();

  static async runExclusive<T>(userId: string, fn: () => Promise<T> | T): Promise<T> {
    const prevLock = this.locks.get(userId) || Promise.resolve();
    let release: () => void = () => {};
    const newLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.locks.set(userId, prevLock.then(() => newLock));

    try {
      await prevLock;
      return await fn();
    } finally {
      release();
      if (this.locks.get(userId) === newLock) {
        this.locks.delete(userId);
      }
    }
  }
}

export function sanitizeApiKey(key?: string): string | undefined {
  if (!key) return undefined;
  const trimmed = key.trim();
  if (trimmed.includes('$OPENAI_API_KEY') || trimmed.includes('$ORGANIZATION_ID')) {
    return undefined;
  }
  const match = trimmed.match(/sk-[a-zA-Z0-9_\-]{20,}/);
  if (match) {
    return match[0];
  }
  if (!trimmed.startsWith('sk-')) {
    return undefined;
  }
  return trimmed;
}

export const Database = {
  // Config
  getConfig(): SystemConfig {
    return {
      ...db.config,
      openaiApiKeyConfigured: Boolean(this.getEffectiveOpenAiKey()),
      geminiApiKeyConfigured: Boolean(this.getEffectiveGeminiKey())
    };
  },

  updateConfig(updates: Partial<SystemConfig>, customOpenAiKey?: string, customGeminiKey?: string): SystemConfig {
    db.config = { ...db.config, ...updates };
    if (customOpenAiKey !== undefined) {
      db.customOpenAiKey = customOpenAiKey.trim();
    }
    if (customGeminiKey !== undefined) {
      db.customGeminiKey = customGeminiKey.trim();
    }
    db.config.openaiApiKeyConfigured = Boolean(this.getEffectiveOpenAiKey());
    db.config.geminiApiKeyConfigured = Boolean(this.getEffectiveGeminiKey());
    saveDb();
    return this.getConfig();
  },

  getEffectiveOpenAiKey(): string | undefined {
    return sanitizeApiKey(db.customOpenAiKey) || sanitizeApiKey(process.env.OPENAI_API_KEY);
  },

  getEffectiveGeminiKey(): string | undefined {
    return process.env.GEMINI_API_KEY || db.customGeminiKey;
  },

  // Users
  getUserById(userId: string): User | undefined {
    return db.users.find(u => u.id === userId);
  },

  getUserByEmail(email: string): User | undefined {
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getAllUsers(): User[] {
    return db.users;
  },

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDb();
    return newUser;
  },

  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return undefined;
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    saveDb();
    return db.users[userIndex];
  },

  // ATOMIC CREDIT MANAGEMENT
  async atomicReserveCredits(
    userId: string,
    amount: number,
    operationType: CreditOperationType,
    model: string,
    description: string,
    costUsdEstimated: number,
    metadata?: Record<string, any>
  ): Promise<{ transactionId: string; remainingCredits: number }> {
    return CreditMutex.runExclusive(userId, async () => {
      const user = db.users.find(u => u.id === userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      if (!user.active) {
        throw new Error('Conta de usuário inativa ou suspensa');
      }
      if (user.credits < amount) {
        throw new Error(`Saldo de créditos insuficiente. Necessário: ${amount}, Disponível: ${user.credits}`);
      }

      // Deduct atomically
      user.credits -= amount;

      const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const transaction: CreditTransaction = {
        id: txId,
        userId,
        amount: -amount,
        operationType,
        status: 'reserved',
        description,
        model,
        costUsdEstimated,
        metadata: {
          ...metadata,
          reservedAtCredits: user.credits + amount,
          remainingAfterReservation: user.credits
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.transactions.unshift(transaction);
      saveDb();

      return {
        transactionId: txId,
        remainingCredits: user.credits
      };
    });
  },

  async atomicCommitTransaction(
    transactionId: string, 
    metadataUpdates?: Record<string, any>
  ): Promise<CreditTransaction> {
    const tx = db.transactions.find(t => t.id === transactionId);
    if (!tx) {
      throw new Error('Transação não encontrada');
    }
    tx.status = 'completed';
    tx.updatedAt = new Date().toISOString();
    if (metadataUpdates) {
      tx.metadata = { ...(tx.metadata || {}), ...metadataUpdates };
    }
    saveDb();
    return tx;
  },

  async atomicRollbackTransaction(
    transactionId: string, 
    reason: string
  ): Promise<{ refundedAmount: number; newBalance: number }> {
    const tx = db.transactions.find(t => t.id === transactionId);
    if (!tx) {
      throw new Error('Transação não encontrada para estorno');
    }

    if (tx.status === 'refunded') {
      const user = db.users.find(u => u.id === tx.userId);
      return { refundedAmount: 0, newBalance: user?.credits || 0 };
    }

    return CreditMutex.runExclusive(tx.userId, async () => {
      const user = db.users.find(u => u.id === tx.userId);
      if (!user) {
        throw new Error('Usuário da transação não encontrado');
      }

      const refundAmount = Math.abs(tx.amount);
      user.credits += refundAmount;
      tx.status = 'refunded';
      tx.updatedAt = new Date().toISOString();
      tx.metadata = {
        ...(tx.metadata || {}),
        rollbackReason: reason,
        refundedAt: new Date().toISOString()
      };

      // Add audit refund log
      const refundTxId = `tx_ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      db.transactions.unshift({
        id: refundTxId,
        userId: user.id,
        amount: refundAmount,
        operationType: 'refund',
        status: 'completed',
        description: `Estorno de créditos: ${reason}`,
        model: tx.model,
        costUsdEstimated: 0,
        metadata: {
          originalTransactionId: tx.id,
          originalOperation: tx.operationType
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      saveDb();

      return {
        refundedAmount: refundAmount,
        newBalance: user.credits
      };
    });
  },

  async addCredits(
    userId: string, 
    amount: number, 
    description: string, 
    operationType: CreditOperationType = 'credit_recharge'
  ): Promise<{ newBalance: number; transactionId: string }> {
    return CreditMutex.runExclusive(userId, async () => {
      const user = db.users.find(u => u.id === userId);
      if (!user) throw new Error('Usuário não encontrado');

      user.credits += amount;
      const txId = `tx_add_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      db.transactions.unshift({
        id: txId,
        userId,
        amount,
        operationType,
        status: 'completed',
        description,
        model: 'system',
        costUsdEstimated: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      saveDb();
      return { newBalance: user.credits, transactionId: txId };
    });
  },

  getTransactionsByUser(userId: string): CreditTransaction[] {
    return db.transactions.filter(t => t.userId === userId);
  },

  getAllTransactions(): CreditTransaction[] {
    return db.transactions;
  },

  // Brands / Clients
  getBrands(userId: string): BrandClient[] {
    return db.brands.filter(b => b.userId === userId);
  },

  getBrandById(brandId: string): BrandClient | undefined {
    return db.brands.find(b => b.id === brandId);
  },

  createBrand(brandData: Omit<BrandClient, 'id' | 'createdAt'>): BrandClient {
    const newBrand: BrandClient = {
      ...brandData,
      id: `brand_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    db.brands.unshift(newBrand);
    saveDb();
    return newBrand;
  },

  updateBrand(brandId: string, updates: Partial<BrandClient>): BrandClient | undefined {
    const idx = db.brands.findIndex(b => b.id === brandId);
    if (idx === -1) return undefined;
    db.brands[idx] = { ...db.brands[idx], ...updates };
    saveDb();
    return db.brands[idx];
  },

  deleteBrand(brandId: string): boolean {
    const prevLen = db.brands.length;
    db.brands = db.brands.filter(b => b.id !== brandId);
    saveDb();
    return db.brands.length < prevLen;
  },

  // Projects
  getProjects(userId: string): ProjectItem[] {
    return db.projects.filter(p => p.userId === userId);
  },

  getProjectById(projectId: string): ProjectItem | undefined {
    return db.projects.find(p => p.id === projectId);
  },

  createProject(projectData: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>): ProjectItem {
    const newProject: ProjectItem = {
      ...projectData,
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.projects.unshift(newProject);
    saveDb();
    return newProject;
  },

  updateProject(projectId: string, updates: Partial<ProjectItem>): ProjectItem | undefined {
    const idx = db.projects.findIndex(p => p.id === projectId);
    if (idx === -1) return undefined;
    db.projects[idx] = { 
      ...db.projects[idx], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveDb();
    return db.projects[idx];
  },

  deleteProject(projectId: string): boolean {
    const prevLen = db.projects.length;
    db.projects = db.projects.filter(p => p.id !== projectId);
    saveDb();
    return db.projects.length < prevLen;
  },

  // Video Tasks
  getVideoTasks(userId: string): VideoTask[] {
    return db.videoTasks.filter(v => v.userId === userId);
  },

  getVideoTaskById(taskId: string): VideoTask | undefined {
    return db.videoTasks.find(v => v.id === taskId);
  },

  createVideoTask(taskData: Omit<VideoTask, 'id' | 'createdAt' | 'updatedAt'>): VideoTask {
    const newTask: VideoTask = {
      ...taskData,
      id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.videoTasks.unshift(newTask);
    saveDb();
    return newTask;
  },

  updateVideoTask(taskId: string, updates: Partial<VideoTask>): VideoTask | undefined {
    const idx = db.videoTasks.findIndex(v => v.id === taskId);
    if (idx === -1) return undefined;
    db.videoTasks[idx] = {
      ...db.videoTasks[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDb();
    return db.videoTasks[idx];
  }
};
