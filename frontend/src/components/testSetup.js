import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import PropTypes from 'prop-types'
import '../styles/testSetup.css';

TestSetup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export function TestSetup({ isOpen, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);

  const [setBrightness] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState('Press start to begin the test');
  const [stage, setStage] = useState('start');
  const timeoutRef = useRef(null);

  const updateStatus = (newStatus) => {
    setDetectionStatus((prev) => (prev === newStatus ? prev : newStatus));
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
      setStage("start");
    }
  };

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
    if (!isOpen || (stage !== 'hands' && stage !== 'peace')) return;

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

  const isPeaceSign = (hand) => {
    if (!hand) return false;

    const [indexTip, indexMcp] = [hand[8], hand[5]];
    const [middleTip, middleMcp] = [hand[12], hand[9]];
    const [ringTip, ringMcp] = [hand[16], hand[13]];
    const [pinkyTip, pinkyMcp] = [hand[20], hand[17]];

    const indexExtended = indexTip.y < indexMcp.y;
    const middleExtended = middleTip.y < middleMcp.y;
    const ringExtended = ringTip.y < ringMcp.y;
    const pinkyExtended = pinkyTip.y < pinkyMcp.y;

    return indexExtended && middleExtended && !ringExtended && !pinkyExtended;
  };

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
        const faceRegion = ctx.getImageData(
          canvas.width * 0.3,
          canvas.height * 0.2,
          canvas.width * 0.4,
          canvas.height * 0.3
        );
        const data = faceRegion.data;
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          total += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        const currentBrightness = total / (data.length / 4);
        setBrightness(currentBrightness);

        if (currentBrightness >= 80 && currentBrightness <= 200) {
          updateStatus(
            <> Lighting is good &nbsp;
              <i className="fas fa-circle-check" style={{ color: "var(--dark-green)", marginRight: "6px" }}></i>
            </>
          );
          if (!timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
              setStage('hands');
              updateStatus('Hold up your hand');
              timeoutRef.current = null;
            }, 1000);
          }
        } else if (currentBrightness < 80) {
          updateStatus('Too dark, move to better lighting');
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        } else {
          updateStatus('Too bright, move to a dimmer area');
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }

      if ((stage === 'hands' || stage === 'peace') && landmarker) {
        const results = await landmarker.detectForVideo(video, performance.now());

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (results.landmarks?.length > 0) {
          for (const hand of results.landmarks) {
            ctx.fillStyle = 'green';
            for (const lm of hand) {
              ctx.beginPath();
              ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
              ctx.fill();
            }
          }

          if (stage === 'hands') {
            setDetectionStatus(<i className="fas fa-spinner fa-spin"></i>);
            if (!timeoutRef.current) {
              timeoutRef.current = setTimeout(() => {
                setStage('peace');
                updateStatus('Show a peace sign');
                timeoutRef.current = null;
              }, 1000);
            }
          } else if (stage === 'peace') {
            if (results.landmarks.some(isPeaceSign)) {
              setStage('done');
              updateStatus("All tests passed. You're all set!");
              timeoutRef.current = null;

            } else {
              updateStatus("Show a peace sign");
              timeoutRef.current = null;

            }
          }
        } else {
          updateStatus('Hold up your hand');
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }

      animationFrameId = requestAnimationFrame(detectFrame);
    };

    detectFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutRef.current);
    };
  }, [isOpen, stage, setBrightness]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: 'var(--dark-green)' }}>Test Your Background</h3>
        <p style={{ color: 'black' }}>Follow the steps below</p>
        <br />
        <div className="video-container">
          <video ref={videoRef} autoPlay muted playsInline />
          <canvas className="modal-canvas bordered-canvas" ref={canvasRef} />
        </div>
        <br></br>
        <p className={`modal-text stage-${stage}`}>{detectionStatus}</p>
        <br />
        {stage === 'start' && (
          
          <button
            onClick={() => {
              setDetectionStatus(<i className="fas fa-spinner fa-spin"></i>);
              if (!timeoutRef.current) {
                timeoutRef.current = setTimeout(() => {
                  setStage("lighting");
                  updateStatus("Checking lighting...");
                  timeoutRef.current = null;
                }, 1500);
              }
            }}
            className="recognizer-control-button recognizer-test-button stage-complete"
          >
            Start
          </button>
        )}

        {stage === 'done' ? (
          <button
            onClick={() => {
              onClose();
              setStage('start');
              updateStatus('Press start to begin.');
            }}
            className="recognizer-control-button recognizer-test-button stage-complete"
          >
            Continue To Translate
          </button>
        ) : (
          stage !== 'start' && (
            <button
              onClick={() => {
                onClose();
                setStage('start');
               <>
                1. Ensure that your face is visible against the background
                <br />
                <br />
                Press start to begin.
              </>
              }}
              className="recognizer-control-button recognizer-test-button"
            >
              Close
            </button>
          )
        )}
      </div>
    </div>
  );
}
