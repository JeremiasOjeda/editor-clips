const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Este middleware agrega los encabezados necesarios para SharedArrayBuffer
  app.use(function(req, res, next) {
    // Estos encabezados son esenciales para habilitar SharedArrayBuffer
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
  });
  
  // Configurar proxy para la API en desarrollo
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // No es necesario reescribir el path
      },
      // Log para depuración
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
      },
      // Configuración de errores
      onError: (err, req, res) => {
        console.error('[Proxy Error]', err);
        res.writeHead(500, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Error de conexión al servidor de API',
          error: err.message
        }));
      }
    })
  );
};