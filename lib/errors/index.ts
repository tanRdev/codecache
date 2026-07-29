// Sanitize errors before sending to client
export function sanitizeError(error: unknown): { message: string; code?: string } {
  // Don't expose internal details
  if (error instanceof Error) {
    // Check if it's a known safe error
    if (error.message.toLowerCase().includes('rate limit') ||
        error.message.toLowerCase().includes('too many')) {
      return { message: 'Too many attempts. Please try again later.', code: 'RATE_LIMITED' };
    }
    if (error.message.toLowerCase().includes('not found')) {
      return { message: 'Resource not found.', code: 'NOT_FOUND' };
    }
    if (error.message.toLowerCase().includes('unauthorized') ||
        error.message.toLowerCase().includes('forbidden') ||
        error.message.toLowerCase().includes('access denied')) {
      return { message: 'Access denied.', code: 'UNAUTHORIZED' };
    }
    if (error.message.toLowerCase().includes('invalid')) {
      return { message: 'Invalid request.', code: 'INVALID_REQUEST' };
    }

    // Generic error for everything else
    return { message: 'An error occurred. Please try again.', code: 'INTERNAL_ERROR' };
  }

  return { message: 'An error occurred. Please try again.' };
}

// Sanitize for logging (keep more details server-side)
export function sanitizeForLogging(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'), // Limit stack trace
    };
  }

  return { error: String(error) };
}

// Usage in API routes
export function handleApiError(error: unknown): Response {
  const sanitized = sanitizeError(error);

  // Log the real error server-side (but sanitized)
  console.error('API Error:', sanitizeForLogging(error));

  // Return sanitized error to client
  return Response.json(sanitized, { status: 500 });
}
