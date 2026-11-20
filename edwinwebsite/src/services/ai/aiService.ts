import { API_CONFIG } from '../../constants/config';
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

    if (response.ok) {
      const data = (await response.json()) as { text?: string };
      return data.text?.trim() ?? '';
    }
  } catch (err) {
    console.warn('Server audio transcription fallback error:', err);
  }

  return '';
}

/**
 * Queries the portfolio AI assistant agnostic of the underlying LLM provider
 * (Gemini, OpenAI, or Claude configured on the server).
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

    if (response.ok) {
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

  return buildLocalFallbackAnswer(userQuestion);
}
