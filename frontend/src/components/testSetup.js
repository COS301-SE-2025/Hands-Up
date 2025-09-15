import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import '../styles/testSetup.css';

export function TestSetup({ isOpen, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);

  const [brightness, setBrightness] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState('Checking lighting...');
  const [stage, setStage] = useState('lighting');
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Camera access denied', err);
      }
    };

    const videoNow = videoRef.current;
    enableCamera();

    return () => {
      if (videoNow?.srcObject) {
        videoNow.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || stage !== 'landmarks') return;

    const loadLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.8,
        minHandPresenceConfidence: 0.8,
        minTrackingConfidence: 0.8,
        numHands: 2,
      });

      landmarkerRef.current = handLandmarker;
    };

    loadLandmarker();
  }, [isOpen, stage]);

  useEffect(() => {
    if (!isOpen) return;

    let animationFrameId;

    const detectFrame = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !canvas || video.videoWidth <= 0 || video.videoHeight <= 0) {
        animationFrameId = requestAnimationFrame(detectFrame);
        return;
      }

      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (stage === 'lighting') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          total += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const currentBrightness = total / (data.length / 4);
        setBrightness(currentBrightness); 

        if (currentBrightness >= 80 && currentBrightness <= 200) {
          setDetectionStatus('Lighting is good');
          if (!timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
              setStage('landmarks');
              setDetectionStatus('Hold up your hands');
              timeoutRef.current = null;
            }, 1000);
          }
        } else if (currentBrightness < 80) { 
          setDetectionStatus('Move to better lighting');
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        } else { 
          setDetectionStatus('Too bright, move to a dimmer area');
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      } else if (stage === 'landmarks') {
        if (!landmarker) {
          animationFrameId = requestAnimationFrame(detectFrame);
          return;
        }

        const results = await landmarker.detectForVideo(video, performance.now());

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (results.landmarks?.length > 0) {
          setDetectionStatus("Hands detectable. You're all set.");
          for (const hand of results.landmarks) {
            ctx.fillStyle = 'green';
            for (const lm of hand) {
              ctx.beginPath();
              ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        } else {
          setDetectionStatus('Hold up your hands');
        }
      }

      animationFrameId = requestAnimationFrame(detectFrame);
    };

    detectFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutRef.current);
    };
  }, [isOpen, stage]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Test Setup</h3>
        <p>Ensure that your face is visible.</p>
        <br></br>
        <div className="video-container">
          <video ref={videoRef} autoPlay muted playsInline />
          <canvas className="modal-canvas" ref={canvasRef} />
        </div>
        <br></br>
        <p className="modal-text">{detectionStatus}</p>
        <br></br>
        <button
          onClick={() => {
            onClose();
            setStage('lighting');
          }}
          className="recognizer-control-button recognizer-test-button">
          Close
        </button>
      </div>
    </div>
  );
}