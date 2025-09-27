import { useState, useRef, useEffect, useCallback } from 'react';
import { produceSentence } from '../utils/apiCalls';
import { useModelSwitch } from '../contexts/modelContext';
import { useDexterity } from '../contexts/dexterityContext';

export function useTranslator() {
    const videoRef = useRef(null);
    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    const wsRef = useRef(null);
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
    const sentFramesRef = useRef(0);

    const convertGloss = async () => {
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
        sentFramesRef.current = 0;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'stop' }));
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    const startRecording = useCallback(async () => {
        if (recording) {
            stopRecording();
        } else {
            setAutoCaptureEnabled(true);
            setRecording(true);
            sentFramesRef.current = 0;

            const ws = new WebSocket(`ws://127.0.0.1:5000/ws_translate`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                ws.send(JSON.stringify({
                    type: 'start',
                    model: activeModelRef.current,
                    sequenceNum: activeModelRef.current === 'glosses' ? 90 : 10,
                    dexterity: dexterity
                }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("WS Data:", data);
                if (data.error) {
                    console.error('Error from backend:', data.error);
                    setResult("Error translating sign.");
                    setConfidence("0%");
                } else if (data.status === 'processing') {
                    setIsProcessing(true);
                    processingRef.current = true;
                } else if (data.status === 'wait_more' || data.status === 'wait_more_dynamic') {
                    setIsProcessing(false);
                    processingRef.current = false;
                } else {
                    // Use functional updates to ensure we're always working with the latest state
                    if (activeModelRef.current === 'alpha') {
                        const letter = data?.letter ?? '';
                        setResult((prevResult) => {
                            let updated = prevResult;
                            if (letter === 'SPACE') updated += ' ';
                            else if (letter === 'DEL') updated = updated.slice(0, -1);
                            else updated += letter;

                            return updated.replace(/undefined/g, '');
                        });

                        setConfidence(`${((data?.confidenceLetter ?? 0) * 100).toFixed(2)}%`);
                    }
                    else if (activeModelRef.current === 'num') {
                        setResult((prev) => (prev + (data?.number ?? '') + ' ').replace(/undefined/g, ''));
                        setConfidence(`${((data?.confidenceNumber ?? 0) * 100).toFixed(2)}%`);
                    }
                    else if (activeModelRef.current === 'glosses') {
                        setResult((prev) => (prev + (data?.word ?? '') + ' ').replace(/undefined/g, ''));
                        setConfidence(`${((data?.confidence ?? 0) * 100).toFixed(2)}%`);
                    }

                    setIsProcessing(false);
                    processingRef.current = false;
                }
            };

            ws.onclose = () => {
                console.log('WebSocket closed');
                wsRef.current = null;
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setResult("WebSocket error occurred.");
                setConfidence("0%");
                stopRecording();
            };
        }
    }, [recording, stopRecording, dexterity]); // Removed 'result' from dependency array

    const captureImageFromVideo = useCallback(() => {
        if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isProcessing) {
            return;
        }

        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth / 2;
        tempCanvas.height = video.videoHeight / 2;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        if (dexterity === 'left') {
            tempCtx.save();
            tempCtx.translate(tempCanvas.width, 0);
            tempCtx.scale(-1, 1);
        }

        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

        if (dexterity === 'left') tempCtx.restore();

        tempCanvas.toBlob((blob) => {
            if (!blob || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            wsRef.current.send(blob);
            sentFramesRef.current += 1;
        }, 'image/jpeg', 0.6);
    }, [dexterity, isProcessing]);

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
        activeModelRef.current = modelState.model;
        setSequenceNum(modelState.model === 'glosses' ? 90 : 10);
    }, [modelState.model]);

    useEffect(() => {
        let intervalId;

        const intervalDuration = modelState.model === 'glosses' ? 30 : 1000;

        if (autoCaptureEnabled && videoRef.current) {
            intervalId = setInterval(() => {
                captureImageFromVideo();
            }, intervalDuration);
        }

        return () => clearInterval(intervalId);
    }, [autoCaptureEnabled, captureImageFromVideo, modelState.model]);

    useEffect(() => {
        const enableCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    }
                });
                videoRef.current.srcObject = stream;
            } catch (err) {
                console.error(err);
                setResult('Camera access denied.');
            }
        };

        const videoRefStore = videoRef.current;

        enableCamera();
        return () => {
            if (videoRefStore?.srcObject) {
                videoRefStore.srcObject.getTracks().forEach(track => track.stop());
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);

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