/**
 * Adds a unique request ID to every API request for tracing
 */

import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export function withRequestId(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const requestId = req.headers.get('x-request-id') || `req_${randomUUID().slice(0, 8)}`;

    const response = await handler(req);
    response.headers.set('X-Request-ID', requestId);

    return response;
  };
}
