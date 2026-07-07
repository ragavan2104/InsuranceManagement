import API from './api';

export const fileClaim = async (claimData) => {
  const response = await API.post('/Claim/file', claimData);
  return response.data;
};

export const getMyClaimsHistory = async () => {
  const response = await API.get('/Claim/my-history');
  return response.data;
};

export const getPendingClaimsQueue = async () => {
  const response = await API.get('/Claim/pending-queue');
  return response.data;
};

export const reviewClaim = async (id, reviewData) => {
  const response = await API.put(`/Claim/${id}/review`, reviewData);
  return response.data;
};

export const trackClaimStatus = async (id) => {
  const response = await API.get(`/Claim/${id}/Status`);
  return response.data;
};

export const getAllClaimsHistory = async () => {
  const response = await API.get('/Claim/all-history');
  return response.data;
};
