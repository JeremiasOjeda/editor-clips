import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Box, Paper } from '@mui/material';

function VideoPlayer({ videoSrc }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Asegúrate de que el video está disponible
    if (!videoRef.current) return;

    // Inicializa Video.js solo si no hay un jugador existente
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      
      playerRef.current = videojs(videoElement, {
        controls: true,
        fluid: true,
        responsive: true,
        aspectRatio: '16:9',
        preload: 'auto',
        playbackRates: [0.5, 1, 1.5, 2]
      }, () => {
        console.log('Player is ready');
      });
    }

    // Actualizar la fuente si cambia
    if (playerRef.current && videoSrc) {
      playerRef.current.src({ src: videoSrc, type: 'video/mp4' });
    }

    // Limpia el reproductor cuando el componente se desmonte
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoSrc]);

  return (
    <Paper elevation={2}>
      <Box bgcolor="black" p={1}>
        <div data-vjs-player>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
          />
        </div>
      </Box>
    </Paper>
  );
}

export default VideoPlayer;