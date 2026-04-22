const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Importar rutas
const videoRoutes = require('./routes/videoRoutes');
// Importar controlador de clips directamente si el archivo de rutas no existe
const clipController = require('./controllers/clipController');
const auditRoutes = require('./routes/auditRoutes');

// Importar controladores para inicialización
const videoController = require('./controllers/videoController');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para CORS - configuración ampliada
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tudominio.com', 'http://localhost:3000'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));

// Middleware para servir archivos estáticos (para producción)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// Middleware para cabeceras SharedArrayBuffer (necesario para FFmpeg)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conexión exitosa a MongoDB');
  // Inicializar videos predeterminados si es necesario
  videoController.initializeDefaultVideos();
})
.catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});

// Definir rutas API
app.use('/api/videos', videoRoutes);

// Configurar rutas de clips manualmente ya que el archivo puede estar vacío
const clipRouter = express.Router();
clipRouter.get('/', clipController.getAllClips);
clipRouter.get('/video/:videoCode', clipController.getClipsByVideo);
clipRouter.post('/', clipController.createClip);
clipRouter.get('/stats/overview', clipController.getClipStats);
clipRouter.get('/:id', clipController.getClipById);
clipRouter.delete('/:id', clipController.deleteClip);
app.use('/api/clips', clipRouter);

// Usar las rutas de auditoría
app.use('/api/audit', auditRoutes);

// Ruta simple para verificar la conexión
app.get('/api/check-connection', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ message: 'Conexión a MongoDB establecida correctamente', status: 'connected' });
  } else {
    res.status(500).json({ message: 'No hay conexión a MongoDB', status: 'disconnected' });
  }
});

// Ruta para capturar todas las solicitudes no manejadas (para SPA en producción)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Algo salió mal!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'desarrollo'}`);
});