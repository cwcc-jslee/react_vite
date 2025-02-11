// src/shared/config/environment.js
// export const ENV = {
//   API_URL: import.meta.env.VITE_API_URL || 'http://192.168.20.101:1337',
//   BASE_URL: import.meta.env.VITE_APP_BASE_URL || '',
//   NODE_ENV: import.meta.env.NODE_ENV || 'development',
// };

export const ENV = {
  server: {
    host: import.meta.env.VITE_HOST,
    port: import.meta.env.VITE_PORT,
  },
  api: {
    url: import.meta.env.VITE_API_URL,
    timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
  },
  app: {
    nodeEnv: import.meta.env.NODE_ENV || 'development',
    isProduction: import.meta.env.NODE_ENV === 'production',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
};

/**
 * 환경변수 유효성 검사
 * @throws {Error} 필수 환경변수가 없을 경우
 */
const validateEnv = () => {
  const requiredEnvVars = ['VITE_HOST', 'VITE_PORT', 'VITE_API_URL'];

  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
};

// 앱 시작시 환경변수 검증
validateEnv();
