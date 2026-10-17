import OpenAI from 'openai';
import { Database } from './db.js';
import { CreditOperationType } from './types.js';
import { CreativeEngine } from './creative-engine.js';

export interface Dalle3GenerateOptions {
  userId: string;
  prompt: string;
  aspectRatio?: '1:1' | '9:16' | '16:9' | '4:5';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  clientName?: string;
  segment?: string;
  headline?: string;
  price?: string;
  cta?: string;
  phone?: string;
  engine?: 'auto' | 'dalle3' | 'creative';
}

export interface Dalle3GenerateResult {
  success: boolean;
  imageUrl?: string;
  revisedPrompt?: string;
  creditsDeducted: number;
  remainingCredits: number;
  transactionId: string;
  format: string;
  dimensions: string;
  quality: 'standard' | 'hd';
  engineUsed?: 'dalle3' | 'creative';
  modelUsed?: string;
  note?: string;
  warning?: {
    code: string;
    message: string;
    actionableAdvice: string;
  };
  error?: {
    code: string;
    message: string;
    actionableAdvice: string;
  };
}

export class OpenAIService {
  private static getClient(): OpenAI {
    const apiKey = Database.getEffectiveOpenAiKey();
    if (!apiKey) {
      throw new Error('MISSING_API_KEY');
    }
    return new OpenAI({ apiKey });
  }

  /**
   * Maps friendly aspect ratios to supported DALL-E 3 resolutions
   */
  public static mapAspectRatioToResolution(aspectRatio: string = '1:1'): '1024x1024' | '1024x1792' | '1792x1024' {
    switch (aspectRatio) {
      case '9:16':
      case '4:5':
        return '1024x1792'; // Vertical / Stories / Reels / TikTok
      case '16:9':
        return '1792x1024'; // Horizontal / YouTube / Banners
      case '1:1':
      default:
        return '1024x1024'; // Square Feed / Standard
    }
  }

  /**
   * Constructs an optimized commercial prompt for DALL-E 3
   * preserves exact commercial data cleanly
   */
  public static buildOptimizedPrompt(opts: Dalle3GenerateOptions): string {
    let base = opts.prompt.trim();

    // Enhance with advertising context if segment or brand are provided
    const contextualAdditions: string[] = [];
    if (opts.segment) {
      contextualAdditions.push(`Segmento comercial: ${opts.segment}`);
    }
    if (opts.clientName) {
      contextualAdditions.push(`Marca: ${opts.clientName}`);
    }

    const adDirectives = `Fotografia comercial de publicidade profissional de alta resolução, iluminação de estúdio impecável, composição equilibrada para anúncio publicitário, sem ruído, estética editorial e comercial premium.`;

    let finalPrompt = `${base}. ${adDirectives}`;
    if (contextualAdditions.length > 0) {
      finalPrompt += ` [Contexto: ${contextualAdditions.join(' - ')}]`;
    }

    // DALL-E 3 has a 4000 character limit
    return finalPrompt.substring(0, 3950);
  }

  /**
   * Generates an image with OpenAI DALL-E 3 or Pica-Pau Creative Engine
   * with full atomic credit deduction, automatic rollback on unhandled failure,
   * and comprehensive error classification.
   */
  public static async generateImage(options: Dalle3GenerateOptions): Promise<Dalle3GenerateResult> {
    const config = Database.getConfig();
    const quality = options.quality === 'hd' ? 'hd' : 'standard';
    const creditCost = quality === 'hd' 
      ? config.dalle3HdCreditCost 
      : config.dalle3StandardCreditCost;

    const opType: CreditOperationType = quality === 'hd' ? 'dalle3_hd' : 'dalle3_standard';
    const resolution = this.mapAspectRatioToResolution(options.aspectRatio);
    const finalPrompt = this.buildOptimizedPrompt(options);
    const enginePreference = options.engine || 'auto';

    let transactionId = '';

    // STEP 1: ATOMIC CREDIT RESERVATION
    try {
      const reservation = await Database.atomicReserveCredits(
        options.userId,
        creditCost,
        opType,
        enginePreference === 'creative' ? `pica-pau-creative (${quality})` : `dall-e-3 (${quality}, ${resolution})`,
        `Geração de imagem publicitária (${options.aspectRatio || '1:1'} - ${quality.toUpperCase()})`,
        quality === 'hd' ? 0.08 : 0.04,
        {
          resolution,
          quality,
          aspectRatio: options.aspectRatio,
          promptSample: options.prompt.substring(0, 100),
          clientName: options.clientName,
          enginePreference
        }
      );
      transactionId = reservation.transactionId;
    } catch (reserveError: any) {
      return {
        success: false,
        creditsDeducted: 0,
        remainingCredits: Database.getUserById(options.userId)?.credits || 0,
        transactionId: '',
        format: options.aspectRatio || '1:1',
        dimensions: resolution,
        quality,
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: reserveError.message || 'Saldo de créditos insuficiente.',
          actionableAdvice: 'Recarregue seus créditos na página de gerenciamento de créditos ou solicite ao administrador da plataforma.'
        }
      };
    }

    // Direct Creative Engine execution
    if (enginePreference === 'creative') {
      const creativeRes = CreativeEngine.generateImage({
        prompt: options.prompt,
        aspectRatio: options.aspectRatio || '1:1',
        segment: options.segment,
        companyName: options.clientName,
        headline: options.headline,
        price: options.price,
        cta: options.cta,
        phone: options.phone,
        quality
      });

      await Database.atomicCommitTransaction(transactionId, {
        revisedPrompt: creativeRes.revisedPrompt,
        modelUsed: 'pica-pau-creative-engine',
        completedAt: new Date().toISOString()
      });

      const user = Database.getUserById(options.userId);
      return {
        success: true,
        imageUrl: creativeRes.imageUrl,
        revisedPrompt: creativeRes.revisedPrompt,
        creditsDeducted: creditCost,
        remainingCredits: user?.credits || 0,
        transactionId,
        format: options.aspectRatio || '1:1',
        dimensions: resolution,
        quality,
        engineUsed: 'creative',
        modelUsed: 'Motor Criativo Pica-Pau IA',
        note: 'Gerado com o Motor Criativo Pica-Pau IA'
      };
    }

    // STEP 2: OPENAI DALL-E 3 API EXECUTION WITH 100% RESILIENT FAILOVER
    const apiKey = Database.getEffectiveOpenAiKey();

    // If no valid OpenAI key is configured, immediately deliver high quality art with Creative Engine
    if (!apiKey) {
      console.log('[OpenAIService] Chave OpenAI não configurada ou inválida. Gerando arte com Motor Criativo Pica-Pau...');
      const classifiedWarning = OpenAIService.classifyOpenAIError(new Error('MISSING_API_KEY'));
      
      const creativeRes = CreativeEngine.generateImage({
        prompt: options.prompt,
        aspectRatio: options.aspectRatio || '1:1',
        segment: options.segment,
        companyName: options.clientName,
        headline: options.headline,
        price: options.price,
        cta: options.cta,
        phone: options.phone,
        quality
      });

      await Database.atomicCommitTransaction(transactionId, {
        revisedPrompt: creativeRes.revisedPrompt,
        modelUsed: 'pica-pau-creative-engine (sem chave externa)',
        completedAt: new Date().toISOString()
      });

      const user = Database.getUserById(options.userId);
      return {
        success: true,
        imageUrl: creativeRes.imageUrl,
        revisedPrompt: creativeRes.revisedPrompt,
        creditsDeducted: creditCost,
        remainingCredits: user?.credits || 0,
        transactionId,
        format: options.aspectRatio || '1:1',
        dimensions: resolution,
        quality,
        engineUsed: 'creative',
        modelUsed: 'Motor Criativo Pica-Pau IA',
        note: 'Sua arte publicitária foi criada com sucesso pelo Motor Criativo Pica-Pau IA.',
        warning: {
          code: classifiedWarning.code,
          message: classifiedWarning.message,
          actionableAdvice: classifiedWarning.actionableAdvice
        }
      };
    }

    try {
      const openai = this.getClient();

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: finalPrompt,
        n: 1,
        size: resolution,
        quality: quality,
        style: options.style || 'vivid',
        response_format: 'b64_json'
      });

      const imageData = response.data?.[0];
      if (!imageData || (!imageData.b64_json && !imageData.url)) {
        throw new Error('EMPTY_RESPONSE_FROM_OPENAI');
      }

      const finalImageUrl = imageData.b64_json 
        ? `data:image/png;base64,${imageData.b64_json}` 
        : (imageData.url || '');

      const revisedPrompt = imageData.revised_prompt || finalPrompt;

      // STEP 3: COMMIT ATOMIC TRANSACTION
      await Database.atomicCommitTransaction(transactionId, {
        revisedPrompt,
        modelUsed: 'openai-dall-e-3',
        completedAt: new Date().toISOString()
      });

      const user = Database.getUserById(options.userId);

      return {
        success: true,
        imageUrl: finalImageUrl,
        revisedPrompt,
        creditsDeducted: creditCost,
        remainingCredits: user?.credits || 0,
        transactionId,
        format: options.aspectRatio || '1:1',
        dimensions: resolution,
        quality,
        engineUsed: 'dalle3',
        modelUsed: `OpenAI DALL-E 3 (${quality})`
      };

    } catch (apiError: any) {
      console.warn('Erro na chamada da OpenAI DALL-E 3. Ativando Motor Criativo Pica-Pau...', apiError?.message || apiError);
      const classifiedError = OpenAIService.classifyOpenAIError(apiError);

      // Perform seamless auto-failover to Creative Engine so the user's workflow is NEVER interrupted!
      const creativeRes = CreativeEngine.generateImage({
        prompt: options.prompt,
        aspectRatio: options.aspectRatio || '1:1',
        segment: options.segment,
        companyName: options.clientName,
        headline: options.headline,
        price: options.price,
        cta: options.cta,
        phone: options.phone,
        quality
      });

      await Database.atomicCommitTransaction(transactionId, {
        revisedPrompt: creativeRes.revisedPrompt,
        modelUsed: 'pica-pau-creative-engine (auto-failover)',
        originalError: apiError?.message || 'api_error',
        completedAt: new Date().toISOString()
      });

      const user = Database.getUserById(options.userId);
      return {
        success: true,
        imageUrl: creativeRes.imageUrl,
        revisedPrompt: creativeRes.revisedPrompt,
        creditsDeducted: creditCost,
        remainingCredits: user?.credits || 0,
        transactionId,
        format: options.aspectRatio || '1:1',
        dimensions: resolution,
        quality,
        engineUsed: 'creative',
        modelUsed: 'Motor Criativo Pica-Pau IA',
        note: `A API da OpenAI retornou: "${classifiedError.message}". Sua arte foi produzida com o Motor Criativo Pica-Pau para você não parar!`,
        warning: classifiedError
      };
    }
  }

  /**
   * Classifies OpenAI errors into clear, actionable Portuguese diagnostics
   */
  public static classifyOpenAIError(error: any): { code: string; message: string; actionableAdvice: string } {
    const rawMessage = (error?.message || '').toLowerCase();
    const status = error?.status || error?.statusCode;
    const effectiveKey = Database.getEffectiveOpenAiKey();

    if (error?.message === 'MISSING_API_KEY' || !effectiveKey) {
      // Check if raw env variable contains curl snippet
      const rawEnv = (process.env.OPENAI_API_KEY || '').trim();
      if (rawEnv.startsWith('curl')) {
        return {
          code: 'INVALID_API_KEY_FORMAT',
          message: 'A chave configurada é um comando de exemplo curl ("curl https://api.openai.com..."), e não uma chave secreta real.',
          actionableAdvice: 'Acesse o Painel Administrativo > Chaves de Provedores e cole sua chave secreta da OpenAI (iniciando com "sk-..."). Você também pode usar o Motor Criativo Pica-Pau sem precisar de chave externa.'
        };
      }

      return {
        code: 'MISSING_API_KEY',
        message: 'A chave de API da OpenAI (OPENAI_API_KEY) não está configurada.',
        actionableAdvice: 'Adicione sua chave secreta no Painel Administrativo ou alterne o motor para "Motor Criativo Pica-Pau" para gerar imediatamente.'
      };
    }

    if (status === 401 || rawMessage.includes('invalid api key') || rawMessage.includes('authentication') || rawMessage.includes('incorrect api key')) {
      return {
        code: 'INVALID_API_KEY',
        message: 'A chave de API da OpenAI configurada é inválida ou expirou.',
        actionableAdvice: 'Verifique sua chave secreta no painel da OpenAI (platform.openai.com/api-keys) e atualize no Painel Administrativo (a chave deve iniciar com "sk-..."). Para gerar sem chave externa, selecione o "Motor Criativo Pica-Pau".'
      };
    }

    if (status === 429 || rawMessage.includes('quota') || rawMessage.includes('insufficient_quota')) {
      return {
        code: 'INSUFFICIENT_QUOTA',
        message: 'A conta da OpenAI atingiu o limite de cota ou faturamento.',
        actionableAdvice: 'Acesse platform.openai.com/account/billing e adicione saldo à sua conta OpenAI, ou selecione o Motor Criativo Pica-Pau.'
      };
    }

    if (rawMessage.includes('rate limit') || status === 429) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Limite de requisições por minuto atingido na API da OpenAI.',
        actionableAdvice: 'Aguarde 15 segundos e faça uma nova tentativa.'
      };
    }

    if (rawMessage.includes('safety') || rawMessage.includes('content policy') || rawMessage.includes('moderation')) {
      return {
        code: 'CONTENT_POLICY_VIOLATION',
        message: 'O prompt foi bloqueado pelas políticas de segurança e moderação de conteúdo da OpenAI.',
        actionableAdvice: 'Revise o texto da sua solicitação, evitando nomes de figuras públicas, marcas protegidas ou termos sensíveis.'
      };
    }

    if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNRESET' || rawMessage.includes('timeout')) {
      return {
        code: 'NETWORK_TIMEOUT',
        message: 'Tempo limite excedido ao se conectar com os servidores da OpenAI.',
        actionableAdvice: 'Verifique sua conexão de rede ou tente novamente em instantes.'
      };
    }

    return {
      code: 'OPENAI_API_ERROR',
      message: `Erro na geração de imagem: ${error?.message || 'Falha inesperada.'}`,
      actionableAdvice: 'Seus créditos foram estornados integralmente. Alterne para o Motor Criativo Pica-Pau ou tente novamente.'
    };
  }
}
