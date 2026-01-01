import API from '../config/api';

export const signup = async (userData) => {
  const response = await API.post('/api/auth/signup', userData);
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await API.post('/api/auth/login', credentials);
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const verifyToken = async () => {
  const response = await API.get('/api/auth/verify');
  return response.data;
};
