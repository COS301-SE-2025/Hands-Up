import { useState, useRef, useEffect, useCallback } from 'react';
import { processLetters, processWords, produceSentence} from '../utils/apiCalls';
import { useDexterity } from '../contexts/dexterityContext';

export function useQuizTranslator({ detectionScope = 'alpha', forceModel = null, category = null }) {
    const videoRef = useRef(null);
    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    const processingRef = useRef(false);
    const [result, setResult] = useState("");
    const [confidence, setConfidence] = useState("Awaiting capture to detect confidence level...");
    const [recording, setRecording] = useState(false);
    const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
    const [landmarkFrames, setLandmarkFrames] = useState([]);
    
    const activeModel = forceModel || detectionScope;
    const activeModelRef = useRef(activeModel);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [sequenceNum, setSequenceNum] = useState(activeModel === 'glosses' ? 90 : 20);
    const [translating, setTranslating] = useState(false);
    const { dexterity } = useDexterity();

    useEffect(() => {
        console.log(`useQuizTranslator initialized - Category: ${category}, DetectionScope: ${detectionScope}, ForceModel: ${forceModel}, ActiveModel: ${activeModel}`);
    }, [category, detectionScope, forceModel, activeModel]);

    const convertGloss = async () => {
        if (result.trim()) {
            const hasAlphabets = /[a-zA-Z]/.test(result);
            const wordCount = result.trim().split(/\s+/).length;

            const video = videoRef.current;
            const canvas = canvasRef1.current;

            if (!hasAlphabets || wordCount < 2) {
                const ctx = canvas.getContext('2d');

                canvas.width = video.videoWidth*0.2;
                canvas.height = video.videoHeight*0.2;
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
    }

    const stopRecording = useCallback(async () => {
        //console.log(`Stopping recording for ${activeModel} model`);
        setRecording(false);
        setAutoCaptureEnabled(false);
        setLandmarkFrames([]);
    }, [setRecording, setLandmarkFrames, setAutoCaptureEnabled, activeModel]);

    const startRecording = useCallback(async () => {
        if (recording) {
            //console.log(`Stopping current recording for ${activeModel} model`);
            stopRecording();
        } else {
            //console.log(`Starting recording for ${activeModel} model (category: ${category})`);
            setAutoCaptureEnabled(true);
            setRecording(true);
        }
    }, [recording, stopRecording, setAutoCaptureEnabled, setRecording, activeModel, category]);

    const sendSequenceToBackend = useCallback(async (blobs) => {
        const currentModel = activeModelRef.current;
        const requiredFrames = sequenceNum;

        //console.log(`Sending sequence to backend - Model: ${currentModel}, Frames: ${blobs.length}/${requiredFrames}`);

        if (!Array.isArray(blobs) || blobs.length !== requiredFrames || processingRef.current) return;

        setIsProcessing(true);
        processingRef.current = true;

        try {
            const formData = new FormData();
            blobs.forEach((blob, i) => {
                formData.append('frames', blob, `frame${i}.jpg`);
            });

            let response;
            
           // console.log(`Processing with model: ${currentModel}`);
            
            if (currentModel === 'glosses') {
                response = await processWords(formData);
                //console.log(`Words API response:`, response);
            } else if (currentModel === 'num') {
                response = await processLetters(formData); 
                //console.log(`Numbers API response:`, response);
            } else { 
                response = await processLetters(formData);
                //console.log(`Letters API response:`, response);
            }
            
            if (!response) {
                console.error("Invalid response from API:", response);
                return;
            }
            
            setResult(prev => {
                let newResult = prev || "";

                if (currentModel === 'alpha') {
                    const letter = response?.letter ?? '';
                    //console.log(`Alpha model detected letter: ${letter}`);
                    if (letter === 'SPACE') newResult += ' ';
                    else if (letter === 'DEL') newResult = newResult.slice(0, -1);
                    else newResult += letter;

                    setConfidence(`${((response?.confidenceLetter ?? 0) * 100).toFixed(2)}%`);
                } else if (currentModel === 'num') {
                    const number = response?.number ?? '';
                    //console.log(`Number model detected: ${number}`);
                    newResult += number + ' ';
                    setConfidence(`${((response?.confidenceNumber ?? 0) * 100).toFixed(2)}%`);
                } else if (currentModel === 'glosses') {
                    const word = response?.word ?? '';
                    //console.log(`Glosses model detected word: ${word}`);
                    newResult += word + ' ';
                    setConfidence(`${((response?.confidence ?? 0) * 100).toFixed(2)}%`);
                }

                newResult = newResult.replace(/undefined/g, '');
                //console.log(`Updated result for ${currentModel}:`, newResult);

                return newResult;
            });

        } catch (err) {
            console.error(`Error during ${currentModel} sequence detection:`, err);
            setResult("Error translating sign.");
            setConfidence("0%");
        } finally {
            setIsProcessing(false);
            processingRef.current = false;
            setLandmarkFrames([]);
        }
    }, [setResult, setConfidence, sequenceNum]);

    const captureImageFromVideo = useCallback(() => {
        const video = videoRef.current;
        const currentModel = activeModelRef.current;
        const requiredFrames = currentModel === 'glosses' ? 90 : 20;
        
        if (!video) return;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        if (dexterity === 'left') {
            tempCtx.save();
            tempCtx.translate(tempCanvas.width, 0);
            tempCtx.scale(-1, 1);
        }

        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

        if (dexterity === 'left') tempCtx.restore();

        tempCanvas.toBlob(async (blob) => {
            if (!blob) return;

            setLandmarkFrames(prev => {
                const updated = [...prev, blob];
                if (updated.length === requiredFrames) {
                    sendSequenceToBackend(updated);
                    return [];
                }
                return updated;
            });
        }, 'image/jpeg', 0.8);
    }, [dexterity, sendSequenceToBackend]);

    useEffect(() => {
        const canvas = canvasRef1.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const draw = () => {
            if (video.readyState >= 2) {
                canvas.width = video.videoWidth*0.2;
                canvas.height = video.videoHeight*0.2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.shadowColor = 'rgba(255, 0, 0, 0.7)'; 
                ctx.shadowBlur = 10;   
                ctx.font = 'bold 20px Sans-serif';
                ctx.fillStyle = 'red';
                ctx.textAlign = 'center';

                if (isProcessing) {
                    ctx.fillText(`Processing (${activeModel})`, canvas.width / 2, canvas.height / 2);
                } else if(recording) {
                    ctx.fillText(`Capturing (${activeModel})`, canvas.width / 2, canvas.height / 2);
                }
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isProcessing, recording, activeModel]);

    useEffect(() => {
        const newModel = forceModel || detectionScope;
        activeModelRef.current = newModel;
        setSequenceNum(newModel === 'glosses' ? 90 : 20);
        //console.log(`Model updated to: ${newModel}, Sequence frames: ${newModel === 'glosses' ? 90 : 20}`);
    }, [forceModel, detectionScope]);

    useEffect(() => {
        let intervalId;

        const currentModel = activeModelRef.current;
        const requiredFrames = currentModel === 'glosses' ? 90 : 20;
        const intervalDuration = 500 / requiredFrames; 

        if (autoCaptureEnabled && videoRef.current) {
            intervalId = setInterval(() => {
                captureImageFromVideo();
            }, intervalDuration);
        }

        return () => clearInterval(intervalId);
    }, [autoCaptureEnabled, captureImageFromVideo, activeModel]);

    useEffect(() => {
        const enableCamera = async () => {
            try {
                //console.log(`Enabling camera for ${activeModel} model detection`);
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1920 }, 
                        height: { ideal: 1080 },
                    }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Camera access error:', err);
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
    }, [setResult, activeModel]);

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
        landmarkFrames,
        convertGloss,
        translating,
        activeModel, 
    };
}