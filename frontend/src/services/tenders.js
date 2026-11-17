import { apiRequest } from './api';
import { getAccessToken } from './auth';

function authenticatedRequest(path, options = {}) {
  const token = getAccessToken();
  if (!token) throw new Error('You are not signed in.');

  return apiRequest(path, { ...options, token });
}

export function getTenders() {
  return authenticatedRequest('/api/tenders/');
}

export function getTender(id) {
  return authenticatedRequest(`/api/tenders/${id}/`);
}

export function createTender(payload) {
  return authenticatedRequest('/api/tenders/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
