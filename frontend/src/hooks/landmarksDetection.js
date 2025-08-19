import { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver} from '@mediapipe/tasks-vision';
import {drawButton } from '../utils/drawButton';
import { useModelSwitch } from '../contexts/modelContext';

let direction = ""
let handXHistory = [];
const SWIPE_HISTORY_LIMIT = 10;
const SWIPE_THRESHOLD = 100; 

export function useLandmarksDetection(videoRef, canvasRef) {

  const landmarkerRef = useRef(null);
  const lastVideoTime = useRef(-1);
  const { modelState, switchModel } = useModelSwitch();

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
      const canvas = canvasRef.current;
      if (canvas && modelState.model) {
      console.log("Redrawing button for model:", modelState.model);
      let text = modelState.model==='alpha'?'Alphabet':modelState.model==='num'?'Numbers': 'Glosses';
      drawButton(canvas, text);
      }
  }, [modelState.model, canvasRef, switchModel]);

  useEffect(() => {
    let animationFrameId;

    const detect = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2 || !canvasRef.current ||!landmarkerRef.current) { animationFrameId = requestAnimationFrame(detect);
          return;
        }
         
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth*0.5;
        canvas.height = video.videoHeight*0.5;

        let text = modelState.model==='alpha'?'Alphabet':modelState.model==='num'?'Numbers': 'Glosses';
        drawButton(canvas, text);

        if (video.currentTime === lastVideoTime.current) {
            animationFrameId = requestAnimationFrame(detect);
            return;
        }
        lastVideoTime.current = video.currentTime;

        const results = landmarkerRef.current.detectForVideo(video, performance.now());
        // console.log("Landmarks Detection Results:", results);

        if (results.landmarks && results.landmarks.length > 0) {
          // handVisisble = true;

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
                direction = deltaX > 0 ? 'right' : 'left';
                console.log(`Swipe detected: ${direction}`);
                direction === "right" ? switchModel() : console.log("No model switch");
                handXHistory = []; 
              }
            }
          }
        } else {
          //   if (!handVisible) {
          //     console.log("Hand lost — clearing swipe history");
          //   }
          //   handVisible = false;
        //   handXHistory = [];
        }

      animationFrameId = requestAnimationFrame(detect);
    };

    animationFrameId = requestAnimationFrame(detect);

    return () => cancelAnimationFrame(animationFrameId);
  }, [videoRef, canvasRef,modelState.model, switchModel]);
}
