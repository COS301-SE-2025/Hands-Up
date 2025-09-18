import React, { useEffect, useState  } from 'react';
import { useTranslator } from '../../hooks/translateResults';
import { useLandmarksDetection } from '../../hooks/landmarksDetection';
import { processImage } from '../../utils/apiCalls';

export function CameraInput({ progress = 0, show = true, onSkip, onLetterDetected }) {
  const { videoRef, canvasRef2 } = useTranslator();
  useLandmarksDetection(videoRef, canvasRef2);
  
  const [frameBlobs, setFrameBlobs] = useState([]);
  const [processing, setProcessing] = useState(false);

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef2.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (blob) setFrameBlobs(prev => [...prev, blob]);
    }, 'image/jpeg', 0.8);
  };

  useEffect(() => {
    if (!show || processing) return;

    const interval = setInterval(() => {
      captureFrame();
    }, 100); // 10 fps

    return () => clearInterval(interval);
  }, [show, processing]);

  useEffect(() => {
    const sendFrames = async () => {
      const requiredFrames = 20;
      if (frameBlobs.length < requiredFrames || processing) return; 

      setProcessing(true);
      try {
        const formData = new FormData();
        frameBlobs.forEach((blob, idx) => {
          formData.append('frames', blob, `frame_${idx}.jpg`);
        });

        const result = await processImage(formData); 
        console.log("API response:", result);

        if (result?.prediction) {
          onLetterDetected?.(result.prediction.toUpperCase());
        }

        if (result?.word) {
          onLetterDetected?.(result.word.toUpperCase());
        }
      } 
      catch (err) {
        console.error("Error sending frames:", err);
      } 
      finally {
        setFrameBlobs([]); 
        setProcessing(false);
      }
    };

    sendFrames();
  }, [frameBlobs, processing, onLetterDetected]);

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