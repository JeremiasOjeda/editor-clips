const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conexión exitosa a MongoDB');
})
.catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});

// Ruta simple para verificar la conexión
app.get('/api/check-connection', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ message: 'Conexión a MongoDB establecida correctamente', status: 'connected' });
  } else {
    res.status(500).json({ message: 'No hay conexión a MongoDB', status: 'disconnected' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

