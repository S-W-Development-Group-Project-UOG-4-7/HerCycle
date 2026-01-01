export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const getUserFromStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setUserToStorage = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUserFromStorage = () => {
  localStorage.removeItem('user');
};
