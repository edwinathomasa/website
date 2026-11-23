import { GoogleGenAI } from '@google/genai';
import type { AiProvider, ChatMessage, SttProvider } from '@portfolio/shared';
import { getBackendEnv, normalizeProvider } from '../config/env.js';

function buildAlternatingMessages(
  messages: readonly ChatMessage[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const normalized: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const msg of messages) {
    const content = msg.content.trim();
    if (!content) continue;
    if (normalized.length === 0 && msg.role !== 'user') continue;

    const prev = normalized[normalized.length - 1];
    if (prev && prev.role === msg.role) {
      prev.content = `${prev.content}\n${content}`;
    } else {
      normalized.push({ role: msg.role, content });
    }
  }

  return normalized;
}

export function getConfiguredProviders(): AiProvider[] {
  const env = getBackendEnv();
  const providers: AiProvider[] = [];
  if (env.geminiApiKey) providers.push('gemini');
  if (env.openaiApiKey) providers.push('openai');
  if (env.claudeApiKey) providers.push('claude');
  return providers;
}

export function resolveProviderOrder(requestedProvider?: string): AiProvider[] {
  const env = getBackendEnv();
  const primary =
    normalizeProvider(requestedProvider) ?? env.preferredAiProvider;
  const configured = getConfiguredProviders();
  const ordered: AiProvider[] = [];

  if (primary && configured.includes(primary)) {
    ordered.push(primary);
  }
  for (const candidate of configured) {
    if (!ordered.includes(candidate)) {
      ordered.push(candidate);
    }
  }

  return ordered;
}

async function chatWithGemini(payload: {
  apiKey: string;
  messages: readonly ChatMessage[];
  systemInstruction: string;
  model: string;
}): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: payload.apiKey });
  const alternating = buildAlternatingMessages(payload.messages);
  const contents = alternating.map((msg) => ({
    role: msg.role === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: msg.content }],
  }));

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
}

async function chatWithOpenAi(payload: {
  apiKey: string;
  messages: readonly ChatMessage[];
  systemInstruction: string;
  model: string;
}): Promise<string> {
  const messages = [
    ...(payload.systemInstruction
      ? [{ role: 'system' as const, content: payload.systemInstruction }]
      : []),
    ...payload.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${payload.apiKey}`,
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
}

async function chatWithClaude(payload: {
  apiKey: string;
  messages: readonly ChatMessage[];
  systemInstruction: string;
  model: string;
}): Promise<string> {
  const messages = buildAlternatingMessages(payload.messages);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': payload.apiKey,
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
}

export interface LlmChatResult {
  readonly text: string;
  readonly provider: AiProvider;
  readonly model: string;
}

export async function generateModelAgnosticReply(params: {
  messages: readonly ChatMessage[];
  systemInstruction: string;
  requestedProvider?: AiProvider;
  requestedModel?: string;
}): Promise<LlmChatResult | null> {
  const env = getBackendEnv();
  const providers = resolveProviderOrder(params.requestedProvider);
  if (providers.length === 0) {
    return null;
  }

  const requestedProvider = normalizeProvider(params.requestedProvider);

  for (const provider of providers) {
    const model =
      (requestedProvider === provider || providers[0] === provider
        ? params.requestedModel?.trim()
        : undefined) || env.defaultModels[provider];

    try {
      let text = '';
      if (provider === 'gemini') {
        text = await chatWithGemini({
          apiKey: env.geminiApiKey,
          messages: params.messages,
          systemInstruction: params.systemInstruction,
          model,
        });
      } else if (provider === 'openai') {
        text = await chatWithOpenAi({
          apiKey: env.openaiApiKey,
          messages: params.messages,
          systemInstruction: params.systemInstruction,
          model,
        });
      } else if (provider === 'claude') {
        text = await chatWithClaude({
          apiKey: env.claudeApiKey,
          messages: params.messages,
          systemInstruction: params.systemInstruction,
          model,
        });
      }

      if (text) {
        return { text, provider, model };
      }
    } catch (err) {
      console.warn(`LLM provider ${provider} failed, trying next:`, err);
    }
  }

  return null;
}

export interface SttResult {
  readonly text: string;
  readonly provider?: SttProvider;
}

export async function transcribeAudio(params: {
  audioBase64: string;
  mimeType: string;
}): Promise<SttResult> {
  const env = getBackendEnv();
  const cleanMime = (params.mimeType || 'audio/webm').split(';')[0];

  const tryGemini = async (): Promise<SttResult | null> => {
    if (!env.geminiApiKey) return null;
    const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
    const response = await ai.models.generateContent({
      model: env.defaultModels.gemini,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: cleanMime, data: params.audioBase64 } },
            {
              text: 'Transcribe the spoken English question in this audio clip verbatim. Output ONLY the transcribed words with no extra commentary. If there is only silence or noise, output an empty string.',
            },
          ],
        },
      ],
      config: { temperature: 0.1, maxOutputTokens: 120 },
    });
    const text = response.text?.trim() ?? '';
    return text ? { text, provider: 'gemini' } : null;
  };

  const tryOpenAi = async (): Promise<SttResult | null> => {
    if (!env.openaiApiKey) return null;
    const audioBuffer = Buffer.from(params.audioBase64, 'base64');
    const ext = cleanMime.includes('mp4') ? 'mp4' : 'webm';
    const formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append(
      'file',
      new Blob([audioBuffer], { type: cleanMime }),
      `speech.${ext}`
    );

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.openaiApiKey}` },
      body: formData,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string };
    const text = data.text?.trim() ?? '';
    return text ? { text, provider: 'openai' } : null;
  };

  const tryElevenLabs = async (): Promise<SttResult | null> => {
    if (!env.elevenLabsApiKey) return null;
    const audioBuffer = Buffer.from(params.audioBase64, 'base64');
    const formData = new FormData();
    formData.append('model_id', 'scribe_v1');
    formData.append(
      'file',
      new Blob([audioBuffer], { type: cleanMime }),
      'speech.webm'
    );
    formData.append('language_code', 'en');

    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': env.elevenLabsApiKey },
      body: formData,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string };
    const text = data.text?.trim() ?? '';
    return text ? { text, provider: 'elevenlabs' } : null;
  };

  const steps =
    env.preferredAiProvider === 'openai'
      ? [tryOpenAi, tryGemini, tryElevenLabs]
      : [tryGemini, tryOpenAi, tryElevenLabs];

  for (const step of steps) {
    try {
      const result = await step();
      if (result) return result;
    } catch {
      // Fall through to next STT provider
    }
  }

  return { text: '' };
}
