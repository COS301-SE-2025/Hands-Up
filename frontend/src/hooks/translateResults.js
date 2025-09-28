import { useState, useRef, useEffect, useCallback } from 'react';
import { useModelSwitch } from '../contexts/modelContext';
import { useDexterity } from '../contexts/dexterityContext';
import { useTranslationSocket } from './translationSocket';

export function useTranslator() {
    const videoRef = useRef(null);
    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    const { dexterity } = useDexterity();
    const { modelState } = useModelSwitch();
    const activeModelRef = useRef(modelState.model);

    const [recording, setRecording] = useState(false);
    const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
    const [sequenceNum, setSequenceNum] = useState(30);

    const {
        wsStatus,
        result,
        confidence,
        translating,
        isProcessing,
        startRecording: socketStartRecording,
        stopRecording: socketStopRecording,
        sendFrame,
        convertGloss,
        setResult,
        setConfidence
    } = useTranslationSocket(dexterity);

    const startRecording = useCallback(() => {
        if (recording) {
            socketStopRecording();
            setRecording(false);
            setAutoCaptureEnabled(false);
        } else {
            setRecording(true);
            setAutoCaptureEnabled(true);
            socketStartRecording(activeModelRef.current, sequenceNum);
        }
    }, [recording, socketStartRecording, socketStopRecording, sequenceNum]);

    const stopRecording = useCallback(() => {
        socketStopRecording();
        setRecording(false);
        setAutoCaptureEnabled(false);
    }, [socketStopRecording]);

    const captureImageFromVideo = useCallback(() => {
        if (!videoRef.current) return;
        sendFrame(videoRef.current);
    }, [sendFrame]);


    useEffect(() => {
        activeModelRef.current = modelState.model;
        setSequenceNum(modelState.model === 'glosses' ? 30 : 10);
    }, [modelState.model]);


    useEffect(() => {
        let intervalId;
        const intervalDuration = activeModelRef.current === 'glosses' ? 100 : 200

        if (autoCaptureEnabled && videoRef.current) {
            intervalId = setInterval(() => {
                captureImageFromVideo();
            }, intervalDuration);
        }

        return () => clearInterval(intervalId);
    }, [autoCaptureEnabled, captureImageFromVideo]);

    useEffect(() => {
        const enableCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
                });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                console.error(err);
                setResult('Camera access denied.');
            }
        };

        enableCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            stopRecording();
        };
    }, [stopRecording, setResult]);

    return {
        videoRef,
        canvasRef1,
        canvasRef2,
        result,
        confidence,
        recording,
        startRecording,
        stopRecording,
        autoCaptureEnabled,
        setAutoCaptureEnabled,
        convertGloss,
        translating,
        wsStatus,
        isProcessing,
        setResult,
        setConfidence
    };
}
