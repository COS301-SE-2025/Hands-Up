import { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver} from '@mediapipe/tasks-vision';
import {drawButton } from '../utils/drawButton';

let indexX, indexY = 0;
let button = {};
let handXHistory = [];
let handVisisble = false;
const SWIPE_HISTORY_LIMIT = 10;
const SWIPE_THRESHOLD = 120; 

export function useLandmarksDetection(videoRef, canvasRef) {

  const landmarkerRef = useRef(null);
  const lastVideoTime = useRef(-1);

  useEffect(() => {
    const loadHandLandmarker = async () => {
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
      });

      landmarkerRef.current = handLandmarker;
    };

    loadHandLandmarker();
  }, []);

  useEffect(() => {
    let animationFrameId;

    const detect = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2 || !canvasRef.current ||!landmarkerRef.current) { animationFrameId = requestAnimationFrame(detect);
            return;
        }
         
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
            
        button = drawButton(canvas);

        if (video.currentTime === lastVideoTime.current) {
            animationFrameId = requestAnimationFrame(detect);
            return;
        }
        lastVideoTime.current = video.currentTime;

        const results = landmarkerRef.current.detectForVideo(video, performance.now());
        // console.log("Landmarks Detection Results:", results);

        if (results.landmarks && results.landmarks.length > 0) {
          handVisisble = true;

          for (const landmarks of results.landmarks) {
            const keypoints = [landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]];
            const avgX = keypoints.reduce((sum, p) => sum + p.x * canvas.width, 0) / keypoints.length;

            handXHistory.push(avgX);
            if (handXHistory.length > SWIPE_HISTORY_LIMIT) {
              handXHistory.shift();
            }

            if (handXHistory.length === SWIPE_HISTORY_LIMIT) {
              const deltaX = handXHistory[SWIPE_HISTORY_LIMIT - 1] - handXHistory[0];
              if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
                const direction = deltaX < 0 ? 'right' : 'left';
                console.log(`Swipe detected: ${direction}`);
                handXHistory = []; 
              }
            }
          }
        } else {
          if (handVisisble) {
            console.log("Hand lost — clearing swipe history");
          }
          handVisisble = false;
          handXHistory = [];
        }

      animationFrameId = requestAnimationFrame(detect);
    };

    animationFrameId = requestAnimationFrame(detect);

    return () => cancelAnimationFrame(animationFrameId);
  }, [videoRef, canvasRef]);

  return { indexX, indexY };
}
