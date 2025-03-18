import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Box, Paper, Typography } from '@mui/material';

function VideoPlayer({ videoSrc }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Efecto para inicializar y limpiar Video.js
  useEffect(() => {
    // Verificamos que el elemento de video exista
    if (!videoRef.current) {
      console.error('Elemento de video no encontrado');
      return;
    }

    // Si ya hay un reproductor, lo limpiamos primero
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // Inicializamos un nuevo reproductor
    const videoElement = videoRef.current;
    const player = videojs(videoElement, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      responsive: true,
      playbackRates: [0.5, 1, 1.5, 2],
      sources: [{
        src: videoSrc,
        type: 'video/mp4'
      }]
    });

    player.ready(function() {
      console.log('Player is ready with source:', videoSrc);
    });

    // Almacenamos la referencia del reproductor
    playerRef.current = player;

    // Función de limpieza
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoSrc]);

  if (!videoSrc) {
    return (
      <Paper elevation={2}>
        <Box bgcolor="black" color="white" p={4} textAlign="center">
          <Typography variant="body1">
            No hay video disponible. Por favor, seleccione un código válido.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2}>
      <Box p={0} bgcolor="black">
        {/* Contenedor explícito para Video.js */}
        <div className="video-container" style={{ width: '100%' }}>
          {/* El div data-vjs-player es importante para Video.js */}
          <div data-vjs-player style={{ width: '100%' }}>
            <video 
              ref={videoRef}
              className="video-js vjs-big-play-centered"
              controls
              preload="auto"
              crossOrigin="anonymous"
              poster=""
              style={{ width: '100%', height: 'auto' }}
            >
              <source src={videoSrc} type="video/mp4" />
              <p className="vjs-no-js">
                Para ver este video, por favor habilite JavaScript y considere actualizar a un
                navegador web que soporte video HTML5.
              </p>
            </video>
          </div>
        </div>
      </Box>
    </Paper>
  );
}

export default VideoPlayer;