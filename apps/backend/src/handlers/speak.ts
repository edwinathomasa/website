import type { SpeakRequest } from '@portfolio/shared';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { synthesizeSpeech } from '../services/elevenLabs.js';
import { binaryResponse, jsonResponse, parseJsonBody } from './http.js';

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  try {
    const body = parseJsonBody<SpeakRequest>(event);
    const text = (body.text ?? '').trim();

    if (!text) {
      return jsonResponse(400, { error: 'Text is required for speech synthesis.' });
    }

    const { audioBuffer, contentType } = await synthesizeSpeech(text);
    return binaryResponse(200, audioBuffer, contentType);
  } catch (err) {
    console.error('POST /api/speak error:', err);
    const message =
      err instanceof Error ? err.message : 'Speech synthesis failed.';
    const statusCode = message.includes('not configured') ? 503 : 500;
    return jsonResponse(statusCode, { error: message });
  }
}
