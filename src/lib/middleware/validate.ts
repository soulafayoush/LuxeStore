/**
 * Validation middleware for API routes
 * Wraps a handler with Zod schema validation
 */

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { formatErrorResponse } from '@/lib/api-error';

type ValidationSource = 'body' | 'query' | 'params';

interface ValidateOptions {
  source?: ValidationSource;
}

/**
 * Wraps an API handler with Zod validation
 * @param schema - Zod schema to validate against
 * @param handler - The API route handler function
 * @param options - Validation source (body, query, params)
 */
export function validate<T extends z.ZodType>(
  schema: T,
  handler: (req: NextRequest, validatedData: z.infer<T>) => Promise<NextResponse>,
  options: ValidateOptions = {}
) {
  const { source = 'body' } = options;

  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      let rawData: unknown;

      switch (source) {
        case 'body':
          rawData = await req.json();
          break;
        case 'query': {
          const { searchParams } = new URL(req.url);
          rawData = Object.fromEntries(searchParams.entries());
          break;
        }
        case 'params':
          rawData = req.params;
          break;
      }

      const result = schema.safeParse(rawData);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: String(issue.path.join('.')),
          message: issue.message,
        }));

        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              statusCode: 422,
              details: errors,
            },
          },
          { status: 422 }
        );
      }

      return handler(req, result.data);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_JSON',
              message: 'Request body contains invalid JSON',
              statusCode: 400,
            },
          },
          { status: 400 }
        );
      }

      const formatted = formatErrorResponse(error);
      return NextResponse.json(formatted, { status: formatted.error?.statusCode ?? 500 });
    }
  };
}
