import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Database, hydrateDb, flushDb, persistenceMode } from './db.js';
import { OpenAIService } from './openai-service.js';
import { GeminiService } from './gemini-service.js';
import { VideoService } from './video-service.js';

export const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==========================================
// SAÚDE, PERSISTÊNCIA E PORTÃO DE ACESSO
// ==========================================
const IS_PRODUCTION = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

function sha256(value: string): Buffer {
  return crypto.createHash('sha256').update(value).digest();
}

function isAuthorized(req: Request): boolean {
  const expected = process.env.ACCESS_PASSWORD;
  if (!expected) return !IS_PRODUCTION; // em produção, sem senha configurada = bloqueado
  const provided = String(req.headers['x-access-key'] || '');
  return crypto.timingSafeEqual(sha256(provided), sha256(expected));
}

// Diagnóstico simples (sem dados sensíveis)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    persistence: persistenceMode,
    accessProtected: Boolean(process.env.ACCESS_PASSWORD),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
});

// Portão de acesso: impede que qualquer visitante use (e gaste) suas chaves de API.
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health') return next();
  if (isAuthorized(req)) return next();
  const misconfigured = IS_PRODUCTION && !process.env.ACCESS_PASSWORD;
  return res.status(misconfigured ? 503 : 401).json({
    locked: true,
    misconfigured,
    error: misconfigured
      ? 'Defina a variável ACCESS_PASSWORD nas configurações do servidor para liberar o acesso.'
      : 'Acesso protegido. Informe a senha de acesso.'
  });
});

app.get('/api/access/check', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Persistência (serverless): carrega o estado antes e grava antes de responder.
let inflightRequests = 0;
app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
  if (persistenceMode !== 'redis') return next();
  try {
    // Só recarrega se não houver outra requisição em andamento NESTA instância,
    // para não sobrescrever alterações ainda não gravadas.
    if (inflightRequests === 0) await hydrateDb();
    inflightRequests++;
    let done = false;
    const finish = () => {
      if (!done) { done = true; inflightRequests = Math.max(0, inflightRequests - 1); }
    };
    const originalEnd = res.end.bind(res) as (...args: any[]) => Response;
    (res as any).end = (...args: any[]) => {
      flushDb().finally(() => { finish(); originalEnd(...args); });
      return res;
    };
    res.on('close', finish);
    next();
  } catch (err) {
    next(err);
  }
});

// Helper to get active user ID from header or default to admin
function getUserIdFromRequest(req: Request): string {
  const customUserId = req.headers['x-user-id'] as string;
  if (customUserId) {
    const user = Database.getUserById(customUserId);
    if (user) return user.id;
  }
  return 'usr_admin_01'; // Default admin user
}

// ==========================================
// AUTHENTICATION & PROFILE
// ==========================================
app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const user = Database.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  res.json({
    user,
    config: Database.getConfig()
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório' });
  }
  const user = Database.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Nenhuma conta encontrada com este e-mail' });
  }
  if (!user.active) {
    return res.status(403).json({ error: 'Esta conta está suspensa ou inativa. Fale com o administrador.' });
  }
  res.json({ user, token: `token_${user.id}` });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, companyName } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });
  }
  const existing = Database.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma conta cadastrada com este e-mail' });
  }
  const newUser = Database.createUser({
    name,
    email,
    role: 'user',
    credits: 0, // o bônus de boas-vindas é lançado por addCredits() logo abaixo
    plan: 'free',
    active: true,
    companyName: companyName || name
  });
  // Log welcome bonus transaction
  Database.addCredits(newUser.id, 50, 'Bônus de boas-vindas Pica-Pau Studio IA');

  res.status(201).json({ user: newUser });
});

// ==========================================
// DALL-E 3 IMAGE GENERATION (CENTRALIZED)
// ==========================================
app.post('/api/images/generate', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { 
      prompt, 
      aspectRatio, 
      quality, 
      style, 
      clientName, 
      segment, 
      headline, 
      price, 
      cta, 
      phone,
      engine 
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'EMPTY_PROMPT', 
          message: 'A descrição da imagem (prompt) é obrigatória.' 
        } 
      });
    }

    const result = await OpenAIService.generateImage({
      userId,
      prompt: prompt.trim(),
      aspectRatio,
      quality,
      style,
      clientName,
      segment,
      headline,
      price,
      cta,
      phone,
      engine: engine || 'auto'
    });

    if (!result.success) {
      return res.status(result.error?.code === 'INSUFFICIENT_CREDITS' ? 402 : 400).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error('Falha não tratada em /api/images/generate:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ocorreu um erro interno no servidor ao processar a geração.',
        actionableAdvice: 'Tente novamente em instantes. Nenhuma cobrança de créditos foi efetuada.'
      }
    });
  }
});

// Prompt enhancement via Gemini
app.post('/api/images/enhance-prompt', async (req: Request, res: Response) => {
  try {
    const { prompt, style, segment } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }
    const enhanced = await GeminiService.enhanceImagePrompt(prompt, style, segment);
    res.json({ enhancedPrompt: enhanced });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// AI COPYWRITING & ADVERTISING CAMPAIGNS
// ==========================================
app.post('/api/ai/copywrite', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    const {
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
    } = req.body;

    if (!companyName || !productOrService) {
      return res.status(400).json({ error: 'Nome da empresa e Produto/Serviço são obrigatórios.' });
    }

    const result = await GeminiService.generateMarketingCopy({
      userId,
      companyName,
      segment: segment || 'Geral',
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

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// VIDEO PRODUCTION PIPELINE
// ==========================================
app.get('/api/videos', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const tasks = Database.getVideoTasks(userId);
  res.json({ tasks });
});

app.post('/api/videos/create', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    const task = await VideoService.createVideoTask(userId, req.body);
    res.status(201).json({ success: true, task });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/videos/process/:id', async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const task = await VideoService.processVideoTask(taskId);
    res.json({ success: true, task });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/videos/:id', (req: Request, res: Response) => {
  const task = Database.getVideoTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Vídeo não encontrado' });
  res.json({ task });
});

// ==========================================
// BRANDS / CLIENTS MANAGEMENT
// ==========================================
app.get('/api/brands', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const brands = Database.getBrands(userId);
  res.json({ brands });
});

app.post('/api/brands', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { name, segment, primaryColor, secondaryColor, accentColor, fontFamily, phone, whatsapp, website, targetAudience, toneOfVoice, description, logoUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome do cliente/marca é obrigatório' });

  const brand = Database.createBrand({
    userId,
    name,
    segment: segment || 'Comércio & Serviços',
    description: description || '',
    logoUrl,
    primaryColor: primaryColor || '#0b132b',
    secondaryColor: secondaryColor || '#f59e0b',
    accentColor: accentColor || '#ef4444',
    fontFamily: fontFamily || 'Plus Jakarta Sans',
    phone: phone || '',
    whatsapp: whatsapp || '',
    website: website || '',
    targetAudience: targetAudience || '',
    toneOfVoice: toneOfVoice || 'Profissional'
  });
  res.status(201).json({ brand });
});

app.put('/api/brands/:id', (req: Request, res: Response) => {
  const updated = Database.updateBrand(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Marca não encontrada' });
  res.json({ brand: updated });
});

app.delete('/api/brands/:id', (req: Request, res: Response) => {
  const success = Database.deleteBrand(req.params.id);
  res.json({ success });
});

// ==========================================
// PROJECTS & VISUAL EDITOR
// ==========================================
app.get('/api/projects', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const projects = Database.getProjects(userId);
  res.json({ projects });
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const project = Database.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
  res.json({ project });
});

app.post('/api/projects', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { title, format, type, thumbnailUrl, sourceImageUrl, layers, commercialData, promptUsed, modelUsed, clientId, clientName } = req.body;
  
  const project = Database.createProject({
    userId,
    clientId,
    clientName,
    title: title || 'Nova Arte Publicitária',
    format: format || '1:1',
    type: type || 'image',
    thumbnailUrl: thumbnailUrl || sourceImageUrl || '',
    sourceImageUrl,
    layers: layers || [],
    commercialData: commercialData || {},
    promptUsed,
    modelUsed,
    status: 'completed'
  });
  res.status(201).json({ project });
});

app.put('/api/projects/:id', (req: Request, res: Response) => {
  const updated = Database.updateProject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Projeto não encontrado' });
  res.json({ project: updated });
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const success = Database.deleteProject(req.params.id);
  res.json({ success });
});

// ==========================================
// CREDITS & TRANSACTIONS
// ==========================================
app.get('/api/credits/history', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const transactions = Database.getTransactionsByUser(userId);
  const user = Database.getUserById(userId);
  res.json({
    currentBalance: user?.credits || 0,
    transactions
  });
});

app.post('/api/credits/recharge', async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const { amount, packageTitle } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Quantidade de créditos inválida' });
  }

  const result = await Database.addCredits(
    userId,
    Number(amount),
    `Recarga de créditos: ${packageTitle || 'Pacote Avulso'}`
  );

  res.json({ success: true, ...result });
});

// ==========================================
// ADMIN DASHBOARD & SYSTEM CONFIGURATION
// ==========================================
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const user = Database.getUserById(userId);
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito para administradores' });
  }

  const users = Database.getAllUsers();
  const transactions = Database.getAllTransactions();
  const projects = dbProjectsCount();
  const config = Database.getConfig();

  const totalCreditsUsed = transactions
    .filter(t => t.status === 'completed' && t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const totalCostUsd = transactions
    .filter(t => t.status === 'completed')
    .reduce((acc, t) => acc + (t.costUsdEstimated || 0), 0);

  res.json({
    metrics: {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.active).length,
      totalProjects: projects,
      totalTransactions: transactions.length,
      totalCreditsConsumed: totalCreditsUsed,
      estimatedCostUsd: Number(totalCostUsd.toFixed(3)),
    },
    config,
    recentTransactions: transactions.slice(0, 15),
    users
  });
});

function dbProjectsCount(): number {
  return Database.getAllTransactions().length;
}

app.post('/api/admin/config', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const user = Database.getUserById(userId);
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito para administradores' });
  }

  const { updates, customOpenAiKey, customGeminiKey } = req.body;
  const newConfig = Database.updateConfig(updates || {}, customOpenAiKey, customGeminiKey);
  res.json({ success: true, config: newConfig });
});

app.post('/api/admin/test-openai-key', async (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const user = Database.getUserById(userId);
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito para administradores' });
  }

  const { apiKey } = req.body;
  const keyToTest = (apiKey || Database.getEffectiveOpenAiKey() || '').trim();
  if (!keyToTest) {
    return res.json({
      valid: false,
      message: 'Nenhuma chave fornecida ou configurada.'
    });
  }

  if (keyToTest.startsWith('curl') || !keyToTest.startsWith('sk-')) {
    return res.json({
      valid: false,
      message: 'Formato inválido. A chave deve começar com sk-... e não pode ser um comando curl.'
    });
  }

  try {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey: keyToTest });
    await client.models.list();
    return res.json({
      valid: true,
      message: 'Chave OpenAI verificada e autenticada com sucesso no servidor da OpenAI!'
    });
  } catch (err: any) {
    const classified = OpenAIService.classifyOpenAIError(err);
    return res.json({
      valid: false,
      message: classified.message,
      advice: classified.actionableAdvice
    });
  }
});

app.post('/api/admin/users/:id/adjust-credits', async (req: Request, res: Response) => {
  const adminId = getUserIdFromRequest(req);
  const admin = Database.getUserById(adminId);
  if (admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito para administradores' });
  }

  const targetUserId = req.params.id;
  const { amount, reason } = req.body;
  if (typeof amount !== 'number') {
    return res.status(400).json({ error: 'Valor numérico de créditos é obrigatório' });
  }

  const result = await Database.addCredits(
    targetUserId,
    amount,
    reason || 'Ajuste manual pelo administrador',
    'admin_adjustment'
  );

  res.json({ success: true, ...result });
});

app.post('/api/admin/users/:id/toggle-status', (req: Request, res: Response) => {
  const adminId = getUserIdFromRequest(req);
  const admin = Database.getUserById(adminId);
  if (admin?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito para administradores' });
  }

  const target = Database.getUserById(req.params.id);
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado' });

  const updated = Database.updateUser(target.id, { active: !target.active });
  res.json({ success: true, user: updated });
});
