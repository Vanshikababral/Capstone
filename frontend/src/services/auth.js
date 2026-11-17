import { apiRequest } from './api';

const TOKEN_KEYS = ['access', 'refresh'];

export function saveAuthTokens(tokens, rememberMe) {
  clearAuthTokens();
  const storage = rememberMe ? window.localStorage : window.sessionStorage;

  for (const key of TOKEN_KEYS) {
    if (tokens[key]) storage.setItem(`auth_${key}`, tokens[key]);
  }
}

export function getAccessToken() {
  return (
    window.sessionStorage.getItem('auth_access') ||
    window.localStorage.getItem('auth_access')
  );
}

export function clearAuthTokens() {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    for (const key of TOKEN_KEYS) {
      storage.removeItem(`auth_${key}`);
    }
  }
}

export function registerUser(payload) {
  return apiRequest('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(email, password) {
  return apiRequest('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentUser() {
  const token = getAccessToken();
  if (!token) throw new Error('You are not signed in.');

  return apiRequest('/api/auth/me/', { token });
}

export function getPendingRoleRequests() {
  const token = getAccessToken();
  if (!token) throw new Error('You are not signed in.');

  return apiRequest('/api/auth/role-requests/', { token });
}

export function decideRoleRequest(userId, decision) {
  const token = getAccessToken();
  if (!token) throw new Error('You are not signed in.');

  return apiRequest(`/api/auth/role-requests/${userId}/`, {
    method: 'POST',
    token,
    body: JSON.stringify({ decision }),
  });
}
