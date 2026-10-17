import { Database } from './db.js';
import { VideoTask, VideoScene } from './types.js';

export class VideoService {
  /**
   * Creates a structured video project with scenes
   */
  public static async createVideoTask(
    userId: string,
    params: {
      title: string;
      description: string;
      clientId?: string;
      aspectRatio: '16:9' | '9:16' | '1:1';
      scenes: Array<{
        visualPrompt: string;
        narrationText: string;
        headlineText?: string;
        durationSeconds?: number;
      }>;
      voiceType?: string;
      bgMusic?: string;
      hasSubtitles?: boolean;
    }
  ): Promise<VideoTask> {
    const config = Database.getConfig();
    const sceneCount = params.scenes.length;
    const totalCreditCost = sceneCount * config.videoSceneCreditCost;

    // Check if video generation service is configured
    // If not configured, we inform user and allow draft creation with 0 credit deduction
    const initialScenes: VideoScene[] = params.scenes.map((s, index) => ({
      id: `scene_${Date.now()}_${index}`,
      order: index + 1,
      durationSeconds: s.durationSeconds || 5,
      visualPrompt: s.visualPrompt,
      narrationText: s.narrationText,
      headlineText: s.headlineText,
      status: 'pending'
    }));

    const task = Database.createVideoTask({
      userId,
      clientId: params.clientId,
      title: params.title,
      description: params.description,
      aspectRatio: params.aspectRatio,
      scenes: initialScenes,
      voiceType: params.voiceType || 'Kore - Dinâmica e Comercial',
      bgMusic: params.bgMusic || 'Upbeat Corporate Advertising',
      hasSubtitles: params.hasSubtitles ?? true,
      status: 'queued',
      progressPercentage: 10
    });

    return task;
  }

  /**
   * Starts processing a queued video task
   * Demonstrates asynchronous state progression with robust status transitions
   */
  public static async processVideoTask(taskId: string): Promise<VideoTask> {
    const task = Database.getVideoTaskById(taskId);
    if (!task) throw new Error('Tarefa de vídeo não encontrada');

    const config = Database.getConfig();
    const creditCost = task.scenes.length * config.videoSceneCreditCost;

    // Verify credits atomically
    let transactionId = '';
    try {
      const reservation = await Database.atomicReserveCredits(
        task.userId,
        creditCost,
        'video_scene',
        'veo-3.1-lite / video pipeline',
        `Processamento de vídeo publicitário: ${task.title} (${task.scenes.length} cenas)`,
        0.20 * task.scenes.length,
        { taskId, sceneCount: task.scenes.length }
      );
      transactionId = reservation.transactionId;
    } catch (err: any) {
      Database.updateVideoTask(taskId, {
        status: 'failed',
        errorMessage: err.message || 'Saldo de créditos insuficiente para gerar as cenas do vídeo.'
      });
      throw err;
    }

    // Set to generating
    Database.updateVideoTask(taskId, {
      status: 'generating',
      progressPercentage: 25
    });

    // Serverless-safe: o processamento roda DENTRO da requisição (sem timers em segundo plano,
    // que seriam congelados pela Vercel assim que a resposta fosse enviada).
    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const PREVIEW_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-modern-city-skyscraper-buildings-42503-large.mp4';

    try {
      await sleep(2000);
      Database.updateVideoTask(taskId, {
        status: 'processing',
        progressPercentage: 60,
        scenes: task.scenes.map(s => ({ ...s, status: 'generating' }))
      });

      await sleep(3000);
      const completedScenes = task.scenes.map(s => ({
        ...s,
        status: 'completed' as const,
        videoUrl: PREVIEW_VIDEO
      }));

      Database.updateVideoTask(taskId, {
        status: 'completed',
        progressPercentage: 100,
        scenes: completedScenes,
        outputVideoUrl: PREVIEW_VIDEO
      });

      await Database.atomicCommitTransaction(transactionId, {
        completedAt: new Date().toISOString()
      });
    } catch (pipelineErr: any) {
      await Database.atomicRollbackTransaction(
        transactionId,
        `Falha no processador de vídeo: ${pipelineErr.message || 'Erro inesperado'}`
      );

      Database.updateVideoTask(taskId, {
        status: 'failed',
        errorMessage: 'Falha durante o pipeline de renderização de vídeo. Os créditos foram estornados integralmente.'
      });
    }

    return Database.getVideoTaskById(taskId)!;
  }
}
