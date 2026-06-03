const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  /* Proxy all API calls to Express server */
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );

  /* Proxy uploaded product images to Express server */
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};