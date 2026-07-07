import API from './api';

export const submitProposal = async (proposalData) => {
  const response = await API.post('/Proposal/Submit', proposalData);
  return response.data;
};

export const getProposalById = async (id) => {
  const response = await API.get(`/Proposal/${id}`);
  return response.data;
};

export const getMyProposalHistory = async () => {
  const response = await API.get('/Proposal/UserProposals');
  return response.data;
};

export const getPendingProposals = async () => {
  const response = await API.get('/Proposal/Pending');
  return response.data;
};

export const reviewProposal = async (id, reviewData) => {
  const response = await API.put(`/Proposal/${id}/review`, reviewData);
  return response.data;
};

export const getAllProposalsHistory = async () => {
  const response = await API.get('/Proposal/History');
  return response.data;
};