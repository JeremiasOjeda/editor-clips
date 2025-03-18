// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Este middleware agrega los encabezados necesarios para SharedArrayBuffer
  app.use(function(req, res, next) {
    // Estos encabezados son esenciales para habilitar SharedArrayBuffer
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
  });
};