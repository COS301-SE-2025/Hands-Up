import React from 'react';
import { useTranslator } from '../../hooks/translateResults';
// import { useLandmarksDetection } from '../hooks/landmarksDetection';

export function CameraInput() {
  const { videoRef, canvasRef2 } = useTranslator();
//   useLandmarksDetection(videoRef, canvasRef2);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        style={{ width: '100%', height: '100%' }} 
      />
      <canvas 
        ref={canvasRef2} 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
      />
    </div>
  );
}