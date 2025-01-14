// src/shared/config/environment.js
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://192.168.20.101:1337',
  BASE_URL: import.meta.env.VITE_APP_BASE_URL || '',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
};
