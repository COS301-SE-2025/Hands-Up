import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import PropTypes from 'prop-types';
import '../styles/testSetup.css';

TestSetup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export function TestSetup({ isOpen, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);

  const [brightness, setBrightness] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState(<>Ensure that your face is visible against the background<br />Press start to begin.</>);
  const [stage, setStage] = useState('start');
  const timeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  const modelLoadPromiseRef = useRef(null);
  const isProcessingRef = useRef(false);

  const updateStatus = (newStatus) => {
    setDetectionStatus(newStatus);
  };

  const clearAllTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isProcessingRef.current = false;
  };

  const handleClose = () => {
    clearAllTimers();
    
    if (landmarkerRef.current) {
      landmarkerRef.current.close();
      landmarkerRef.current = null;
    }
    
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    setStage('start');
    updateStatus(
      <>
        Ensure that your face is visible against the background
        <br />
        Press start to begin.
      </>
    );
    
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      handleClose();
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
              updateStatus('Camera access denied. Please enable your camera.');
          }
      };

      enableCamera();

      const videoStream = videoRef.current?.srcObject;

      return () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }
      };
  }, [isOpen]); 

  useEffect(() => {
    if (!isOpen || stage === 'start') {
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
      return;
    }

    if (!modelLoadPromiseRef.current && (stage === 'hands' || stage === 'peace')) {
      modelLoadPromiseRef.current = (async () => {
        try {
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
            numHands: 2,
            minHandDetectionConfidence: 0.8,
            minHandPresenceConfidence: 0.8,
            minTrackingConfidence: 0.8,
          });
          landmarkerRef.current = handLandmarker;
          // console.log('Hand Landmarker model loaded successfully.');
        } catch (err) {
          console.error('Failed to load hand landmarker model:', err);
          updateStatus('Failed to load hand detection model. Please refresh.');
        } finally {
          modelLoadPromiseRef.current = null;
        }
      })();
    }
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
    if (!isOpen || stage === 'start' || stage === 'done') {
      clearAllTimers();
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const detectFrame = async () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        const landmarker = landmarkerRef.current;
        const ctx = canvas.getContext('2d');
        const timeNow = performance.now();

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (stage === 'lighting') {
          const region = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let total = 0;
          for (let i = 0; i < region.data.length; i += 4) {
            total += (region.data[i] + region.data[i + 1] + region.data[i + 2]) / 3;
          }
          const currentBrightness = total / (region.data.length / 4);
          setBrightness(currentBrightness);

          if(brightness);

          if (currentBrightness >= 80 && currentBrightness <= 200) {
            if (!timeoutRef.current) {
              updateStatus(
                <>Lighting is good &nbsp;
                  <i className="fas fa-circle-check" style={{ color: "var(--dark-green)", marginRight: "6px" }}></i>
                </>
              );
              timeoutRef.current = setTimeout(() => {
                if (stage === 'lighting') {
                  setStage('hands');
                  updateStatus('Hold up your hand');
                  timeoutRef.current = null;
                }
              }, 1000);
            }
          } else {
            updateStatus(currentBrightness < 80 ? 'Too dark, move to better lighting' : 'Too bright, move to a dimmer area');
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }
        }

        if ((stage === 'hands' || stage === 'peace') && landmarker) {
          try {
            const results = await landmarker.detectForVideo(video, timeNow);
            
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
                if (!timeoutRef.current) {
                  updateStatus(<i className="fas fa-spinner fa-spin"></i>);
                  timeoutRef.current = setTimeout(() => {
                    if (stage === 'hands') {
                      setStage('peace');
                      updateStatus('Show a peace sign');
                      timeoutRef.current = null;
                    }
                  }, 1000);
                }
              } else if (stage === 'peace') {
                if (results.landmarks.some(isPeaceSign)) {
                  if (!timeoutRef.current) {
                    updateStatus("All tests passed. You're all set!");
                    timeoutRef.current = setTimeout(() => {
                      setStage('done');
                      timeoutRef.current = null;
                    }, 500);
                  }
                } else {
                  updateStatus("Show a peace sign");
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }
                }
              }
            } else {
              if (stage === 'hands') {
                updateStatus('Hold up your hand');
              } else if (stage === 'peace') {
                updateStatus('Show a peace sign');
              }
              
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            }
          } catch (landmarkerError) {
            console.error('Hand detection error:', landmarkerError);
          }
        }
      } catch (error) {
        console.error('Detection frame error:', error);
      } finally {
        isProcessingRef.current = false;
        
        if (stage !== 'start' && stage !== 'done' && isOpen) {
          animationFrameRef.current = requestAnimationFrame(detectFrame);
        }
      }
    };

    if (video.readyState >= 2) {
      detectFrame();
    } else {
      const handleLoadedData = () => {
        detectFrame();
        video.removeEventListener('loadeddata', handleLoadedData);
      };
      video.addEventListener('loadeddata', handleLoadedData);
    }

    return () => {
      clearAllTimers();
    };
  }, [isOpen, stage, brightness]);

  useEffect(() => {
    if (!isOpen) {
      clearAllTimers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: 'var(--dark-green)' }}>Test Your Setup</h3>
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
              handleClose();
            }}
            className="recognizer-control-button recognizer-test-button stage-complete"
          >
            Continue To Translate
          </button>
        ) : (
          stage !== 'start' && (
            <button
              onClick={() => {
                handleClose();
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