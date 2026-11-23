import type { HealthResponse } from '@portfolio/shared';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { getBackendEnv } from '../config/env.js';
import { pingDb } from '../db/mongoClient.js';
import { getConfiguredProviders } from '../services/llmRouter.js';
import { jsonResponse } from './http.js';

export async function handler(): Promise<APIGatewayProxyStructuredResultV2> {
  const env = getBackendEnv();
  const dbConnected = env.mongoDbUri ? await pingDb() : false;
  const providers = getConfiguredProviders();
  const ttsConfigured = Boolean(env.elevenLabsApiKey && env.elevenLabsVoiceId);

  const payload: HealthResponse = {
    status: dbConnected ? 'ok' : 'degraded',
    db: dbConnected ? 'connected' : 'disconnected',
    providers,
    ttsConfigured,
    timestamp: new Date().toISOString(),
  };

  return jsonResponse(dbConnected ? 200 : 503, payload);
}
