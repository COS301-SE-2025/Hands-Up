// hooks/landmarksDetection.js
import { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver} from '@mediapipe/tasks-vision';
import {drawButton } from '../utils/drawButton';

// const HAND_CONNECTIONS = [
//   {start: 0, end: 1}, {start: 1, end: 2}, {start: 2, end: 3}, {start: 3, end: 4},
//   {start: 5, end: 6}, {start: 6, end: 7}, {start: 7, end: 8},
//   {start: 9, end: 10}, {start: 10, end: 11}, {start: 11, end: 12},
//   {start: 13, end: 14}, {start: 14, end: 15}, {start: 15, end: 16},
//   {start: 17, end: 18}, {start: 18, end: 19}, {start: 19, end: 20},
//   {start: 0, end: 5}, {start: 5, end: 9}, {start: 9, end: 13}, {start: 13, end: 17}, {start: 17, end: 0}
// ];

let indexX, indexY = 0;
let button = {};

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
        console.log("Landmarks Detection Results:", results);

        if (results.landmarks && results.landmarks.length > 0) {

            for (const landmarks of results.landmarks) {
                if (landmarks.length >= 9 && landmarks[8]) {
                    const indexTip = landmarks[8];
                    const x = indexTip.x * canvas.width;
                    const y = indexTip.y * canvas.height;

                    console.log("Button Coordinates:", button.x , button.y);
                    console.log("Index Finger Tip Coordinates:", x, y);

                    // Check if within button bounds
                    if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
                        console.alert("Hand clicked the button!");
                    }
                }
            }
            // const drawingUtils = new DrawingUtils(ctx);
            // for (const landmarks of results.landmarks) {
            //     drawingUtils.drawConnectors(landmarks, HAND_CONNECTIONS, {
            //         color: '#00FF00',
            //         lineWidth: 8,
            //     });
            //     drawingUtils.drawLandmarks(landmarks, {
            //         color: '#FF0000',
            //         radius: 3,
            //     });
            //
            }

      // animationFrameId = requestAnimationFrame(detect);
    };

    animationFrameId = requestAnimationFrame(detect);

    return () => cancelAnimationFrame(animationFrameId);
  }, [videoRef, canvasRef]);

  return { indexX, indexY };
}
