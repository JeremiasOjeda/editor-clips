# Manual de Instalación - Editor de Clips

## Índice
1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Instalación](#instalación)
4. [Configuración](#configuración)
5. [Ejecución](#ejecución)
6. [Despliegue en Producción](#despliegue-en-producción)
7. [Solución de Problemas](#solución-de-problemas)
8. [Estructura del Proyecto](#estructura-del-proyecto)

## Descripción del Proyecto

Editor de Clips es una aplicación web full-stack desarrollada en React y Node.js que permite:
- Visualizar videos largos
- Seleccionar puntos de inicio y fin para recortar segmentos
- Descargar clips específicos
- Gestión de contenido multimedia
- Sistema de auditoría y logs
- Panel de administración

**Tecnologías utilizadas:**
- **Frontend:** React 19, Material-UI, Video.js
- **Backend:** Node.js, Express.js
- **Base de Datos:** MongoDB con Mongoose
- **Procesamiento de Video:** FFmpeg
- **Herramientas de Desarrollo:** Concurrently, Nodemon

## Requisitos del Sistema

### Requisitos Mínimos
- **Sistema Operativo:** Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **Node.js:** Versión 18.0.0 o superior
- **npm:** Versión 8.0.0 o superior
- **MongoDB:** Versión 5.0 o superior
- **RAM:** 4GB mínimo (8GB recomendado)
- **Espacio en Disco:** 2GB mínimo

### Requisitos Recomendados
- **Node.js:** Versión 20.x LTS
- **npm:** Versión 10.x
- **MongoDB:** Versión 7.x
- **RAM:** 8GB o superior
- **Espacio en Disco:** 5GB o superior

### Verificación de Requisitos

```bash
# Verificar versión de Node.js
node --version

# Verificar versión de npm
npm --version

# Verificar versión de MongoDB
mongod --version
```

## Instalación

### 1. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd editor-clips

# O si ya tienes el código, navegar al directorio
cd editor-clips
```

### 2. Instalar Dependencias

```bash
# Instalar todas las dependencias del proyecto
npm install

# Verificar que la instalación fue exitosa
npm list --depth=0
```

### 3. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```bash
# Crear archivo .env
touch .env
```

Agregar las siguientes variables al archivo `.env`:

```env
# Configuración del Servidor
PORT=5000
NODE_ENV=development

# Configuración de MongoDB
MONGODB_URI=mongodb://localhost:27017/editor-clips

# Configuración de CORS (para desarrollo)
CORS_ORIGIN=http://localhost:3000

# Configuración de Seguridad (opcional)
JWT_SECRET=tu_jwt_secret_aqui
ADMIN_PASSWORD=tu_password_admin

# Configuración de FFmpeg (opcional)
FFMPEG_PATH=/usr/bin/ffmpeg
```

### 4. Configurar MongoDB

#### Instalación de MongoDB

**Windows:**
1. Descargar MongoDB Community Server desde [mongodb.com](https://www.mongodb.com/try/download/community)
2. Instalar siguiendo el asistente
3. Crear directorio de datos: `mkdir C:\data\db`

**macOS:**
```bash
# Usando Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

**Ubuntu/Debian:**
```bash
# Importar clave pública
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Agregar repositorio
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Actualizar e instalar
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Iniciar MongoDB

```bash
# Iniciar servicio de MongoDB
sudo systemctl start mongod

# Verificar estado
sudo systemctl status mongod

# Habilitar inicio automático
sudo systemctl enable mongod
```

## Configuración

### 1. Configuración de la Base de Datos

La aplicación creará automáticamente las colecciones necesarias al iniciarse por primera vez.

### 2. Configuración de FFmpeg (Opcional)

Si planeas usar el procesamiento de video:

**Windows:**
1. Descargar FFmpeg desde [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extraer y agregar al PATH del sistema

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

### 3. Configuración de Desarrollo

El proyecto incluye configuración de proxy para desarrollo. El archivo `src/setupProxy.js` maneja las redirecciones de API automáticamente.

## Ejecución

### Modo Desarrollo

```bash
# Ejecutar servidor y cliente en modo desarrollo
npm run dev

# O ejecutar por separado:
# Terminal 1 - Servidor backend
npm run server

# Terminal 2 - Cliente frontend
npm start
```

### Modo Producción

```bash
# Construir la aplicación
npm run build

# Ejecutar solo el servidor (servirá los archivos estáticos)
npm run server
```

### Comandos Disponibles

```bash
# Desarrollo
npm start              # Inicia solo el cliente React
npm run server         # Inicia solo el servidor backend
npm run dev            # Inicia cliente y servidor simultáneamente
npm run dev:full       # Inicia con nodemon para auto-reload

# Producción
npm run build          # Construye la aplicación para producción
npm run server         # Ejecuta el servidor en modo producción

# Utilidades
npm test               # Ejecuta las pruebas
npm run install:all    # Instala dependencias en cliente y servidor
```

## Despliegue en Producción

### 1. Preparación del Entorno

```bash
# Configurar variables de entorno para producción
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://tu-servidor-mongodb:27017/editor-clips
```

### 2. Construcción para Producción

```bash
# Instalar dependencias
npm install --production

# Construir la aplicación
npm run build
```

### 3. Configuración del Servidor Web

**Usando PM2 (Recomendado):**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'editor-clips',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Usando Docker:**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "server"]
```

### 4. Configuración de Nginx (Opcional)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Solución de Problemas

### Problemas Comunes

#### 1. Error de Conexión a MongoDB
```bash
# Verificar que MongoDB esté ejecutándose
sudo systemctl status mongod

# Verificar conexión manual
mongo mongodb://localhost:27017/editor-clips
```

#### 2. Error de Puerto en Uso
```bash
# Verificar puertos en uso
netstat -tulpn | grep :5000
netstat -tulpn | grep :3000

# Matar proceso si es necesario
kill -9 <PID>
```

#### 3. Error de Dependencias
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 4. Error de CORS
Verificar configuración en `server.js` y variables de entorno.

#### 5. Error de FFmpeg
```bash
# Verificar instalación de FFmpeg
ffmpeg -version

# Verificar PATH
which ffmpeg
```

### Logs y Debugging

```bash
# Ver logs del servidor
npm run server

# Ver logs con nodemon
npm run server:dev

# Ver logs de PM2
pm2 logs editor-clips
```

## Estructura del Proyecto

```
editor-clips/
├── controllers/          # Controladores del backend
│   ├── auditController.js
│   ├── clipController.js
│   └── videoController.js
├── models/              # Modelos de MongoDB
│   ├── auditLog.js
│   ├── video.js
│   └── videoClip.js
├── routes/              # Rutas de la API
│   ├── auditRoutes.js
│   ├── clipRoutes.js
│   └── videoRoutes.js
├── src/                 # Código fuente del frontend
│   ├── components/      # Componentes React
│   ├── pages/          # Páginas de la aplicación
│   ├── services/       # Servicios y utilidades
│   └── utils/          # Utilidades adicionales
├── public/             # Archivos estáticos
├── server.js           # Servidor Express
├── package.json        # Dependencias y scripts
└── README.md           # Documentación del proyecto
```

## Contacto y Soporte

Para soporte técnico o reportar problemas:
- Revisar la sección de [Solución de Problemas](#solución-de-problemas)
- Consultar el [Manual de Usuario](MANUAL_USUARIO.md)
- Crear un issue en el repositorio del proyecto

---

**Nota:** Este manual está sujeto a actualizaciones. Para la versión más reciente.
