import { GoogleGenAI } from '@google/genai';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';

type ServerAiProvider = 'gemini' | 'openai' | 'claude';

interface ChatHistoryTurn {
  readonly role: 'user' | 'assistant';
  readonly text: string;
}

interface ChatRequestPayload {
  readonly question?: string;
  readonly history?: readonly ChatHistoryTurn[];
  readonly systemInstruction?: string;
  readonly provider?: string;
  readonly model?: string;
}

function normalizeProvider(raw?: string): ServerAiProvider | null {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === 'gemini' || value === 'google') return 'gemini';
  if (value === 'openai' || value === 'gpt') return 'openai';
  if (value === 'claude' || value === 'anthropic') return 'claude';
  return null;
}

function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve((raw ? JSON.parse(raw) : {}) as T);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

/**
 * Ensures message history starts with a 'user' turn and strictly alternates
 * roles, satisfying Anthropic Claude's /v1/messages contract.
 */
function buildAlternatingMessages(
  history: readonly ChatHistoryTurn[],
  question: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const normalized: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const turn of history) {
    const content = turn.text?.trim();
    if (!content) continue;

    if (normalized.length === 0 && turn.role !== 'user') {
      continue;
    }

    const prev = normalized[normalized.length - 1];
    if (prev && prev.role === turn.role) {
      prev.content = `${prev.content}\n${content}`;
    } else {
      normalized.push({ role: turn.role, content });
    }
  }

  const trimmedQuestion = question.trim();
  const last = normalized[normalized.length - 1];
  if (last && last.role === 'user') {
    last.content = `${last.content}\n${trimmedQuestion}`;
  } else {
    normalized.push({ role: 'user', content: trimmedQuestion });
  }

  return normalized;
}

function createServerApiPlugin(env: Record<string, string>): Plugin {
  const preferredEnvProvider = normalizeProvider(env.AI_PROVIDER);
  const genericAiKey = (env.AI_API_KEY ?? '').trim();
  const genericAiModel = (env.AI_MODEL ?? '').trim();

  const geminiApiKey = (
    env.GEMINI_API_KEY ||
    (preferredEnvProvider === 'gemini' ? genericAiKey : '') ||
    ''
  ).trim();
  const openaiApiKey = (
    env.OPENAI_API_KEY ||
    (preferredEnvProvider === 'openai' ? genericAiKey : '') ||
    ''
  ).trim();
  const claudeApiKey = (
    env.CLAUDE_API_KEY ||
    env.ANTHROPIC_API_KEY ||
    (preferredEnvProvider === 'claude' ? genericAiKey : '') ||
    ''
  ).trim();

  const defaultModels: Record<ServerAiProvider, string> = {
    gemini:
      (env.GEMINI_MODEL ?? '').trim() ||
      (preferredEnvProvider === 'gemini' ? genericAiModel : '') ||
      'gemini-2.5-flash',
    openai:
      (env.OPENAI_MODEL ?? '').trim() ||
      (preferredEnvProvider === 'openai' ? genericAiModel : '') ||
      'gpt-4o-mini',
    claude:
      (env.CLAUDE_MODEL || env.ANTHROPIC_MODEL || '').trim() ||
      (preferredEnvProvider === 'claude' ? genericAiModel : '') ||
      'claude-3-5-sonnet-latest',
  };

  const elevenLabsApiKey = (env.ELEVENLABS_API_KEY ?? '').trim();
  const elevenLabsVoiceId = (env.ELEVENLABS_VOICE_ID ?? '').trim();

  const isProviderConfigured = (provider: ServerAiProvider): boolean => {
    if (provider === 'gemini') return Boolean(geminiApiKey);
    if (provider === 'openai') return Boolean(openaiApiKey);
    if (provider === 'claude') return Boolean(claudeApiKey);
    return false;
  };

  const resolveProviderOrder = (
    requestedProvider?: string
  ): ServerAiProvider[] => {
    const primary =
      normalizeProvider(requestedProvider) ?? preferredEnvProvider;
    const allProviders: ServerAiProvider[] = ['gemini', 'openai', 'claude'];
    const ordered: ServerAiProvider[] = [];

    if (primary && isProviderConfigured(primary)) {
      ordered.push(primary);
    }

    for (const candidate of allProviders) {
      if (!ordered.includes(candidate) && isProviderConfigured(candidate)) {
        ordered.push(candidate);
      }
    }

    return ordered;
  };

  const chatWithGemini = async (
    payload: Required<
      Pick<ChatRequestPayload, 'question' | 'systemInstruction'>
    > & {
      history: readonly ChatHistoryTurn[];
      model: string;
    }
  ): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const contents = [
      ...payload.history.map((turn) => ({
        role: turn.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: turn.text }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: payload.question }],
      },
    ];

    const response = await ai.models.generateContent({
      model: payload.model,
      contents,
      config: {
        systemInstruction: payload.systemInstruction,
        temperature: 0.6,
        maxOutputTokens: 220,
      },
    });

    return response.text?.trim() ?? '';
  };

  const chatWithOpenAi = async (
    payload: Required<
      Pick<ChatRequestPayload, 'question' | 'systemInstruction'>
    > & {
      history: readonly ChatHistoryTurn[];
      model: string;
    }
  ): Promise<string> => {
    const messages = [
      ...(payload.systemInstruction
        ? [{ role: 'system' as const, content: payload.systemInstruction }]
        : []),
      ...payload.history.map((turn) => ({
        role: turn.role,
        content: turn.text,
      })),
      { role: 'user' as const, content: payload.question },
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: payload.model,
        messages,
        temperature: 0.6,
        max_tokens: 220,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`OpenAI HTTP ${res.status}: ${errText}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  };

  const chatWithClaude = async (
    payload: Required<
      Pick<ChatRequestPayload, 'question' | 'systemInstruction'>
    > & {
      history: readonly ChatHistoryTurn[];
      model: string;
    }
  ): Promise<string> => {
    const messages = buildAlternatingMessages(
      payload.history,
      payload.question
    );

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: payload.model,
        max_tokens: 220,
        temperature: 0.6,
        ...(payload.systemInstruction
          ? { system: payload.systemInstruction }
          : {}),
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Claude HTTP ${res.status}: ${errText}`);
    }

    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const textBlock = data.content?.find((block) => block.type === 'text');
    return textBlock?.text?.trim() ?? '';
  };

  const attachMiddleware = (middlewares: {
    use: (
      fn: (
        req: IncomingMessage,
        res: ServerResponse,
        next: () => void
      ) => void
    ) => void;
  }) => {
    middlewares.use(async (req, res, next) => {
      if (!req.url || req.method !== 'POST') {
        next();
        return;
      }

      const urlPath = req.url.split('?')[0];

      // 1. Model-Agnostic Chat Endpoint (Gemini / OpenAI / Claude)
      if (urlPath === '/api/chat') {
        try {
          const body = await readJsonBody<ChatRequestPayload>(req);
          const providers = resolveProviderOrder(body.provider);

          if (providers.length === 0) {
            sendJson(res, 503, {
              error:
                'No AI provider is configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or CLAUDE_API_KEY.',
            });
            return;
          }

          const question = (body.question ?? '').trim();
          const history = body.history ?? [];
          const systemInstruction = body.systemInstruction ?? '';
          const requestedProvider = normalizeProvider(body.provider);
          let lastError = 'AI request failed';

          for (const provider of providers) {
            const model =
              (requestedProvider === provider || providers[0] === provider
                ? body.model?.trim()
                : undefined) || defaultModels[provider];

            try {
              let text = '';
              if (provider === 'gemini') {
                text = await chatWithGemini({
                  question,
                  history,
                  systemInstruction,
                  model,
                });
              } else if (provider === 'openai') {
                text = await chatWithOpenAi({
                  question,
                  history,
                  systemInstruction,
                  model,
                });
              } else if (provider === 'claude') {
                text = await chatWithClaude({
                  question,
                  history,
                  systemInstruction,
                  model,
                });
              }

              if (text) {
                sendJson(res, 200, { text, provider, model });
                return;
              }
            } catch (err) {
              lastError =
                err instanceof Error ? err.message : `${provider} chat failed`;
            }
          }

          sendJson(res, 502, { error: lastError });
        } catch (err) {
          sendJson(res, 500, {
            error: err instanceof Error ? err.message : 'Chat request failed',
          });
        }
        return;
      }

      // 2. Model-Agnostic Audio Transcription Endpoint (Gemini / OpenAI Whisper / ElevenLabs Scribe)
      if (urlPath === '/api/transcribe') {
        try {
          const body = await readJsonBody<{
            mimeType?: string;
            audioBase64?: string;
          }>(req);

          const mimeType = (body.mimeType || 'audio/webm').split(';')[0];
          const audioBase64 = body.audioBase64 ?? '';
          if (!audioBase64) {
            sendJson(res, 200, { text: '' });
            return;
          }

          const tryGeminiTranscription = async (): Promise<string> => {
            if (!geminiApiKey) return '';
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            const response = await ai.models.generateContent({
              model: defaultModels.gemini,
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inlineData: {
                        mimeType,
                        data: audioBase64,
                      },
                    },
                    {
                      text: 'Transcribe the spoken English question in this audio clip verbatim. Output ONLY the transcribed words with no extra commentary. If there is only silence or noise, output an empty string.',
                    },
                  ],
                },
              ],
              config: {
                temperature: 0.1,
                maxOutputTokens: 120,
              },
            });
            return response.text?.trim() ?? '';
          };

          const tryOpenAiTranscription = async (): Promise<string> => {
            if (!openaiApiKey) return '';
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const formData = new FormData();
            formData.append('model', 'whisper-1');
            formData.append('language', 'en');
            formData.append(
              'file',
              new Blob([audioBuffer], { type: mimeType }),
              `speech.${ext}`
            );

            const sttRes = await fetch(
              'https://api.openai.com/v1/audio/transcriptions',
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${openaiApiKey}`,
                },
                body: formData,
              }
            );
            if (!sttRes.ok) return '';
            const data = (await sttRes.json()) as { text?: string };
            return data.text?.trim() ?? '';
          };

          const tryElevenLabsTranscription = async (): Promise<string> => {
            if (!elevenLabsApiKey) return '';
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            const formData = new FormData();
            formData.append('model_id', 'scribe_v1');
            formData.append(
              'file',
              new Blob([audioBuffer], { type: mimeType }),
              'speech.webm'
            );
            formData.append('language_code', 'en');

            const sttRes = await fetch(
              'https://api.elevenlabs.io/v1/speech-to-text',
              {
                method: 'POST',
                headers: {
                  'xi-api-key': elevenLabsApiKey,
                },
                body: formData,
              }
            );
            if (!sttRes.ok) return '';
            const data = (await sttRes.json()) as { text?: string };
            return data.text?.trim() ?? '';
          };

          const sttSteps =
            preferredEnvProvider === 'openai'
              ? [
                  tryOpenAiTranscription,
                  tryGeminiTranscription,
                  tryElevenLabsTranscription,
                ]
              : [
                  tryGeminiTranscription,
                  tryOpenAiTranscription,
                  tryElevenLabsTranscription,
                ];

          for (const step of sttSteps) {
            try {
              const text = await step();
              if (text) {
                sendJson(res, 200, { text });
                return;
              }
            } catch {
              // Fall through to next transcription provider
            }
          }

          sendJson(res, 200, { text: '' });
        } catch (err) {
          sendJson(res, 500, {
            error: err instanceof Error ? err.message : 'Transcription failed',
          });
        }
        return;
      }

      // 3. Server-side ElevenLabs TTS Endpoint
      if (urlPath === '/api/tts') {
        if (!elevenLabsApiKey || !elevenLabsVoiceId) {
          sendJson(res, 503, {
            error: 'ElevenLabs credentials are not configured on the server',
          });
          return;
        }
        try {
          const body = await readJsonBody<{ text?: string }>(req);
          const upstream = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
              elevenLabsVoiceId
            )}?output_format=mp3_44100_128`,
            {
              method: 'POST',
              headers: {
                Accept: 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': elevenLabsApiKey,
              },
              body: JSON.stringify({
                text: body.text ?? '',
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.75,
                },
              }),
            }
          );

          if (!upstream.ok) {
            const errText = await upstream.text().catch(() => '');
            sendJson(res, upstream.status, {
              error: errText || `HTTP ${upstream.status}`,
            });
            return;
          }

          const arrayBuffer = await upstream.arrayBuffer();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'audio/mpeg');
          res.end(Buffer.from(arrayBuffer));
        } catch (err) {
          sendJson(res, 500, {
            error: err instanceof Error ? err.message : 'TTS request failed',
          });
        }
        return;
      }

      next();
    });
  };

  return {
    name: 'server-api-proxy',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const enableStaticFallback =
    env.VITE_ENABLE_STATIC_FALLBACK === 'true' ||
    Boolean(env.AWS_APP_ID || env.AWS_BRANCH);

  const staticFallbackEnv = enableStaticFallback
    ? {
        AI_PROVIDER: (env.AI_PROVIDER ?? '').trim(),
        AI_MODEL: (env.AI_MODEL ?? '').trim(),
        GEMINI_API_KEY: (env.GEMINI_API_KEY ?? '').trim(),
        OPENAI_API_KEY: (env.OPENAI_API_KEY ?? '').trim(),
        CLAUDE_API_KEY: (
          env.CLAUDE_API_KEY ||
          env.ANTHROPIC_API_KEY ||
          ''
        ).trim(),
        ELEVENLABS_API_KEY: (env.ELEVENLABS_API_KEY ?? '').trim(),
        ELEVENLABS_VOICE_ID: (env.ELEVENLABS_VOICE_ID ?? '').trim(),
      }
    : {};

  return {
    plugins: [react(), createServerApiPlugin(env)],
    define: {
      __STATIC_FALLBACK_ENV__: JSON.stringify(staticFallbackEnv),
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-icons')) {
              return 'icons';
            }
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/')
            ) {
              return 'react-vendor';
            }
            return undefined;
          },
        },
      },
    },
  };
});
