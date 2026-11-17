const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getApiErrorMessage(error) {
  const details = error instanceof ApiError ? error.details : null;

  if (typeof details === 'string') return details;

  if (details && typeof details === 'object') {
    const message = details.message || details.detail || details.error;
    if (typeof message === 'string') return message;

    const fieldErrors = Object.entries(details)
      .map(([field, messages]) => {
        const text = Array.isArray(messages) ? messages.join(' ') : messages;
        return typeof text === 'string' ? `${field}: ${text}` : null;
      })
      .filter(Boolean);

    if (fieldErrors.length) return fieldErrors.join(' ');
  }

  if (error instanceof TypeError) {
    return 'Could not reach the server. Check that the backend is running and try again.';
  }

  return error instanceof Error ? error.message : 'Something went wrong.';
}

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}.`,
      response.status,
      data
    );
  }

  return data;
}
