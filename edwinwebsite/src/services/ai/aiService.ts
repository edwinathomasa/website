import { API_CONFIG, STATIC_FALLBACK_ENV } from '../../constants/config';
import { matchCustomResponse } from '../../data/customResponses';
import type { AiProvider, ChatTurn } from '../../types/voice';
import { formatPeriodsInText } from '../../utils/speechFormat';
import {
  SYSTEM_INSTRUCTION,
  buildLocalFallbackAnswer,
} from './profileKnowledge';

export interface AskAssistantOptions {
  readonly provider?: AiProvider;
  readonly model?: string;
}

function normalizeProvider(raw?: string): AiProvider | null {
  const val = (raw ?? '').trim().toLowerCase();
  if (val === 'gemini' || val === 'google') return 'gemini';
  if (val === 'openai' || val === 'gpt') return 'openai';
  if (val === 'claude' || val === 'anthropic') return 'claude';
  return null;
}

function resolveStaticProviders(requested?: AiProvider): AiProvider[] {
  const primary =
    requested ?? normalizeProvider(STATIC_FALLBACK_ENV.AI_PROVIDER);
  const candidates: AiProvider[] = ['gemini', 'openai', 'claude'];
  const hasKey = (p: AiProvider): boolean => {
    if (p === 'gemini') return Boolean(STATIC_FALLBACK_ENV.GEMINI_API_KEY);
    if (p === 'openai') return Boolean(STATIC_FALLBACK_ENV.OPENAI_API_KEY);
    if (p === 'claude') return Boolean(STATIC_FALLBACK_ENV.CLAUDE_API_KEY);
    return false;
  };

  const ordered: AiProvider[] = [];
  if (primary && hasKey(primary)) {
    ordered.push(primary);
  }
  for (const c of candidates) {
    if (!ordered.includes(c) && hasKey(c)) {
      ordered.push(c);
    }
  }
  return ordered;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Failed to read audio blob'));
    reader.readAsDataURL(blob);
  });
}

async function queryStaticChatFallback(
  userQuestion: string,
  history: readonly ChatTurn[],
  options?: AskAssistantOptions
): Promise<string> {
  const providers = resolveStaticProviders(options?.provider);
  const envModel = (STATIC_FALLBACK_ENV.AI_MODEL ?? '').trim();

  for (const provider of providers) {
    try {
      if (provider === 'gemini' && STATIC_FALLBACK_ENV.GEMINI_API_KEY) {
        const model = options?.model || envModel || 'gemini-2.5-flash';
        const contents = [
          ...history.map((turn) => ({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          })),
          { role: 'user', parts: [{ text: userQuestion }] },
        ];
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
            model
          )}:generateContent?key=${encodeURIComponent(
            STATIC_FALLBACK_ENV.GEMINI_API_KEY
          )}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }],
              },
              contents,
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 220,
              },
            }),
          }
        );
        if (res.ok) {
          const data = (await res.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };
          const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
          if (text) return text;
        }
      } else if (provider === 'openai' && STATIC_FALLBACK_ENV.OPENAI_API_KEY) {
        const model = options?.model || envModel || 'gpt-4o-mini';
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${STATIC_FALLBACK_ENV.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_INSTRUCTION },
              ...history.map((t) => ({ role: t.role, content: t.text })),
              { role: 'user', content: userQuestion },
            ],
            temperature: 0.6,
            max_tokens: 220,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const text = data.choices?.[0]?.message?.content?.trim() ?? '';
          if (text) return text;
        }
      } else if (provider === 'claude' && STATIC_FALLBACK_ENV.CLAUDE_API_KEY) {
        const model =
          options?.model || envModel || 'claude-3-5-sonnet-latest';
        const normalized: Array<{
          role: 'user' | 'assistant';
          content: string;
        }> = [];
        for (const t of history) {
          if (normalized.length === 0 && t.role !== 'user') continue;
          const prev = normalized[normalized.length - 1];
          if (prev && prev.role === t.role) {
            prev.content = `${prev.content}\n${t.text}`;
          } else {
            normalized.push({ role: t.role, content: t.text });
          }
        }
        normalized.push({ role: 'user', content: userQuestion });

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': STATIC_FALLBACK_ENV.CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            max_tokens: 220,
            temperature: 0.6,
            system: SYSTEM_INSTRUCTION,
            messages: normalized,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            content?: Array<{ type?: string; text?: string }>;
          };
          const text =
            data.content?.find((b) => b.type === 'text')?.text?.trim() ?? '';
          if (text) return text;
        }
      }
    } catch {
      // Proceed to next fallback provider
    }
  }

  return '';
}

/**
 * Model-agnostic server-proxied Speech-to-Text fallback when the browser's
 * native SpeechRecognition API fails with a `network` error.
 */
export async function transcribeAudioBlob(audioBlob: Blob): Promise<string> {
  const mimeType = (audioBlob.type || 'audio/webm').split(';')[0];

  try {
    const audioBase64 = await blobToBase64(audioBlob);
    const response = await fetch(API_CONFIG.TRANSCRIBE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mimeType, audioBase64 }),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (response.ok && contentType.includes('application/json')) {
      const data = (await response.json()) as { text?: string };
      return data.text?.trim() ?? '';
    }

    // Static-hosting fallback (AWS Amplify static build)
    if (STATIC_FALLBACK_ENV.GEMINI_API_KEY) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          STATIC_FALLBACK_ENV.GEMINI_API_KEY
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { inlineData: { mimeType, data: audioBase64 } },
                  {
                    text: 'Transcribe the spoken English question in this audio clip verbatim. Output ONLY the transcribed words with no extra commentary.',
                  },
                ],
              },
            ],
          }),
        }
      );
      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
        if (text) return text;
      }
    }

    if (STATIC_FALLBACK_ENV.ELEVENLABS_API_KEY) {
      const formData = new FormData();
      formData.append('model_id', 'scribe_v1');
      formData.append('file', audioBlob, 'speech.webm');
      formData.append('language_code', 'en');
      const sttRes = await fetch(
        'https://api.elevenlabs.io/v1/speech-to-text',
        {
          method: 'POST',
          headers: { 'xi-api-key': STATIC_FALLBACK_ENV.ELEVENLABS_API_KEY },
          body: formData,
        }
      );
      if (sttRes.ok) {
        const data = (await sttRes.json()) as { text?: string };
        return data.text?.trim() ?? '';
      }
    }
  } catch (err) {
    console.warn('Server audio transcription fallback error:', err);
  }

  return '';
}

/**
 * Queries the portfolio AI assistant agnostic of the underlying LLM provider
 * (Gemini, OpenAI, or Claude configured on the server or Amplify static build).
 */
export async function askProfileAssistant(
  userQuestion: string,
  history: readonly ChatTurn[] = [],
  options?: AskAssistantOptions
): Promise<string> {
  // 1. Check if the question matches a deterministic custom Q&A rule first
  const customAnswer = matchCustomResponse(userQuestion);
  if (customAnswer) {
    return customAnswer;
  }

  // 2. Otherwise query the model-agnostic server endpoint (/api/chat)
  try {
    const response = await fetch(API_CONFIG.CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: userQuestion,
        history,
        systemInstruction: SYSTEM_INSTRUCTION,
        provider: options?.provider,
        model: options?.model,
      }),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (response.ok && contentType.includes('application/json')) {
      const data = (await response.json()) as {
        text?: string;
        provider?: AiProvider;
      };
      const reply = data.text?.trim();
      if (reply) {
        return formatPeriodsInText(reply);
      }
    }
  } catch (err) {
    console.warn('Server chat API fallback triggered:', err);
  }

  // 3. Static-host build fallback (e.g. AWS Amplify static CDN without /api/* Node server)
  const staticReply = await queryStaticChatFallback(
    userQuestion,
    history,
    options
  );
  if (staticReply) {
    return formatPeriodsInText(staticReply);
  }

  return buildLocalFallbackAnswer(userQuestion);
}
