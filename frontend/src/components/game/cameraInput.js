import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslationSocket } from '../../hooks/translationSocket';

export function CameraInput({ progress = 0, show = true, onSkip, onLetterDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastDetectedLetterRef = useRef(null);

  const {
    wsRef,
    startRecording,
    stopRecording,
    sendFrame,
    wsStatus,
    isProcessing,
    setResult
  } = useTranslationSocket('right');

  const [detectedLetter, setDetectedLetter] = useState(null);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
      return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    sendFrame(video);
  }, [sendFrame, wsRef]);

  useEffect(() => {
    if (!show) return;
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Camera access denied:', err);
      }
    };
    enableCamera();

    const currentVideo = videoRef.current

    return () => {
      if (currentVideo?.srcObject) {
        currentVideo.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [show]);

  useEffect(() => {
    if (!show) {
      stopRecording();
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      startRecording('alpha', 10);
    }

    const interval = setInterval(() => {
      captureFrame();
    }, 120); 

    return () => {
      clearInterval(interval);
      stopRecording();
    };
  }, [show, startRecording, stopRecording, captureFrame, wsRef]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const letter = data?.letter?.toUpperCase?.() ?? '';

      if (/^[A-Z]$/.test(letter)) {
        if (letter !== detectedLetter && letter !== lastDetectedLetterRef.current) {
          // console.log('New letter detected:', letter);

          setDetectedLetter(letter);
          lastDetectedLetterRef.current = letter;
          onLetterDetected?.(letter);
          stopRecording();

          setTimeout(() => {
            setResult(null);
            setDetectedLetter(null);
            startRecording('alpha', 10);
          }, 1500);
        } else {
          // console.log(`Ignored duplicate letter: ${letter}`);
        }
      }
    };

    ws.onclose = () => {
      // console.log('WebSocket closed from CameraInput');
    };

    return () => {
      ws.onmessage = null;
      ws.onclose = null;
    };
  }, [
    wsRef,  
    onLetterDetected,
    detectedLetter,
    stopRecording,
    startRecording,
    setResult,
  ]);
  if (!show) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 50,
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '25vw',
          maxWidth: '300px',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          background: 'white',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <canvas ref={canvasRef} hidden />
        <svg
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
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
              transformOrigin: '50% 50%',
            }}
          />
        </svg>
      </div>

      <button
        onClick={() => {
          stopRecording();
          onSkip?.();
        }}
        style={{
          padding: '0.5rem 1rem',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 51,
        }}
      >
        Skip
      </button>

      {isProcessing && (
        <div
          style={{
            color: 'red',
            fontSize: '1rem',
            fontWeight: 'bold',
            textAlign: 'center',
            minHeight: '1.5rem',
          }}
        >
          PROCESSING...
        </div>
      )}

      {wsStatus === 'collecting' && !isProcessing && (
        <div style={{ color: 'green', fontWeight: 'bold', fontSize: '1rem' }}>
          COLLECTING FRAMES...
        </div>
      )}
    </div>
  );
}

CameraInput.propTypes = {
  progress: PropTypes.number.isRequired,
  show: PropTypes.bool.isRequired,
  onSkip: PropTypes.func.isRequired,
  onLetterDetected: PropTypes.func.isRequired,
};
