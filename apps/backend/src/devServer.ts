import 'dotenv/config';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { getBackendEnv } from './config/env.js';
import { handler as chatHandler } from './handlers/chat.js';
import { handler as healthHandler } from './handlers/health.js';
import { handler as profileHandler } from './handlers/profile.js';
import { handler as speakHandler } from './handlers/speak.js';
import { handler as transcribeHandler } from './handlers/transcribe.js';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function toMockLambdaEvent(
  req: IncomingMessage,
  body: string
): APIGatewayProxyEventV2 {
  const url = new URL(req.url ?? '/', 'http://localhost');
  return {
    version: '2.0',
    routeKey: `${req.method ?? 'GET'} ${url.pathname}`,
    rawPath: url.pathname,
    rawQueryString: url.search.slice(1),
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [
        k,
        Array.isArray(v) ? v.join(',') : (v ?? ''),
      ])
    ),
    requestContext: {
      accountId: 'local',
      apiId: 'local',
      domainName: 'localhost',
      domainPrefix: 'localhost',
      http: {
        method: req.method ?? 'GET',
        path: url.pathname,
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: req.headers['user-agent'] ?? '',
      },
      requestId: `local-${Date.now()}`,
      routeKey: `${req.method ?? 'GET'} ${url.pathname}`,
      stage: '$default',
      time: new Date().toISOString(),
      timeEpoch: Date.now(),
    },
    body,
    isBase64Encoded: false,
  };
}

function sendLambdaResult(
  res: ServerResponse,
  result: APIGatewayProxyStructuredResultV2,
  corsOrigin: string
): void {
  res.statusCode = result.statusCode ?? 200;
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      if (value !== undefined) {
        res.setHeader(key, String(value));
      }
    }
  }

  if (!result.body) {
    res.end();
    return;
  }

  if (result.isBase64Encoded) {
    res.end(Buffer.from(result.body, 'base64'));
  } else {
    res.end(result.body);
  }
}

const env = getBackendEnv();

const server = createServer(async (req, res) => {
  const urlPath = (req.url ?? '/').split('?')[0];
  const method = req.method ?? 'GET';

  if (method === 'OPTIONS') {
    sendLambdaResult(res, { statusCode: 204 }, env.corsOrigin);
    return;
  }

  try {
    const body = method === 'POST' ? await readBody(req) : '';
    const event = toMockLambdaEvent(req, body);

    if (method === 'GET' && urlPath === '/api/health') {
      sendLambdaResult(res, await healthHandler(), env.corsOrigin);
      return;
    }
    if (method === 'GET' && urlPath === '/api/profile') {
      sendLambdaResult(res, await profileHandler(), env.corsOrigin);
      return;
    }
    if (method === 'POST' && urlPath === '/api/chat') {
      sendLambdaResult(res, await chatHandler(event), env.corsOrigin);
      return;
    }
    if (method === 'POST' && urlPath === '/api/transcribe') {
      sendLambdaResult(res, await transcribeHandler(event), env.corsOrigin);
      return;
    }
    if (method === 'POST' && urlPath === '/api/speak') {
      sendLambdaResult(res, await speakHandler(event), env.corsOrigin);
      return;
    }

    sendLambdaResult(
      res,
      {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Route not found: ${method} ${urlPath}` }),
      },
      env.corsOrigin
    );
  } catch (err) {
    console.error('Local dev server error:', err);
    sendLambdaResult(
      res,
      {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal server error' }),
      },
      env.corsOrigin
    );
  }
});

server.listen(env.port, () => {
  console.log(`Backend dev server running at http://localhost:${env.port}`);
});
