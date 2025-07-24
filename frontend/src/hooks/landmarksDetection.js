import Hands from '@mediapipe/hands';

export function useLandmarksDetection(canvasCtx){

    function onResults(results){
        drawConnectors(canvasCtx,results.poseLandmarks, mediapipePose.POSE_CONNECTIONS,{ color: '#3240CF', lineWidth: 2 });

        drawLandmarks(canvasCtx, results.poseLandmarks,
        { color: 'red', lineWidth: 2, radius: 3 });
        canvasCtx.restore();
    }

    useEffect(() => {
        const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
        });

        hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
    }, []);

    return { onResults };
}
