import { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver} from '@mediapipe/tasks-vision';
import {drawDisplay } from '../utils/drawDisplay';
import { useModelSwitch } from '../contexts/modelContext';

const SWIPE_HISTORY_LIMIT = 10;
const SWIPE_THRESHOLD = 100;
const MAX_VERTICAL_DEVIATION = 5;  
const SWIPE_TIME_LIMIT = 2000;       

let handXHistory = [];
let handYHistory = [];
let handTimeHistory = [];

export function useSwitchLandmarks(videoRef, canvasRef) {

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
      drawDisplay(canvas, text);
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

        canvas.width = video.videoWidth*0.55;
<<<<<<< HEAD
        canvas.height = video.videoHeight*0.8;
=======
        canvas.height = video.videoHeight*0.5;
>>>>>>> a4d9a9851 (resized camera)

        let text = modelState.model==='alpha'?'Alphabet':modelState.model==='num'?'Numbers': 'Glosses';
        drawDisplay(canvas, text);

        if (video.currentTime === lastVideoTime.current) {
            animationFrameId = requestAnimationFrame(detect);
            return;
        }
        lastVideoTime.current = video.currentTime;

        const results = landmarkerRef.current.detectForVideo(video, performance.now());
        

        if (results.landmarks && results.landmarks.length > 0) {

          if (results.landmarks.length > 1) {
            console.log("Two hands detected → disabling swipe switching");
            handXHistory = [];
            handYHistory = [];
            handTimeHistory = [];
            animationFrameId = requestAnimationFrame(detect);
            return; // skip swipe detection this frame
          }
          
          for (let i = 0; i < results.landmarks.length; i++) {
            const landmarks = results.landmarks[i];
            const handedness = results.handedness[0][0].categoryName; 
            console.log("Handedness:", handedness);
            if (handedness !== "Right") continue; 

            const keypoints = [landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]];
            const avgX = keypoints.reduce((sum, p) => sum + p.x * canvas.width, 0) / keypoints.length;
            const avgY = keypoints.reduce((sum, p) => sum + p.y * canvas.height, 0) / keypoints.length;

            handXHistory.push(avgX);
            handYHistory.push(avgY);
            handTimeHistory.push(performance.now());

            if (handXHistory.length > SWIPE_HISTORY_LIMIT) {
              handXHistory.shift();
              handYHistory.shift();
              handTimeHistory.shift();
            }

            if (handXHistory.length === SWIPE_HISTORY_LIMIT) {
              console.log("Swipe history full");
              const startX = handXHistory[0];
              const endX   = handXHistory[SWIPE_HISTORY_LIMIT - 1];
              const startY = handYHistory[0];
              const endY   = handYHistory[SWIPE_HISTORY_LIMIT - 1];
              const startTime = handTimeHistory[0];
              const endTime   = handTimeHistory[SWIPE_HISTORY_LIMIT - 1];

              const deltaX = endX - startX;
              const deltaY = endY - startY;
              const duration = endTime - startTime;

              console.log("Starting:", video.videoWidth * 0.3, startX);
              console.log("Ending:", video.videoWidth * 0.3, endX);

              if (
                duration < SWIPE_TIME_LIMIT &&             
                Math.abs(deltaX) > SWIPE_THRESHOLD &&      
                Math.abs(deltaY) < MAX_VERTICAL_DEVIATION &&
                startX < video.videoWidth * 0.3 &&             
                endX > video.videoWidth * 0.3 &&               
                deltaX > 0                                 
              ) {
                console.log("Right hand swipe LEFT detected → switching model");
                switchModel();
                handXHistory = [];
                handYHistory = [];
                handTimeHistory = [];
              } else{
                console.log("Swipe not detected or criteria not met:", { deltaX, deltaY, duration });
              }
            }
          }
        }
      animationFrameId = requestAnimationFrame(detect);
    };

    animationFrameId = requestAnimationFrame(detect);

    return () => cancelAnimationFrame(animationFrameId);
  }, [videoRef, canvasRef,modelState.model, switchModel]);
}
