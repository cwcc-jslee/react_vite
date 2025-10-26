// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url'; // ✅ 추가

// ✅ ES Module에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Vite 설정
 * @param {Object} param0 - Vite 설정 파라미터
 * @param {string} param0.mode - 실행 모드 (development | production)
 */
export default defineConfig(({ mode }) => {
  // 환경변수 로드
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      // 환경변수에서 host, port 가져오기
      host: env.VITE_HOST || '192.168.20.101',
      port: parseInt(env.VITE_PORT) || 3001,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://192.168.20.101:1337',
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (mode === 'development') {
                console.log('Proxying:', req.method, req.url);
              }
            });
          },
        },
      },
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        // 주요 디렉토리 별칭 설정
        '@': path.resolve(__dirname, './src'),
        '@features': path.resolve(__dirname, './src/features'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@config': path.resolve(__dirname, './src/shared/config'),
        '@utils': path.resolve(__dirname, './src/shared/utils'),
        '@hooks': path.resolve(__dirname, './src/shared/hooks'),
        '@components': path.resolve(__dirname, './src/shared/components'),
      },
    },
    // 빌드 최적화 설정
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
      // 환경변수를 클라이언트에서 사용할 수 있도록 설정
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    define: {
      // 빌드 시 환경변수 주입
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
    optimizeDeps: {
      include: ['recharts'],
    },
  };
});
