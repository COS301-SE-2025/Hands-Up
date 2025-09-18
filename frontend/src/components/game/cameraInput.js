import React from 'react';
import { useTranslator } from '../../hooks/translateResults';
// import { useLandmarksDetection } from '../hooks/landmarksDetection';

export function CameraInput({ progress = 0, show = true, onSkip }) {
  const { videoRef, canvasRef2 } = useTranslator();
//   useLandmarksDetection(videoRef, canvasRef2);

  if (!show) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '30%',              
      left: '50%',
      transform: 'translateX(-50%)', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 50,
      gap: '1rem'
    }}>
      {/* Camera wrapper */}
      <div style={{
        width: '25vw',
        maxWidth: '300px',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        background: 'yellow',
      }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <canvas 
          ref={canvasRef2} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
        />
        {/* Progress circle */}
        <svg
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            stroke="red"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 48}
            strokeDashoffset={(1 - progress / 100) * 2 * Math.PI * 48}
            style={{
              transition: 'stroke-dashoffset 0.1s linear',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%'
            }}
          />
        </svg>
      </div>

      {/* Skip button */}
      <button 
        onClick={onSkip}
        style={{
          padding: '0.5rem 1rem',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 51
        }}
      >
        Skip
      </button>
    </div>
  );
}