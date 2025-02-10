import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '192.168.20.101',
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://192.168.20.101:1337',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', function (proxyReq, req, _res) {
            console.log('Proxy Request:', req.method, req.url);
          });
          proxy.on('proxyRes', function (proxyRes, req, _res) {
            console.log('Proxy Response:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', function (err, _req, _res) {
            console.error('Proxy Error:', err);
          });
        },
      },
    },
  },
  // resolve: {
  //   alias: {
  //     '@': path.resolve(__dirname, './src')
  //   }
  // }
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
});
