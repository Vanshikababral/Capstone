import { getAccessToken } from './auth';
import { apiRequest } from './api';

function authenticatedRequest(path, options = {}) {
  const token = getAccessToken();
  if (!token) throw new Error('You are not signed in.');

  return apiRequest(path, { ...options, token });
}

export function getBid(id) {
  return authenticatedRequest(`/api/bids/${encodeURIComponent(id)}/`);
}

export function getBids() {
  return authenticatedRequest('/api/bids/');
}

export function getTender(id) {
  return authenticatedRequest(`/api/tenders/${encodeURIComponent(id)}/`);
}

export function getTenderRequirements(tenderId) {
  return authenticatedRequest(
    `/api/requirements/?tender=${encodeURIComponent(tenderId)}`
  );
}

export function getBidDocuments(bidId) {
  return authenticatedRequest(
    `/api/documents/?bid=${encodeURIComponent(bidId)}`
  );
}

export function uploadBidDocument({ bidId, requirementId, documentType, file }) {
  const formData = new FormData();
  formData.append('bid', bidId);
  formData.append('requirement', requirementId);
  formData.append('document_type', documentType);
  formData.append('title', file.name);
  formData.append('file', file);

  return authenticatedRequest('/api/documents/', {
    method: 'POST',
    body: formData,
  });
}

export function deleteBidDocument(documentId) {
  return authenticatedRequest(`/api/documents/${documentId}/`, {
    method: 'DELETE',
  });
}
