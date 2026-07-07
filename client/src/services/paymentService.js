import API from './api';

export const processCheckout = async (paymentData) => {
  const response = await API.post('/Payment/checkout', paymentData);
  return response.data;
};
