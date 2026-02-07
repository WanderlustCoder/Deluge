// API authentication utilities

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, hasScope, logApiRequest, ApiScope } from './keys';

export interface ApiContext {
  apiKey: {
    id: string;
    userId: string;
    scopes: string;
    rateLimit: number;
  };
  user: {
    id: string;
    email: string;
    name: string;
    accountType: string;
  };
}

// Authenticate API request and return context
export async function authenticateApiRequest(
  request: NextRequest,
  requiredScope?: ApiScope
): Promise<{ context: ApiContext | null; error: NextResponse | null }> {
  const startTime = Date.now();
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return {
      context: null,
      error: NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      ),
    };
  }

  const apiKey = await validateApiKey(authHeader);

  if (!apiKey) {
    return {
      context: null,
      error: NextResponse.json(
        { error: 'Invalid or expired API key' },
        { status: 401 }
      ),
    };
  }

  // Check scope if required
  if (requiredScope && !hasScope(apiKey, requiredScope)) {
    return {
      context: null,
      error: NextResponse.json(
        { error: `Insufficient scope. Required: ${requiredScope}` },
        { status: 403 }
      ),
    };
  }

  return {
    context: {
      apiKey: {
        id: apiKey.id,
        userId: apiKey.userId,
        scopes: apiKey.scopes,
        rateLimit: apiKey.rateLimit,
      },
      user: apiKey.user,
    },
    error: null,
  };
}

// Log API request after response
export async function logApiResponse(
  apiKeyId: string,
  request: NextRequest,
  statusCode: number,
  startTime: number
) {
  const responseTime = Date.now() - startTime;
  const endpoint = new URL(request.url).pathname;
  const method = request.method;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  await logApiRequest(
    apiKeyId,
    endpoint,
    method,
    statusCode,
    responseTime,
    ipAddress,
    userAgent
  );
}

// Create a standardized API response
export function apiResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Create an error response
export function apiError(
  message: string,
  status: number = 400,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: code || `ERR_${status}`,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// CORS headers for API responses
export function withCors(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  return response;
}
