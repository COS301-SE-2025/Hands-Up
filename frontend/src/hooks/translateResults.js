import { useState, useRef, useEffect, useCallback } from 'react';
import { processLetters, processWords, produceSentence} from '../utils/apiCalls';
import { useModelSwitch } from '../contexts/modelContext';
import { v4 as uuidv4 } from 'uuid';

export function useTranslator() {
    const videoRef = useRef(null);
    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    const processingRef = useRef(false);
    const [result, setResult] = useState("");
    const [confidence, setConfidence] = useState("Awaiting capture to detect confidence level...");
    const [recording, setRecording] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturedType, setCapturedType] = useState(null);
    const [captureHistory, setCaptureHistory] = useState([]);
    const [capturedBlob, setCapturedBlob] = useState(null);
    const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
    const [landmarkFrames, setLandmarkFrames] = useState([]);
    const { modelState } = useModelSwitch();
    const activeModelRef = useRef(modelState.model);
    const [isSwitching, setIsSwitching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sequenceNum, setSequenceNum] = useState(90);

    const stopRecording = useCallback(async () => {
    setRecording(false);
    setAutoCaptureEnabled(false);
    setLandmarkFrames([]);

    if (result.trim()) {
        const hasAlphabets = /[a-zA-Z]/.test(result);
        const wordCount = result.trim().split(/\s+/).length;

        const video = videoRef.current;
        const canvas = canvasRef1.current;

        if (!hasAlphabets || wordCount < 2) {
            const ctx = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(0,0,0,0.5)'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);

            ctx.font = 'bold 24px Sans-serif';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('ENGLISH NOT AVAILABLE...', canvas.width / 2, canvas.height / 2);
        }

        try {
            const translation = await produceSentence(result);
            if (translation) {
                setResult(translation.translation);
            }
        } catch (err) {
            console.error("Error producing sentence:", err);
        }
    }
}, [result, setRecording, setLandmarkFrames, setAutoCaptureEnabled]);

    const startRecording = useCallback(async () => {
        if (recording) {
            stopRecording();
            setCapturedImage(null);
        } else {
            setAutoCaptureEnabled(true);
            setRecording(true);
        }
    }, [recording, stopRecording, setCapturedImage, setAutoCaptureEnabled, setRecording]);

    const sendSequenceToBackend = useCallback(async (blobs) => {
        
        const currentModel = activeModelRef.current;
        const requiredFrames = sequenceNum;

        if (!Array.isArray(blobs) || blobs.length !== requiredFrames || processingRef.current) return;

        if (isSwitching) {
            console.log("Skipping prediction during swipe...");
            return;
        }

        setIsProcessing(true);
        processingRef.current = true;

        try {
            const formData = new FormData();
            blobs.forEach((blob, i) => {
                formData.append('frames', blob, `frame${i}.jpg`);
            });

            let response;
            if (currentModel === 'glosses') {
                response = await processWords(formData);
            } else {
                response = await processLetters(formData);
            }
            if (!response) {
                console.error("Invalid response from API:", response);
                return;
            }

            
            setResult(prev => {
                if (activeModelRef.current === 'alpha') {
                    if (response?.letter === 'SPACE') return prev + ' ';
                    if (response?.letter === 'DEL') return prev.slice(0, -1);

                    setConfidence((response?.confidenceLetter * 100).toFixed(2) + "%");
                    return prev + (response?.letter || '');
                } else if (activeModelRef.current === 'num') {
                    setConfidence((response?.confidenceNumber * 100).toFixed(2) + "%");
                    return prev + (response?.number + ' ' || '');
                } else if (activeModelRef.current === 'glosses') {
                    setConfidence((response?.confidence * 100).toFixed(2) + "%");
                    return prev + (response?.word + ' ' || '');
                }
                return prev; 
            });

        } catch (err) {
            console.error("Error during sequence detection:", err);
            setResult("Error translating sign.");
            setConfidence("0%");
        } finally {
            setIsProcessing(false);
            processingRef.current = false;
            setLandmarkFrames([]);
        }
    }, [setResult, setConfidence, isSwitching, sequenceNum]);

    const captureImageFromVideo = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef1.current;
        const currentModel = activeModelRef.current;
        const requiredFrames = currentModel === 'glosses' ? 90 : 20;

        if (video && canvas) {

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    console.error("Canvas toBlob failed to create a blob.");
                    return;
                }
                const url = URL.createObjectURL(blob);
                setCapturedImage(url);
                setCapturedType('image');
                setCapturedBlob(blob);
                setCaptureHistory(prev => [
                    { id: uuidv4(), url, type: 'image', blob, timestamp: new Date().toLocaleTimeString() },
                    ...prev.slice(0, 4)
                ]);

                setLandmarkFrames(prevFrames => {
                    const updated = [...prevFrames, blob];

                    if (updated.length === requiredFrames) {
                        sendSequenceToBackend(updated);
                        setLandmarkFrames([]);
                        // stopRecording();
                        return [];
                    }

                    return updated;
                });
               
            }, 'image/jpeg', 0.8);
        }
    }, [
        videoRef,
        canvasRef1,
        setCapturedImage,
        setCapturedType,
        setCapturedBlob,
        setCaptureHistory,
        setLandmarkFrames,
        sendSequenceToBackend,
    ]);

    useEffect(() => {
        const canvas = canvasRef1.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const draw = () => {
            if (video.readyState >= 2) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                if (isProcessing) {
                    ctx.fillStyle = 'rgba(0,0,0,0.5)'; 
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);

                    ctx.font = 'bold 24px Sans-serif';
                    ctx.fillStyle = 'green';
                    ctx.textAlign = 'center';
                    ctx.fillText('PROCESSING...', canvas.width / 2, canvas.height / 2);
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isProcessing, canvasRef1, videoRef]);

    useEffect(() => {
        setIsSwitching(true);

        const timeout = setTimeout(() => {
            activeModelRef.current = modelState.model;
            setSequenceNum(modelState.model === 'glosses' ? 90 : 20);
            setIsSwitching(false); 
        }, 500); 

        return () => clearTimeout(timeout);
    }, [modelState.model, setSequenceNum]);

   useEffect(() => {
        let intervalId;

        const requiredFrames = modelState.model === 'glosses' ? 90 : 20;
        const intervalDuration = 600 / requiredFrames; 

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
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
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
        };
    }, [setResult]);

    return {
        videoRef,
        canvasRef1,
        canvasRef2,
        result,
        confidence,
        recording,
        capturedImage,
        capturedType,
        captureHistory,
        capturedBlob,
        startRecording,
        stopRecording,
        setResult,
        autoCaptureEnabled,
        setAutoCaptureEnabled,
        landmarkFrames,
    };
}
