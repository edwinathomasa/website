import type { TranscribeRequest, TranscribeResponse } from '@portfolio/shared';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { transcribeAudio } from '../services/llmRouter.js';
import { jsonResponse, parseJsonBody } from './http.js';

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    const body = parseJsonBody<TranscribeRequest>(event);
    const audioBase64 = (body.audioBase64 ?? '').trim();

    if (!audioBase64) {
      const empty: TranscribeResponse = { text: '' };
      return jsonResponse(200, empty);
    }

    const result = await transcribeAudio({
      audioBase64,
      mimeType: body.mimeType || 'audio/webm',
    });

    return jsonResponse(200, result);
  } catch (err) {
    console.error('POST /api/transcribe error:', err);
    return jsonResponse(500, {
      error: err instanceof Error ? err.message : 'Transcription failed.',
    });
  }
}
