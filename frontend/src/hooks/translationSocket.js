import { useState, useRef, useCallback } from 'react';

export function useSocket({ model, videoRef, setResult }) {
    const wsRef = useRef(null);
    const sentFramesRef = useRef(0);
    const [recording, setRecording] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [wsStatus, setWsStatus] = useState('result');

    const convertGloss = useCallback((gloss) => {
        if (!gloss.trim()) return;

        const originalGloss = gloss;
        const ws = new WebSocket("ws://127.0.0.1:5000/ws_sentence");

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "translate", gloss }));
            setTranslating(true);
            setWsStatus('translating');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.error) {
                setResult("Error translating sentence");
                setWsStatus('result');
            } else if (data.englishTranslation !== undefined) {
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
            setTranslating(false);
            setWsStatus('result');
            ws.close();
        };
    }, [setResult]);

    const stopRecording = useCallback(() => {
        setRecording(false);
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
            setRecording(true);
            sentFramesRef.current = 0;

            const ws = new WebSocket('ws://127.0.0.1:5000/ws_translate');
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                ws.send(JSON.stringify({
                    type: 'start',
                    model: model,
                    sequenceNum: model === 'glosses' ? 30 : 10
                }));
                setWsStatus('collecting');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("WS Data:", data);

                if (data.error) {
                    setResult(prev => prev + " [Error]");
                    setWsStatus(recording ? 'collecting' : 'result');
                    return;
                }

                if (data.status) {
                    if (data.status === 'collecting') {
                        setWsStatus('collecting');
                    } else if (data.status === 'processing') {
                        setWsStatus('processing');
                    } else if (data.status === 'ready' && recording) {
                        setWsStatus('collecting');
                        sentFramesRef.current = 0;
                    }
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
                setWsStatus(recording ? 'collecting' : 'result');
                stopRecording();
            };
        }
    }, [recording, stopRecording, model, setResult]);

    const sendFrame = useCallback(() => {
        if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
        }

        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth / 2;
        tempCanvas.height = video.videoHeight / 2;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

        tempCanvas.toBlob((blob) => {
            if (!blob || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            wsRef.current.send(blob);
            sentFramesRef.current += 1;
        }, 'image/jpeg', 0.8);
    }, [videoRef]);

    return {
        recording,
        translating,
        wsStatus,
        setWsStatus,
        startRecording,
        stopRecording,
        convertGloss,
        sendFrame,
    };
}