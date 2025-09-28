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
    const [sequenceNum, setSequenceNum] = useState(30);
    const [translating, setTranslating] = useState(false);
    const { dexterity } = useDexterity();
    const sentFramesRef = useRef(0);
    const [wsStatus, setWsStatus] = useState('result');

    const convertGloss = useCallback(() => {
        if (!result.trim()) return;

        const originalGloss = result; // keep a copy
        const ws = new WebSocket("ws://127.0.0.1:5000/ws_sentence");

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "translate", gloss: result }));
            setTranslating(true);
            setWsStatus('translating');
            // ⚠️ don't clear result here, keep showing gloss until translation arrives
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.error) {
                setResult("Error translating sentence");
                setConfidence("0%");
                setWsStatus('result');
            } 
            else if (data.englishTranslation !== undefined) {
                if (data.englishTranslation && data.englishTranslation.trim() !== "") {
                    setResult(data.englishTranslation);
                } else {
                    setResult(originalGloss + " [English translation not available]");
                }
                setTranslating(false);
                setWsStatus('result');
                ws.close();
            }
        };

        ws.onerror = () => {
            setResult(originalGloss + " [WebSocket error]");
            setConfidence("0%");
            setTranslating(false);
            setWsStatus('result');
            ws.close();
        };
    }, [result]);

    const stopRecording = useCallback(async () => {
        setRecording(false);
        setAutoCaptureEnabled(false);
        sentFramesRef.current = 0;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'stop' }));
            wsRef.current.close();
            wsRef.current = null;
            setWsStatus('result');
        }
    }, []);

    const startRecording = useCallback(() => {
        if (recording) {
            stopRecording();
        } else {
            setAutoCaptureEnabled(true);
            setRecording(true);
            sentFramesRef.current = 0;

            const ws = new WebSocket('ws://127.0.0.1:5000/ws_translate');
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                ws.send(JSON.stringify({
                    type: 'start',
                    model: activeModelRef.current,
                    sequenceNum: activeModelRef.current === 'glosses' ? 30 : 10
                }));
                setWsStatus('collecting');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("WS Data:", data);

                if (data.error) {
                    setResult(prev => prev + " [Error]");
                    setConfidence("0%");
                    setWsStatus(recording ? 'collecting' : 'result');
                    return;
                }

                if (data.status) {
                    if (data.status === 'collecting') {
                        setIsProcessing(false);
                        processingRef.current = false;
                        setWsStatus('collecting');
                    } else if (data.status === 'processing') {
                        setIsProcessing(true);
                        processingRef.current = true;
                        setWsStatus('processing');
                    } else if (data.status === 'ready' && recording) {
                        setIsProcessing(false);
                        processingRef.current = false;
                        setWsStatus('collecting');
                        sentFramesRef.current = 0;
                    }
                    return;
                }

                if (activeModelRef.current === 'alpha') {
                    const letter = data?.letter ?? '';
                    setResult((prev) => {
                        if (!letter) return prev;
                        if (letter === 'SPACE') return prev + ' ';
                        if (letter === 'DEL') return prev.slice(0, -1);
                        return prev + letter; 
                    });
                    setConfidence(`${((data?.confidenceLetter ?? 0) * 100).toFixed(2)}%`);
                }

                else if (activeModelRef.current === 'num') {
                    const letter = data?.letter ?? '';
                    const number = data?.number ?? '';
                    console.log("number: ", number);

                    if (letter === 'F') {
                        setResult(prev => prev + "9 "); 
                        setConfidence(`${((data?.confidenceLetter ?? 0) * 100).toFixed(2)}%`);
                    } 
                    else if (number) {
                        setResult(prev => (prev + number + ' ').replace(/undefined/g, ''));
                        setConfidence(`${((data?.confidenceNumber ?? 0) * 100).toFixed(2)}%`);
                    } 
                    else {
                        console.log("No valid number or letter");
                        setResult(prev => prev + "");
                        setConfidence("0%");
                    }
                }

                else if (activeModelRef.current === 'glosses') {
                    const word = data?.word ?? '';
                    setResult((prev) => {
                        if (!word) return prev;
                        return (prev + word + ' ').replace(/undefined/g, '');
                    });
                    setConfidence(`${((data?.confidence ?? 0) * 100).toFixed(2)}%`);
                }

                setIsProcessing(false);
                processingRef.current = false;
                if (recording) {
                    setWsStatus('collecting');
                }
            };


            ws.onclose = () => {
                console.log('WebSocket closed');
                wsRef.current = null;
                setWsStatus('result');
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setResult(prev => prev + " [WebSocket Error]");
                setConfidence("0%");
                setWsStatus(recording ? 'collecting' : 'result');
                stopRecording();
            };
        }
    }, [recording, stopRecording]);

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
        }, 'image/jpeg', 0.8);
    }, [dexterity, isProcessing]);

    useEffect(() => {
        activeModelRef.current = modelState.model;
        setSequenceNum(modelState.model === 'glosses' ? 30 : 10);
    }, [modelState.model]);

    useEffect(() => {
        let intervalId;

        const intervalDuration = 200;

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
                setWsStatus('result');
            } catch (err) {
                console.error(err);
                setResult('Camera access denied.');
                setWsStatus('result');
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
                setWsStatus('result');
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
        wsStatus,
    };
}