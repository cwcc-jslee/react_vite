// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');
const { ENV } = require('./shared/config/environment');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: ENV.API_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
      // 개발 환경에서 디버깅을 위한 로깅 추가
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        if (ENV.NODE_ENV === 'development') {
          console.log('Proxying:', req.method, req.path);
        }
      },
    }),
  );
};
