import {
  formatPeriodsInText,
  type ChatMessage,
  type ChatRequest,
  type ChatResponse,
} from '@portfolio/shared';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { getProfileDocument, getQARulesDocument } from '../db/mongoClient.js';
import { generateModelAgnosticReply } from '../services/llmRouter.js';
import {
  buildLocalFallbackAnswer,
  buildSystemInstruction,
  hasContextualFollowUpReference,
} from '../services/promptBuilder.js';
import {
  matchCustomResponse,
  matchKeywordFallback,
} from '../services/qaMatcher.js';
import { jsonResponse, parseJsonBody } from './http.js';

function normalizeMessages(
  messages?: readonly ChatMessage[]
): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((m) => ({
      role: m.role,
      content: (m.content ?? '').trim(),
    }))
    .filter(
      (m): m is ChatMessage =>
        (m.role === 'user' || m.role === 'assistant') && m.content.length > 0
    );
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    const body = parseJsonBody<ChatRequest>(event);
    const messages = normalizeMessages(body.messages);

    if (messages.length === 0) {
      return jsonResponse(400, {
        error: 'Request must include at least one non-empty chat message.',
      });
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (!lastUserMessage) {
      return jsonResponse(400, {
        error: 'Request must include a user message.',
      });
    }

    const [profile, qaRules] = await Promise.all([
      getProfileDocument(),
      getQARulesDocument(),
    ]);

    if (!profile || !qaRules) {
      return jsonResponse(503, {
        error:
          'Profile or Q&A rules not found in MongoDB. Run the seed script first.',
      });
    }

    const priorMessages = messages.slice(0, -1);
    const question = lastUserMessage.content;
    const isContextualFollowUp =
      priorMessages.length > 0 && hasContextualFollowUpReference(question);

    // Tier 1 & Tier 2: Deterministic custom Q&A and keyword fallbacks
    if (!isContextualFollowUp) {
      const customAnswer = matchCustomResponse(question, profile, qaRules);
      if (customAnswer) {
        const res: ChatResponse = {
          text: customAnswer,
          source: 'custom_qa',
        };
        return jsonResponse(200, res);
      }

      const keywordAnswer = matchKeywordFallback(question, profile, qaRules);
      if (keywordAnswer) {
        const res: ChatResponse = {
          text: keywordAnswer,
          source: 'keyword_fallback',
        };
        return jsonResponse(200, res);
      }
    }

    // Tier 3: Model-agnostic LLM router grounded in MongoDB profile + Q&A
    const systemInstruction = buildSystemInstruction(profile, qaRules);
    const llmResult = await generateModelAgnosticReply({
      messages,
      systemInstruction,
      requestedProvider: body.provider,
      requestedModel: body.model,
    });

    if (llmResult) {
      const res: ChatResponse = {
        text: formatPeriodsInText(llmResult.text),
        source: 'llm',
        provider: llmResult.provider,
        model: llmResult.model,
      };
      return jsonResponse(200, res);
    }

    // Tier 4: Context-aware deterministic fallback
    const fallbackText = buildLocalFallbackAnswer(
      question,
      priorMessages,
      profile,
      qaRules
    );
    const res: ChatResponse = {
      text: fallbackText,
      source: 'local_fallback',
    };
    return jsonResponse(200, res);
  } catch (err) {
    console.error('POST /api/chat error:', err);
    return jsonResponse(500, {
      error: err instanceof Error ? err.message : 'Chat request failed.',
    });
  }
}
