import type { AiProvider } from '@portfolio/shared';

export function normalizeProvider(raw?: string): AiProvider | null {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === 'gemini' || value === 'google') return 'gemini';
  if (value === 'openai' || value === 'gpt') return 'openai';
  if (value === 'claude' || value === 'anthropic') return 'claude';
  return null;
}

export interface BackendEnv {
  readonly port: number;
  readonly corsOrigin: string;
  readonly mongoDbUri: string;
  readonly mongoDbName: string;
  readonly profileSlug: string;
  readonly preferredAiProvider: AiProvider | null;
  readonly geminiApiKey: string;
  readonly openaiApiKey: string;
  readonly claudeApiKey: string;
  readonly defaultModels: Record<AiProvider, string>;
  readonly elevenLabsApiKey: string;
  readonly elevenLabsVoiceId: string;
}

export function getBackendEnv(): BackendEnv {
  const env = process.env;
  const preferredAiProvider = normalizeProvider(env.AI_PROVIDER);
  const genericAiKey = (env.AI_API_KEY ?? '').trim();
  const genericAiModel = (env.AI_MODEL ?? '').trim();

  const geminiApiKey = (
    env.GEMINI_API_KEY ||
    (preferredAiProvider === 'gemini' ? genericAiKey : '') ||
    ''
  ).trim();

  const openaiApiKey = (
    env.OPENAI_API_KEY ||
    (preferredAiProvider === 'openai' ? genericAiKey : '') ||
    ''
  ).trim();

  const claudeApiKey = (
    env.CLAUDE_API_KEY ||
    env.ANTHROPIC_API_KEY ||
    (preferredAiProvider === 'claude' ? genericAiKey : '') ||
    ''
  ).trim();

  return {
    port: Number(env.PORT) || 3000,
    corsOrigin: (env.CORS_ORIGIN ?? '*').trim(),
    mongoDbUri: (env.MONGODB_URI ?? '').trim(),
    mongoDbName: (env.MONGODB_DB_NAME ?? 'portfolio').trim(),
    profileSlug: (env.PROFILE_SLUG ?? 'edwin-thomas').trim(),
    preferredAiProvider,
    geminiApiKey,
    openaiApiKey,
    claudeApiKey,
    defaultModels: {
      gemini:
        (env.GEMINI_MODEL ?? '').trim() ||
        (preferredAiProvider === 'gemini' ? genericAiModel : '') ||
        'gemini-2.5-flash',
      openai:
        (env.OPENAI_MODEL ?? '').trim() ||
        (preferredAiProvider === 'openai' ? genericAiModel : '') ||
        'gpt-4o-mini',
      claude:
        (env.CLAUDE_MODEL || env.ANTHROPIC_MODEL || '').trim() ||
        (preferredAiProvider === 'claude' ? genericAiModel : '') ||
        'claude-3-5-sonnet-latest',
    },
    elevenLabsApiKey: (env.ELEVENLABS_API_KEY ?? '').trim(),
    elevenLabsVoiceId: (env.ELEVENLABS_VOICE_ID ?? '').trim(),
  };
}
