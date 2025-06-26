import { useState, useRef, useEffect } from 'react';
import { processImage} from '../utils/apiCalls';
import {SignLanguageAPI, translateSequence } from '../utils/apiCalls';
import { v4 as uuidv4 } from 'uuid';

export function useTranslator() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [result, setResult] = useState("");
    const [confidence, setConfidence] = useState("Awaiting capture to detect confidence level...");
    const [recording, setRecording] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturedType, setCapturedType] = useState(null); 
    const [captureHistory, setCaptureHistory] = useState([]);
    const [capturedBlob, setCapturedBlob] = useState(null); 
    const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
    const [landmarkFrames, setLandmarkFrames] = useState([]);
    const [isProcessingSequence, setIsProcessingSequence] = useState(false);
    const [fingerspellingMode, setFingerspellingMode] = useState(false);

    useEffect(() => {
      let intervalId;
      if (autoCaptureEnabled && videoRef.current) {
        const intervalTime = fingerspellingMode ? 2000 : 100;
        intervalId = setInterval(() => {
          captureImageFromVideo(); 
        }, intervalTime); 
      }
      return () => clearInterval(intervalId);
    }, [autoCaptureEnabled, fingerspellingMode]);

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

      const videoRefStore = videoRef.current

      enableCamera();
          return () => {
              if (videoRefStore?.srcObject) {
              videoRefStore.srcObject.getTracks().forEach(track => track.stop());
              }
          };
    }, []);

    // useEffect(() => {
    //     let intervalId;
    //     if (autoCaptureEnabled && videoRef.current) {
    //     intervalId = setInterval(() => {
    //         captureImageFromVideo();
    //     }, 2000);
    //     }
    //     return () => clearInterval(intervalId);
    // }, [autoCaptureEnabled]);

  //   const captureImageFromVideo = () => {

  //   const video = videoRef.current;
  //   const canvas = canvasRef.current;
    
  //   if (video && canvas) {
  //     const ctx = canvas.getContext('2d');
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  //     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  //     canvas.toBlob(async (blob) => {
  //       const url = URL.createObjectURL(blob);
  //       setCapturedImage(url);
  //       setCapturedType('image');
  //       setCapturedBlob(blob);
  //       setCaptureHistory(prev => [
  //         { id: Date.now(), url, type: 'image', blob, timestamp: new Date().toLocaleTimeString() },
  //         ...prev.slice(0, 4)
  //       ]);
  //       const sign = await processImage(blob);
  //       setResult(prev => {
  //         if (sign.phrase === 'SPACE') return prev + ' ';
  //         if (sign.phrase === 'DEL') return prev.slice(0, -1);
  //         if (sign.phrase === 'Nothing detected') return prev;
  //         return prev + sign.phrase;
  //       });
  //       setConfidence((sign.confidence * 100).toFixed(2) + '%');
  //     }, 'image/jpeg', 0.8);
  //   }
  // };

  const captureImageFromVideo = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(async (blob) => {
              const url = URL.createObjectURL(blob);
              setCapturedImage(url);
              setCapturedType('image');
              setCapturedBlob(blob);
              setCaptureHistory(prev => [
                  { id: uuidv4(), url, type: 'image', blob, timestamp: new Date().toLocaleTimeString() },
                  ...prev.slice(0, 4)
              ]);

            if (fingerspellingMode) {
            const sign = await processImage(blob);
            setResult(prev => {
              if (sign.phrase === 'SPACE') return prev + ' ';
              if (sign.phrase === 'DEL') return prev.slice(0, -1);
              if (sign.phrase === 'Nothing detected') return prev;
              return prev + sign.phrase;
            });
            setConfidence((sign.confidence * 100).toFixed(2) + '%');
          } else {
            setLandmarkFrames(prevFrames => {
              const safePrev = Array.isArray(prevFrames) ? prevFrames : [];
              if (isProcessingSequence || !autoCaptureEnabled) return safePrev;

              const updated = [...safePrev, blob];

              if (updated.length === 30) {
                setIsProcessingSequence(true); 
                sendSequenceToBackend(updated);
                setResult("Processing...");
                return [];
              }

              return updated;
            });
          }
        }, 'image/jpeg', 0.8);
      }
  };

  const sendSequenceToBackend = async (blobs) => {
      if (!Array.isArray(blobs)) {
          console.error("Expected array of blobs, got:", blobs);
          return;
      }

      try {
          const response = await translateSequence(blobs); 
          console.log("frontend result: ", response);
          setResult((response.prediction));
          setIsProcessingSequence(false);
          if (typeof response.confidence === 'number') {
              setConfidence((response.confidence * 100).toFixed(2) + '%');
          } else {
              setConfidence("0.0%");
          }
      } catch (err) {
          console.error("Failed to send frame sequence:", err);
          setResult("Error translating sign.");
          setConfidence("0%");
      } finally {
          setIsProcessingSequence(false); 
      }
  };


  const startRecording = () => {
    if (recording) {
      stopRecording();
      setAutoCaptureEnabled(false);
      setCapturedImage(null);
    } else {
      setAutoCaptureEnabled(true);
      setRecording(true);
    }
  };

  const stopRecording = () => {
    setRecording(false);
    setAutoCaptureEnabled(false)
    setLandmarkFrames([]);
  }

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
      { id: Date.now(), url, type: isVideo ? 'video' : 'image', blob: file, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 4)
    ]);

    if (isVideo) {
      const videoResult = await SignLanguageAPI.processVideo(file);
      setResult(videoResult.phrase !== "Nothing detected" ? videoResult.phrase : "No sign detected");
      if (videoResult.frames?.length > 0) {
        const avg = videoResult.frames.reduce((a, f) => a + f.confidence, 0) / videoResult.frames.length;
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
    canvasRef,
    result,
    confidence,
    recording,
    capturedImage,
    capturedType,
    captureHistory,
    capturedBlob,
    startRecording,
    setRecording,
    handleFileUpload,
    setResult,
    fingerspellingMode,
    setFingerspellingMode
  };
}

