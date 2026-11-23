import {
  formatPeriodsInText,
  type AiProvider,
  type ApiErrorResponse,
  type ChatMessage,
  type ChatRequest,
  type ChatResponse,
  type ChatTurn,
  type TranscribeRequest,
  type TranscribeResponse,
} from '@portfolio/shared';
import { API_CONFIG } from '../../constants/config';

export interface AskAssistantOptions {
  readonly provider?: AiProvider;
  readonly model?: string;
}

/**
 * Converts UI `ChatTurn[]` history into provider-agnostic `{ role, content }[]`
 * messages.
 */
export function toChatMessages(history: readonly ChatTurn[]): ChatMessage[] {
  return history
    .map((turn) => ({
      role: turn.role,
      content: turn.text.trim(),
    }))
    .filter((msg) => msg.content.length > 0);
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

/**
 * Backend-proxied Speech-to-Text fallback when the browser's native
 * SpeechRecognition API is unavailable or blocked.
 */
export async function transcribeAudioBlob(audioBlob: Blob): Promise<string> {
  const mimeType = (audioBlob.type || 'audio/webm').split(';')[0];

  try {
    const audioBase64 = await blobToBase64(audioBlob);
    const payload: TranscribeRequest = { mimeType, audioBase64 };
    const response = await fetch(API_CONFIG.TRANSCRIBE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (response.ok && contentType.includes('application/json')) {
      const data = (await response.json()) as TranscribeResponse;
      return data.text?.trim() ?? '';
    }
  } catch (err) {
    console.warn('Backend audio transcription error:', err);
  }

  return '';
}

/**
 * Queries the backend `/api/chat` endpoint, which runs custom Q&A matching,
 * model-agnostic LLM routing (Gemini, OpenAI, Claude), and MongoDB grounding.
 */
export async function askProfileAssistant(
  userQuestion: string,
  history: readonly ChatTurn[] = [],
  options?: AskAssistantOptions
): Promise<string> {
  const conversationMessages: ChatMessage[] = [
    ...toChatMessages(history),
    { role: 'user', content: userQuestion.trim() },
  ];

  const payload: ChatRequest = {
    messages: conversationMessages,
    provider: options?.provider,
    model: options?.model,
  };

  const response = await fetch(API_CONFIG.CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (response.ok && contentType.includes('application/json')) {
    const data = (await response.json()) as ChatResponse;
    const reply = data.text?.trim();
    if (reply) {
      return formatPeriodsInText(reply);
    }
  }

  let errorMessage = `Chat request failed (HTTP ${response.status})`;
  if (contentType.includes('application/json')) {
    const errBody = (await response.json().catch(() => null)) as
      | ApiErrorResponse
      | null;
    if (errBody?.error) {
      errorMessage = errBody.error;
    }
  }

  throw new Error(errorMessage);
}
