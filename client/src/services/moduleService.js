import API from '../config/api';

export const getModules = async (category) => {
  const params = category ? `?category=${category}` : '';
  const response = await API.get(`/api/modules${params}`);
  return response.data;
};

export const getModuleById = async (id) => {
  const response = await API.get(`/api/modules/${id}`);
  return response.data;
};

export const startModule = async (id) => {
  const response = await API.post(`/api/modules/${id}/start`);
  return response.data;
};

export const completeModule = async (id) => {
  const response = await API.post(`/api/modules/${id}/complete`);
  return response.data;
};

export const getUserProgress = async () => {
  const response = await API.get('/api/users/progress');
  return response.data;
};
