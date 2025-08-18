import { useState, useRef, useEffect, useCallback } from 'react';
import { processImage, processWords} from '../utils/apiCalls';
import SignLanguageAPI  from '../utils/apiCalls';
import { useModelSwitch } from '../contexts/modelContext';
import { v4 as uuidv4 } from 'uuid';

export function useTranslator() {
    const videoRef = useRef(null);
    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    const [result, setResult] = useState("");
    const [confidence, setConfidence] = useState("Awaiting capture to detect confidence level...");
    const [recording, setRecording] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturedType, setCapturedType] = useState(null);
    const [captureHistory, setCaptureHistory] = useState([]);
    const [capturedBlob, setCapturedBlob] = useState(null);
    const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
    const [landmarkFrames, setLandmarkFrames] = useState([]);
    const [fingerspellingMode, setFingerspellingMode] = useState(false);
    const processingRef = useRef(false);
    const { modelState } = useModelSwitch();
    const activeModelRef = useRef(modelState.model);
    const [isSwitching, setIsSwitching] = useState(false);
    const sequenceNum = 90;

    const stopRecording = useCallback(() => {
        setRecording(false);
        setAutoCaptureEnabled(false);
        setLandmarkFrames([]);
    }, [setRecording, setLandmarkFrames, setAutoCaptureEnabled]);

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
        if (!Array.isArray(blobs) || blobs.length !== sequenceNum || processingRef.current) return;

        if (isSwitching) {
            console.log("Skipping prediction during swipe...");
            return;
        }

        processingRef.current = true;

        try {
            const formData = new FormData();
            blobs.forEach((blob, i) => {
                formData.append('frames', blob, `frame${i}.jpg`);
            });

            const response = await processWords(formData);

            if (!response || !response.letter || !response.number) {
                console.error("Invalid response from API:", response);
                return;
            }

            setResult(prev => {
                if (activeModelRef.current === 'alpha') {
                    if (response?.letter === 'SPACE') return prev + ' ';
                    if (response?.letter === 'DEL') return prev.slice(0, -1);
                    setConfidence((response?.confidenceLetter * 100).toFixed(2) + "%");
                    return prev + response?.letter;
                } else if (activeModelRef.current === 'num') {
                    setConfidence((response?.confidenceNumber * 100).toFixed(2) + "%");
                    return prev + response?.number;
                }
            });

        } catch (err) {
            console.error("Error during sequence detection:", err);
            setResult("Error translating sign.");
            setConfidence("0%");
        } finally {
            processingRef.current = false;
            setLandmarkFrames([]);
        }
    }, [setResult, setConfidence, isSwitching]);

    const captureImageFromVideo = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef1.current;

        if (video && canvas) {
            const ctx = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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

                if (fingerspellingMode) {
                    setLandmarkFrames(prevFrames => {
                        const updated = [...prevFrames, blob];

                        if (updated.length === sequenceNum) {
                            sendSequenceToBackend(updated);
                            setLandmarkFrames([]);
                            stopRecording();
                            return [];
                        }

                        return updated;
                    });
                }
            }, 'image/jpeg', 0.8);
        }
    }, [
        videoRef,
        canvasRef1,
        fingerspellingMode,
        setCapturedImage,
        setCapturedType,
        setCapturedBlob,
        setCaptureHistory,
        setLandmarkFrames,
        sendSequenceToBackend,
    ]);

    useEffect(() => {
        setIsSwitching(true);

        const timeout = setTimeout(() => {
            activeModelRef.current = modelState.model;
            setIsSwitching(false); 
        }, 500); 

        return () => clearTimeout(timeout);
    }, [modelState.model]);

   useEffect(() => {
        let intervalId;

        if (autoCaptureEnabled && fingerspellingMode && videoRef.current) {
            intervalId = setInterval(() => {
                captureImageFromVideo();
            }, 33.33); 
        }

        return () => clearInterval(intervalId);
    }, [autoCaptureEnabled, fingerspellingMode, captureImageFromVideo]);

    
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

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isVideo = file.type.includes('video');
        const isImage = file.type.includes('image');
        const url = URL.createObjectURL(file);

        setResult(`Processing uploaded ${isVideo ? 'video' : 'image'}...`);
        setCapturedImage(url);
        setCapturedType(isVideo ? 'video' : 'image');
        setCapturedBlob(file);

        setCaptureHistory(prev => [
            { id: uuidv4(), url, type: isVideo ? 'video' : 'image', blob: file, timestamp: new Date().toLocaleTimeString() },
            ...prev.slice(0, 4)
        ]);

        if (isVideo) {
            const videoResult = await SignLanguageAPI.processVideo(file);
            
            setResult(videoResult.phrase !== "Nothing detected" ? videoResult.phrase : "No sign detected");
            if (videoResult.confidence> 0) {
                const avg = videoResult.confidence*100;
                setConfidence(avg.toFixed(2) + "%");
            } else {
                setConfidence("0%");
            }
            setRecording(false);
        } else if (isImage) {
            const imgResult = await processImage(file);
            setResult(imgResult.phrase || "No sign detected");
            setConfidence((imgResult.confidence * 100).toFixed(2) + "%");
        } else {
            setResult("Unsupported file type. Please upload an image or video.");
        }
    };

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
        handleFileUpload,
        setResult,
        fingerspellingMode,
        setFingerspellingMode,
        autoCaptureEnabled,
        setAutoCaptureEnabled,
        landmarkFrames,
    };
}
