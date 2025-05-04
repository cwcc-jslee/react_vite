export const setAuthToken = (userData) => {
  if (userData) {
    sessionStorage.setItem('user', JSON.stringify(userData));
  }
};

export const removeAuthToken = () => {
  sessionStorage.removeItem('user');
};

export const getStoredAuth = () => {
  try {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Failed to parse stored auth data:', error);
    return null;
  }
};
