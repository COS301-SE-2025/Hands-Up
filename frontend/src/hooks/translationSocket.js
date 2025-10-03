import { useRef, useState, useCallback } from 'react';
import {produceSentence} from '../utils/apiCalls'

export function useTranslationSocket(dexterity = 'right') {
    const wsRef = useRef(null);
    const processingRef = useRef(false);
    const sentFramesRef = useRef(0);

    const [wsStatus, setWsStatus] = useState('result'); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState('');
    const [confidence, setConfidence] = useState('Awaiting capture to detect confidence...');
    const [translating, setTranslating] = useState(false);
    const socketBaseURL = "wss://tmkdt-newhandsupmodel.hf.space/handsUPApi"

    const stopRecording = useCallback(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'stop' }));
            wsRef.current.close();
        }
        wsRef.current = null;
        sentFramesRef.current = 0;
        processingRef.current = false;
        setWsStatus('result');
    }, []);

    const startRecording = useCallback((model, sequenceNum = 10) => {
        if (wsRef.current) return;

        const ws = new WebSocket(`${socketBaseURL}/ws_translate`);
        wsRef.current = ws;
        sentFramesRef.current = 0;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'start', model, sequenceNum }));
            setWsStatus('collecting');
            //console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.error) {
                setResult(prev => prev + ' [Error]');
                setConfidence('0%');
                setWsStatus('collecting');
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
                } else if (data.status === 'ready') {
                    setIsProcessing(false);
                    processingRef.current = false;
                    setWsStatus('collecting');
                    sentFramesRef.current = 0;
                }
                return;
            }

            if (model === 'alpha') {
                const letter = data?.letter ?? '';
                setResult(prev => {
                    if (!letter) return prev;
                    if (letter === 'SPACE') return prev + ' ';
                    if (letter === 'DEL') return prev.slice(0, -1);
                    return prev + letter;
                });
                setConfidence(`${((data?.confidenceLetter ?? 0) * 100).toFixed(2)}%`);
            } else if (model === 'num') {
                const letter = data?.letter ?? '';
                const number = data?.number ?? '';
                if (letter === 'F') {
                    setResult(prev => prev + '9');
                    setConfidence(`${((data?.confidenceLetter ?? 0) * 100).toFixed(2)}%`);
                } else if (number) {
                    setResult(prev => (prev + number ).replace(/undefined/g, ''));
                    setConfidence(`${((data?.confidenceNumber ?? 0) * 100).toFixed(2)}%`);
                }
            } else if (model === 'glosses') {
                const word = data?.word ?? '';
                setResult(prev => (prev + word + ' ').replace(/undefined/g, ''));
                setConfidence(`${((data?.confidence ?? 0) * 100).toFixed(2)}%`);
            }

            setIsProcessing(false);
            processingRef.current = false;
            if (wsRef.current) setWsStatus('collecting');
        };

        ws.onclose = () => {
            //console.log('WebSocket closed');
            wsRef.current = null;
            setWsStatus('result');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setResult(prev => prev + ' [WebSocket Error]');
            setConfidence('0%');
            setWsStatus('collecting');
            stopRecording();
        };
    }, [stopRecording]);

    const sendFrame = useCallback((video) => {
        if (!video || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || processingRef.current) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth / 2;
        tempCanvas.height = video.videoHeight / 2;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;

        if (dexterity === 'left') {
            ctx.save();
            ctx.translate(tempCanvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

        if (dexterity === 'left') ctx.restore();

        tempCanvas.toBlob(blob => {
            if (!blob || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            wsRef.current.send(blob);
            sentFramesRef.current += 1;
        }, 'image/jpeg', 0.8);
    }, [dexterity]);

    const convertGloss = async (gloss) => {

        if (gloss.trim()) {
            const hasAlphabets = /[a-zA-Z]/.test(gloss);
            const wordCount = gloss.trim().split(/\s+/).length;

            if (!hasAlphabets || wordCount < 2) {
                const currentResult = gloss;

                setResult("English Translation Not Available");

                setTimeout(() => {
                    setResult(currentResult);
                }, 2000); 
            }

            try {
                setTranslating(true);
                const translation = await produceSentence(gloss);

                if (translation.translation && translation.translation !== "?") {
                    setResult(translation.translation);
                } else {
                    const currentResult = gloss;

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
    }

    return {
        wsRef,
        wsStatus,
        result,
        confidence,
        translating,
        isProcessing,
        startRecording,
        stopRecording,
        sendFrame,
        convertGloss,
        setResult,
        setConfidence
    };
}
