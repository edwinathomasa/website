import { API_CONFIG, ENV } from '../../constants/config';
import { matchCustomResponse } from '../../data/customResponses';
import type { ChatTurn } from '../../types/voice';
import { formatPeriodsInText } from '../../utils/speechFormat';
import { SYSTEM_INSTRUCTION, buildLocalFallbackAnswer } from './profileKnowledge';

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
 * Fallback Speech-to-Text when the browser's native SpeechRecognition API
 * fails with a `network` error (common in Brave, Arc, Electron, or restricted networks).
 * Uses Gemini 2.5 Flash multimodal audio first, then ElevenLabs Scribe STT.
 */
export async function transcribeAudioBlob(audioBlob: Blob): Promise<string> {
  const mimeType = (audioBlob.type || 'audio/webm').split(';')[0];

  // 1. Try Gemini 2.5 Flash audio transcription
  if (ENV.GEMINI_API_KEY) {
    try {
      const base64Data = await blobToBase64(audioBlob);
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: API_CONFIG.GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
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
      const text = response.text?.trim() ?? '';
      if (text) return text;
    } catch (err) {
      console.warn('Gemini audio transcription fallback error:', err);
    }
  }

  // 2. Try ElevenLabs Scribe v1 Speech-to-Text
  if (ENV.ELEVENLABS_API_KEY) {
    try {
      const formData = new FormData();
      formData.append('model_id', 'scribe_v1');
      formData.append('file', audioBlob, 'speech.webm');
      formData.append('language_code', 'en');

      const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': ENV.ELEVENLABS_API_KEY,
        },
        body: formData,
      });

      if (res.ok) {
        const data = (await res.json()) as { text?: string };
        const text = data.text?.trim() ?? '';
        if (text) return text;
      }
    } catch (err) {
      console.warn('ElevenLabs STT fallback error:', err);
    }
  }

  return '';
}

export async function askProfileAssistant(
  userQuestion: string,
  history: readonly ChatTurn[] = []
): Promise<string> {
  // 1. Check if the question matches a custom Q&A rule first
  const customAnswer = matchCustomResponse(userQuestion);
  if (customAnswer) {
    return customAnswer;
  }

  // 2. Otherwise lazy-load and query Gemini with full profile + custom Q&A context
  const apiKey = ENV.GEMINI_API_KEY;
  if (!apiKey) {
    return buildLocalFallbackAnswer(userQuestion);
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const contents = [
      ...history.map((turn) => ({
        role: turn.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: turn.text }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: userQuestion }],
      },
    ];

    const response = await ai.models.generateContent({
      model: API_CONFIG.GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: API_CONFIG.GEMINI_TEMPERATURE,
        maxOutputTokens: API_CONFIG.GEMINI_MAX_TOKENS,
      },
    });

    const reply = response.text?.trim();
    if (reply) {
      return formatPeriodsInText(reply);
    }
  } catch (err) {
    console.warn('Gemini API fallback triggered:', err);
  }

  return buildLocalFallbackAnswer(userQuestion);
}
