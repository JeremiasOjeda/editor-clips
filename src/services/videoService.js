// Servicio para manejar la obtención de videos
// En un escenario real, esto se conectaría a una API o servidor

// Videos de ejemplo de dominio público
const SAMPLE_VIDEOS = {
  'test': {
    id: 'test',
    title: 'Video Test (pequeño)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Video de ejemplo confiable
    duration: 15, // 15 segundos
    thumbnail: ''
  },
  'demo1': {
    id: 'demo1',
    title: 'Big Buck Bunny (Sample)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596, // 9:56 en segundos
    thumbnail: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png'
  },
  'demo2': {
    id: 'demo2',
    title: 'Elephant Dream (Sample)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653, // 10:53 en segundos
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/800px-Elephants_Dream_s5_both.jpg'
  },
  'demo3': {
    id: 'demo3',
    title: 'Grabacion de partido 2',
    url: 'https://res.cloudinary.com/duy3ncazx/video/upload/v1741812770/Videos%20del%20Recinto/w8idxnxya7qmbgbwtfc5.mp4',
    duration: 28, // 00:28 en segundos
    thumbnail: ''
  },
  'demo4': {
    id: 'demo4',
    title: 'Grabacion de partido',
    url: 'https://res.cloudinary.com/duy3ncazx/video/upload/v1741813693/Videos%20del%20Recinto/tiscx94szyl6u4ysuhhn.mp4',
    duration: 13, // 12:14 en segundos
    thumbnail: ''
  }
};

// Función para obtener un video por su código
export const getVideoByCode = (code) => {
  // En una aplicación real, esto haría una petición a una API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const video = SAMPLE_VIDEOS[code];
      if (video) {
        console.log(`Video encontrado para código ${code}:`, video);
        resolve(video);
      } else {
        console.error(`No se encontró ningún video con el código: ${code}`);
        reject(new Error(`No se encontró ningún video con el código: ${code}`));
      }
    }, 500); // Simula un pequeño retraso de red
  });
};

// Función para obtener todos los códigos válidos
export const getValidCodes = () => {
  return Object.keys(SAMPLE_VIDEOS);
};