import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';

export function jsonResponse(
  statusCode: number,
  payload: unknown
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };
}

export function binaryResponse(
  statusCode: number,
  buffer: Buffer,
  contentType: string
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      'Content-Type': contentType,
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  };
}

export function parseJsonBody<T>(event: APIGatewayProxyEventV2): T {
  if (!event.body) {
    return {} as T;
  }
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf-8')
    : event.body;
  return (raw ? JSON.parse(raw) : {}) as T;
}
