import { useState, useRef, useEffect, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { produceSentence } from '../utils/apiCalls';
import { useModelSwitch } from '../contexts/modelContext';
import { useDexterity } from '../contexts/dexterityContext';

export function useTranslator() {
    const videoRef = useRef(null);
    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    const processingRef = useRef(false);
    const [result, setResult] = useState("");
    const [confidence, setConfidence] = useState("Awaiting capture to detect confidence level...");
    const [recording, setRecording] = useState(false);
    const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
    const { modelState } = useModelSwitch();
    const activeModelRef = useRef(modelState.model);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sequenceNum, setSequenceNum] = useState(90);
    const [translating, setTranslating] = useState(false);
    const { dexterity } = useDexterity();
    const handLandmarkerRef = useRef(null);
    const wsRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectInterval = useRef(1000);

    // Initialize MediaPipe HandLandmarker
    useEffect(() => {
        async function initializeHandLandmarker() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
                );
                const handLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                    },
                    numHands: 1,
                    runningMode: 'IMAGE',
                });
                handLandmarkerRef.current = handLandmarker;
            } catch (err) {
                console.error('Failed to initialize HandLandmarker:', err);
            }
        }
        initializeHandLandmarker();

        return () => {
            if (handLandmarkerRef.current) {
                handLandmarkerRef.current.close();
            }
        };
    }, []);

    // WebSocket connection function
    const connectWebSocket = useCallback(() => {
        if (reconnectAttempts.current >= maxReconnectAttempts) {
            console.error('Max WebSocket reconnect attempts reached');
            return;
        }

        wsRef.current = new WebSocket('ws://127.0.0.1:5000/ws');

        wsRef.current.onopen = () => {
            console.log('WebSocket connected');
            reconnectAttempts.current = 0;
            reconnectInterval.current = 1000;
            wsRef.current.send(JSON.stringify({
                type: 'config',
                model: modelState.model,
                sequenceNum: sequenceNum,
            }));
        };

        wsRef.current.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'result') {
                    setResult((prev) => {
                        let newResult = prev || "";
                        const currentModel = activeModelRef.current;

                        if (currentModel === 'alpha') {
                            const letter = msg.letter ?? '';
                            if (letter === 'SPACE') newResult += ' ';
                            else if (letter === 'DEL') newResult = newResult.slice(0, -1);
                            else newResult += letter;
                            setConfidence(`${((msg.confidenceLetter ?? 0) * 100).toFixed(2)}%`);
                        } else if (currentModel === 'num') {
                            newResult += (msg.number ?? '') + ' ';
                            setConfidence(`${((msg.confidenceNumber ?? 0) * 100).toFixed(2)}%`);
                        } else if (currentModel === 'glosses') {
                            newResult += (msg.word ?? '') + ' ';
                            setConfidence(`${((msg.confidence ?? 0) * 100).toFixed(2)}%`);
                        }

                        newResult = newResult.replace(/undefined/g, '');
                        return newResult;
                    });
                    setIsProcessing(false);
                    processingRef.current = false;
                }
            } catch (err) {
                console.error('WebSocket message parsing error:', err);
            }
        };

        wsRef.current.onclose = (event) => {
            console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
            if (event.code !== 1000 && recording) {
                reconnectAttempts.current += 1;
                setTimeout(() => {
                    connectWebSocket();
                    reconnectInterval.current = Math.min(reconnectInterval.current * 2, 30000);
                }, reconnectInterval.current);
            }
        };

        wsRef.current.onerror = (err) => {
            console.error('WebSocket error:', err);
            if (wsRef.current) {
                wsRef.current.close(1000, 'Client error');
            }
        };
    }, [modelState.model, sequenceNum, recording]);

    // Update WebSocket config on model change
    useEffect(() => {
        activeModelRef.current = modelState.model;
        setSequenceNum(modelState.model === 'glosses' ? 90 : 20);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'config',
                model: modelState.model,
                sequenceNum: modelState.model === 'glosses' ? 90 : 20,
            }));
        }
    }, [modelState.model]);

    const convertGloss = async () => {
        await stopRecording(); // Stop recording before translation
        if (result.trim()) {
            const hasAlphabets = /[a-zA-Z]/.test(result);
            const wordCount = result.trim().split(/\s+/).length;

            const video = videoRef.current;
            const canvas = canvasRef1.current;

            if (!hasAlphabets || wordCount < 2) {
                const ctx = canvas.getContext('2d');
                canvas.width = video.videoWidth * 0.2;
                canvas.height = video.videoHeight * 0.2;
                ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
                ctx.shadowBlur = 10;
                ctx.font = 'bold 24px Sans-serif';
                ctx.fillStyle = 'red';
                ctx.textAlign = 'center';
                ctx.fillText('English Translation Not Available...', canvas.width / 2, canvas.height / 2);
            }

            try {
                setTranslating(true);
                const translation = await produceSentence(result);
                if (translation.translation && translation.translation !== "?") {
                    setResult(translation.translation);
                } else {
                    const currentResult = result;
                    setResult("English Translation Not Available");
                    setTimeout(() => {
                        setResult(currentResult);
                    }, 2000);
                }
            } catch (err) {
                console.error("Error producing sentence:", err);
            } finally {
                setTranslating(false);
            }
        }
    };

    const stopRecording = useCallback(async () => {
        setRecording(false);
        setAutoCaptureEnabled(false);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({ type: 'reset' }));
                await new Promise(resolve => setTimeout(resolve, 100));
                wsRef.current.close(1000, 'Recording stopped');
                console.log('WebSocket closed: code=1000, reason=Recording stopped');
            } catch (err) {
                console.error('Error closing WebSocket:', err);
            }
            wsRef.current = null;
        }
    }, []);

    const startRecording = useCallback(async () => {
        if (recording) {
            await stopRecording();
        }
        setAutoCaptureEnabled(true);
        setRecording(true);
        connectWebSocket();
    }, [recording, stopRecording, connectWebSocket]);

    const captureImageFromVideo = useCallback(async () => {
        const video = videoRef.current;
        if (!video || !handLandmarkerRef.current || !autoCaptureEnabled) {
            return;
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
            return;
        }

        if (dexterity === 'left') {
            tempCtx.save();
            tempCtx.translate(tempCanvas.width, 0);
            tempCtx.scale(-1, 1);
        }

        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

        if (dexterity === 'left') tempCtx.restore();

        const results = await handLandmarkerRef.current.detect(tempCanvas);

        let landmarks = null;
        if (results.landmarks && results.landmarks.length > 0) {
            const handLandmarks = results.landmarks[0];
            const xList = handLandmarks.map((lm) => lm.x);
            const yList = handLandmarks.map((lm) => lm.y);
            const minX = Math.min(...xList);
            const minY = Math.min(...yList);
            landmarks = [];
            handLandmarks.forEach((lm) => {
                landmarks.push(lm.x - minX);
                landmarks.push(lm.y - minY);
                landmarks.push(0);
            });
        }

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'frame',
                landmarks: landmarks,
            }));
        }
    }, [dexterity, autoCaptureEnabled]);

    useEffect(() => {
        const canvas = canvasRef1.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const draw = () => {
            if (video.readyState >= 2) {
                canvas.width = video.videoWidth * 0.2;
                canvas.height = video.videoHeight * 0.2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';
                ctx.shadowBlur = 10;
                ctx.font = 'bold 20px Sans-serif';
                ctx.fillStyle = 'red';
                ctx.textAlign = 'center';

                if (isProcessing) {
                    ctx.fillText('Processing', canvas.width / 2, canvas.height / 2);
                } else if (recording) {
                    ctx.fillText('Capturing', canvas.width / 2, canvas.height / 2);
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isProcessing, recording]);

    useEffect(() => {
        let intervalId;

        const requiredFrames = modelState.model === 'glosses' ? 90 : 20;
        const intervalDuration = 1000 / requiredFrames; // Slower frame rate

        if (autoCaptureEnabled && videoRef.current && handLandmarkerRef.current) {
            intervalId = setInterval(() => {
                captureImageFromVideo();
            }, intervalDuration);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [autoCaptureEnabled, captureImageFromVideo, modelState.model]);

    useEffect(() => {
        const enableCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                });
                videoRef.current.srcObject = stream;
            } catch (err) {
                console.error('Camera access denied:', err);
                setResult('Camera access denied.');
            }
        };

        const videoRefStore = videoRef.current;

        enableCamera();
        return () => {
            if (videoRefStore?.srcObject) {
                videoRefStore.srcObject.getTracks().forEach((track) => track.stop());
            }
        };
    }, [setResult]);

    return {
        videoRef,
        canvasRef1,
        canvasRef2,
        result,
        confidence,
        recording,
        startRecording,
        stopRecording,
        setResult,
        autoCaptureEnabled,
        setAutoCaptureEnabled,
        convertGloss,
        translating,
    };
}