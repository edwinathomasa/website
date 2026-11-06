import { API_CONFIG, ENV } from '../../constants/config';
import { matchCustomResponse } from '../../data/customResponses';
import type { ChatTurn } from '../../types/voice';
import { formatPeriodsInText } from '../../utils/speechFormat';
import { SYSTEM_INSTRUCTION, buildLocalFallbackAnswer } from './profileKnowledge';

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
