const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://192.168.20.101:1337',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // '/api'를 제거합니다
      },
    }),
  );
};
