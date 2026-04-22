<div align="center">

# 🎬 Editor de Clips de Video

**Aplicación web full-stack para recortar y descargar segmentos específicos de videos largos.**

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Material UI](https://img.shields.io/badge/MUI-6-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

</div>

---

## 📖 Descripción

**Editor de Clips** es una aplicación web que permite a los usuarios visualizar videos largos, seleccionar un rango de tiempo específico y **descargar únicamente ese fragmento** como un archivo independiente. Ideal para compartir momentos puntuales de clases, reuniones, eventos deportivos o cualquier contenido audiovisual extenso.

Incluye además un **panel de administración** con gestión de videos, sistema de auditoría y logs de actividad.

---

## ✨ Características

- 🎞️ **Reproductor de video** integrado con controles avanzados (Video.js).
- ✂️ **Selector de rango** intuitivo para marcar inicio y fin del clip.
- ⬇️ **Descarga directa** del segmento recortado.
- 📱 **Diseño responsive**, compatible con dispositivos móviles.
- 🔐 **Panel de administración** protegido con autenticación.
- 📊 **Sistema de auditoría**: registra cada acción realizada en la plataforma.
- 🧩 **Arquitectura modular** separando backend, frontend y servicios.
- 🎥 **Procesamiento con FFmpeg** en el cliente para recortes eficientes.
- 🗄️ **Persistencia en MongoDB** para videos, clips y logs.

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Uso |
|---|---|
| [React 19](https://react.dev/) | Framework de UI |
| [Material UI 6](https://mui.com/) | Biblioteca de componentes |
| [React Router 6](https://reactrouter.com/) | Enrutamiento SPA |
| [Video.js](https://videojs.com/) | Reproductor de video |
| [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) | Procesamiento de video en el navegador |

### Backend
| Tecnología | Uso |
|---|---|
| [Node.js](https://nodejs.org/) | Entorno de ejecución |
| [Express 5](https://expressjs.com/) | Servidor HTTP y API REST |
| [Mongoose](https://mongoosejs.com/) | ODM para MongoDB |
| [MongoDB](https://www.mongodb.com/) | Base de datos NoSQL |
| [dotenv](https://github.com/motdotla/dotenv) | Gestión de variables de entorno |
| [CORS](https://github.com/expressjs/cors) | Cross-Origin Resource Sharing |

### Herramientas de desarrollo
- [Concurrently](https://github.com/open-cli-tools/concurrently) — ejecuta cliente y servidor en paralelo.
- [Nodemon](https://nodemon.io/) — auto-recarga del backend.

---

## 📋 Requisitos previos

Antes de instalar, asegúrate de tener:

- **Node.js** `>= 18.0.0` ([descargar](https://nodejs.org/))
- **npm** `>= 8.0.0` (viene con Node)
- **MongoDB** `>= 5.0` local o una URI de [MongoDB Atlas](https://www.mongodb.com/atlas)
- **FFmpeg** instalado (opcional, para funcionalidades server-side)
- **Git**

Verifica las versiones:

```bash
node --version
npm --version
mongod --version
```

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone git@github.com:JeremiasOjeda/editor-clips.git
cd editor-clips
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto a partir del ejemplo:

```bash
cp .env.example .env
```

Luego edítalo con tus valores reales:

```env
# Entorno de ejecución
NODE_ENV=development

# Puerto del servidor Express (backend)
PORT=5000

# Conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/editor-clips

# URL de la API que consume el cliente React
REACT_APP_API_URL=http://localhost:5000/api
```

> ⚠️ **Nunca subas tu `.env` al repositorio.** Ya está incluido en `.gitignore`.

### 4. Iniciar MongoDB

```bash
# Linux
sudo systemctl start mongod

# macOS (con Homebrew)
brew services start mongodb-community
```

---

## ▶️ Uso

### Modo desarrollo (frontend + backend simultáneos)

```bash
npm run dev
```

Esto levanta:
- 🖥️ **Backend** en `http://localhost:5000`
- 🌐 **Frontend** en `http://localhost:3000`

### Otros comandos

| Comando | Descripción |
|---|---|
| `npm start` | Inicia solo el cliente React |
| `npm run server` | Inicia solo el servidor Express |
| `npm run server:dev` | Servidor con recarga automática (nodemon) |
| `npm run dev` | Cliente y servidor en paralelo |
| `npm run dev:full` | Cliente + servidor con hot-reload |
| `npm run build` | Genera el build de producción |
| `npm test` | Ejecuta las pruebas unitarias |

---

## 📁 Estructura del proyecto

```
editor-clips/
├── controllers/              # Lógica de negocio del backend
│   ├── auditController.js
│   ├── clipController.js
│   └── videoController.js
├── models/                   # Modelos Mongoose
│   ├── auditLog.js
│   ├── video.js
│   └── videoClip.js
├── routes/                   # Endpoints de la API REST
│   ├── auditRoutes.js
│   ├── clipRoutes.js
│   └── videoRoutes.js
├── public/                   # Archivos estáticos del cliente
├── src/                      # Código fuente del frontend React
│   ├── components/           # Componentes reutilizables
│   ├── pages/                # Vistas principales
│   ├── services/             # Clientes de API y lógica de negocio
│   ├── config/               # Configuración (API, constantes)
│   ├── utils/                # Helpers y utilidades
│   └── theme.js              # Tema de Material UI
├── server.js                 # Punto de entrada del backend
├── package.json
├── .env.example              # Plantilla de variables de entorno
├── .gitignore
├── MANUAL_INSTALACION.md     # Guía de instalación detallada
├── MANUAL_USUARIO.md         # Guía de uso para el usuario final
└── README.md
```

---

## 🔌 Endpoints principales de la API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/videos` | Lista todos los videos disponibles |
| `GET` | `/api/videos/:id` | Obtiene un video específico |
| `POST` | `/api/clips` | Registra un nuevo clip generado |
| `GET` | `/api/audit` | Obtiene los logs de auditoría (admin) |

> Consulta `routes/` para ver la especificación completa.

---

## 🚢 Despliegue en producción

### Build de producción

```bash
npm run build
npm run server
```

### Con PM2

```bash
npm install -g pm2
pm2 start server.js --name editor-clips
pm2 save
pm2 startup
```

### Con Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "server"]
```

Para una guía completa consulta el [**Manual de Instalación**](MANUAL_INSTALACION.md).

---

## 🐛 Solución de problemas

<details>
<summary><strong>Error de conexión a MongoDB</strong></summary>

```bash
sudo systemctl status mongod
mongosh mongodb://localhost:27017/editor-clips
```
Verifica que el servicio esté activo y que `MONGODB_URI` sea correcta.
</details>

<details>
<summary><strong>Puerto en uso</strong></summary>

```bash
sudo lsof -i :5000
kill -9 <PID>
```
O cambia el puerto en tu archivo `.env`.
</details>

<details>
<summary><strong>Error al instalar dependencias</strong></summary>

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```
</details>

<details>
<summary><strong>FFmpeg no se encuentra</strong></summary>

```bash
ffmpeg -version
which ffmpeg
```
Si no lo tienes instalado, consulta la sección de instalación del [Manual de Instalación](MANUAL_INSTALACION.md).
</details>

---

## 📚 Documentación adicional

- 📘 [**Manual de Instalación**](MANUAL_INSTALACION.md) — Guía técnica detallada paso a paso.
- 📗 [**Manual de Usuario**](MANUAL_USUARIO.md) — Guía de uso para el usuario final.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para proponer cambios:

1. Haz un **fork** del proyecto.
2. Crea una rama con tu feature: `git checkout -b feature/nueva-funcionalidad`.
3. Confirma tus cambios: `git commit -m "feat: agrega nueva funcionalidad"`.
4. Sube la rama: `git push origin feature/nueva-funcionalidad`.
5. Abre un **Pull Request**.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Jeremías Ojeda**

- GitHub: [@JeremiasOjeda](https://github.com/JeremiasOjeda)

---

<div align="center">

Si este proyecto te resulta útil, ¡considera darle una ⭐ en GitHub!

</div>
