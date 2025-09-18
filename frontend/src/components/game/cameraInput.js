import React, { useEffect, useRef } from 'react';
import { useTranslator } from '../../hooks/translateResults';
import { useLandmarksDetection } from '../../hooks/landmarksDetection';

export function CameraInput({ progress = 0, show = true, onSkip, onLetterDetected }) {
  const { videoRef, canvasRef2, result } = useTranslator();
  useLandmarksDetection(videoRef, canvasRef2);
  
  const resultRef = useRef(result);
  useEffect(() => { 
    resultRef.current = result; 
  }, [result]);
  
  useEffect(() => {
    if (!show) return; 

    const interval = setInterval(() => {
      const res = resultRef.current;
      if (!result || !onLetterDetected) return;

      const letter = res[0]?.toUpperCase();
      if (letter) {
        console.log("Detected letter:", letter); 
        onLetterDetected(letter);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [show, onLetterDetected]);

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
      <div style={{
        width: '25vw',
        maxWidth: '300px',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        background: 'white',
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
            stroke="yellow"
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