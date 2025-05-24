import { useState, useRef, useEffect } from 'react';
import '../styles/Translator.css';

export default function Translator() 
{
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState("Awaiting sign capture...");
  const [recording, setRecording] = useState(false);
  const [speakDisabled, setSpeakDisabled] = useState(true);
  const [audioProgressWidth, setAudioProgressWidth] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedType, setCapturedType] = useState(null); // 'image' or 'video'
  const [captureHistory, setCaptureHistory] = useState([]);

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) 
      {
        setResult('Camera access denied.');
      }
    };

    enableCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const captureImageFromVideo = () => {
    if(videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob/base64 for processing
      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        setCapturedType('image');

        // Add to history
        setCaptureHistory(prev => [{
          id: Date.now(),
          url: imageUrl,
          type: 'image',
          timestamp: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 4)]);

        // Process the captured image
        processImage(blob);
      }, 'image/jpeg', 0.8);
    }
  };

  const processImage = async (imageBlob) => {
    setResult("Processing captured image...");

    // Simulate processing
    setTimeout(() => {
      setResult("Detected: 'Hello'");
      setSpeakDisabled(false);
      setAudioProgressWidth(0);
      setTimeout(() => {
        setAudioProgressWidth(100);
      }, 100);
    }, 1500);

    // Example API call for image processing
    /*
    const formData = new FormData();
    formData.append('image', imageBlob, 'capture.jpg');
    
    try {
      const response = await fetch('/api/process-sign', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setResult(`Detected: '${data.sign}'`);
      setSpeakDisabled(false);
    } catch (error) {
      setResult('Error processing image');
    }
    */
  };

  const processVideo = async (videoBlob) => {
    setResult("Processing captured video...");

    // Simulate faster processing
    setTimeout(() => {
      setResult("Detected phrase: 'How are you?'");
      setSpeakDisabled(false);
      setAudioProgressWidth(0);
      setTimeout(() => {
        setAudioProgressWidth(100);
      }, 100);
    }, 800); // Reduced from 2000ms to 800ms

    // Example API call for video processing with optimized FormData
    /*
    const formData = new FormData();
    formData.append('video', videoBlob, 'sign.webm');
    
    try {
      const response = await fetch('/api/process-video', {
        method: 'POST',
        body: formData,
        // Add headers for faster processing
        headers: {
          'Accept': 'application/json',
        }
      });
      const data = await response.json();
      setResult(`Detected phrase: '${data.phrase}'`);
      setSpeakDisabled(false);
    } catch (error) {
      setResult('Error processing video');
    }
    */
  };

  const capture = () => {
    captureImageFromVideo();
  };

  const startRecording = () => {
    if (recording) {
      // Stop recording if already recording
      stopRecording();
      return;
    }

    const stream = videoRef.current?.srcObject;
    if (!stream) return;

    // Reset chunks for new recording
    setRecordedChunks([]);
    
    // Use higher bitrate for better quality and faster processing
    const options = {
      mimeType: 'video/webm;codecs=vp8',
      videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
    };
    
    // Fallback options if the preferred format isn't supported
    let recorder;
    try {
      recorder = new MediaRecorder(stream, options);
    } catch (e) {
      // Fallback to default
      recorder = new MediaRecorder(stream);
    }

    const chunks = []; // Local array to collect chunks

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      // Create blob from collected chunks
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);
      
      setCapturedImage(videoURL);
      setCapturedType('video');
      
      // Add to history
      setCaptureHistory(prev => [{
        id: Date.now(),
        url: videoURL,
        type: 'video',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]);

      // Process the video
      processVideo(blob);
      setRecording(false);
    };

    setMediaRecorder(recorder);
    
    // Start recording with timeslice for more frequent data events
    recorder.start(200); // Request data every 200ms
    setRecording(true);
    setResult("Recording signs... Click again to stop");
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const isVideo = file.type.includes('video');
      const isImage = file.type.includes('image');
      
      setResult(`Processing uploaded ${isVideo ? 'video' : 'image'}...`);
      
      const fileUrl = URL.createObjectURL(file);
      setCapturedImage(fileUrl);
      setCapturedType(isVideo ? 'video' : 'image');

      // Add to history
      setCaptureHistory(prev => [{
        id: Date.now(),
        url: fileUrl,
        type: isVideo ? 'video' : 'image',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]);

      // Process the uploaded file
      if (isVideo) {
        processVideo(file);
      } else {
        processImage(file);
      }
    }
  };

  const speak = () => {
    const text = result.replace('Detected: ', '').replace('Detected phrase: ', '');
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const renderMediaPreview = (url, type) => {
    if (type === 'video') {
      return (
        <video 
          controls 
          src={url} 
          style={{ 
            width: '100%', 
            height: '250px', 
            objectFit: 'cover',
            border: '2px solid #ddd', 
            borderRadius: '8px' 
          }}
        />
      );
    } else {
      return (
        <img 
          src={url} 
          alt="Captured sign" 
          style={{ 
            width: '100%', 
            height: '250px', 
            objectFit: 'cover', 
            border: '2px solid #ddd', 
            borderRadius: '8px' 
          }}
        />
      );
    }
  };

  const renderHistoryItem = (capture) => {
    if (capture.type === 'video') {
      return (
        <video 
          src={capture.url} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          muted
        />
      );
    } else {
      return (
        <img 
          src={capture.url} 
          alt={`Capture`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    }
  };

  return (
    <div className="recognizer-container">
      <div className="recognizer-content">
        <div className="recognizer-columns">
          <div className="recognizer-left-column">
            <h2 className="recognizer-title">
              <i className="fas fa-camera-retro recognizer-title-icon"></i> Sign Language Recognizer
            </h2>

            <div className="recognizer-banner">
              <i className="fas fa-lightbulb recognizer-banner-icon"></i>
              <p>Position your hand clearly in frame for best recognition results</p>
            </div>

            <div className="recognizer-camera-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="recognizer-video"
              ></video>
              {/* Hidden canvas for capturing video frames */}
              <canvas 
                ref={canvasRef} 
                style={{ display: 'none' }}
              ></canvas>
              
              <div className="recognizer-camera-controls">
                <button className="recognizer-camera-button" title="Switch camera">
                  <i className="fas fa-sync-alt"></i>
                </button>
                <button className="recognizer-camera-button" title="Toggle fullscreen">
                  <i className="fas fa-expand"></i>
                </button>
              </div>
              <div className="recognizer-camera-status">
                <div className="recognizer-live-indicator">
                  <i className="fas fa-circle recognizer-pulse-icon"></i>
                  <span>Live</span>
                </div>
              </div>
              {recording && (
                <div className="recognizer-recording-indicator">
                  <i className="fas fa-circle recognizer-pulse-icon"></i> Recording...
                </div>
              )}
            </div>

            <div className="recognizer-controls">
              <button onClick={capture} className="recognizer-control-button recognizer-capture-button">
                <i className="fas fa-camera"></i> Capture Sign
              </button>
              <button 
                onClick={startRecording} 
                className={`recognizer-control-button ${recording ? 'recognizer-stop-button' : 'recognizer-record-button'}`}
              >
                <i className={`fas ${recording ? 'fa-stop' : 'fa-video'}`}></i> 
                {recording ? 'Stop Recording' : 'Record Sequence'}
              </button>
              <label className="recognizer-control-button recognizer-upload-button">
                <i className="fas fa-upload"></i> Upload Sign
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  className="recognizer-file-input" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div className="recognizer-history">
              <h3 className="recognizer-history-title">
                <i className="fas fa-history recognizer-history-icon"></i> Recent Captures
              </h3>
              <div className="recognizer-history-items">
                {captureHistory.map((capture, index) => (
                  <div key={capture.id} className="recognizer-history-item" title={`${capture.type} - ${capture.timestamp}`}>
                    {renderHistoryItem(capture)}
                    <div style={{ 
                      position: 'absolute', 
                      top: '2px', 
                      right: '2px', 
                      background: 'rgba(0,0,0,0.7)', 
                      color: 'white', 
                      padding: '2px 4px', 
                      borderRadius: '3px', 
                      fontSize: '10px' 
                    }}>
                      {capture.type === 'video' ? '🎥' : '📷'}
                    </div>
                  </div>
                ))}
                {/* Fill remaining slots with empty divs */}
                {Array.from({ length: Math.max(0, 5 - captureHistory.length) }, (_, i) => (
                  <div key={`empty-${i}`} className="recognizer-history-item"></div>
                ))}
              </div>
            </div>
          </div>

          <div className="recognizer-right-column">
            <div className="recognizer-results">
              <h3 className="recognizer-results-title">
                <i className="fas fa-language recognizer-results-icon"></i> Translation Results
              </h3>
              
              {/* Display captured image/video if available */}
              {capturedImage && (
                <div className="recognizer-captured-image" style={{ marginBottom: '10px' }}>
                  {renderMediaPreview(capturedImage, capturedType)}
                </div>
              )}
              
              <div className="recognizer-results-display">
                <p className={`recognizer-results-text ${result !== "Awaiting sign capture..." ? "recognizer-results-detected" : ""}`}>
                  {result}
                </p>
              </div>

              <div className="recognizer-audio-controls">
                <button 
                  onClick={speak} 
                  className="recognizer-speak-button" 
                  disabled={speakDisabled}
                >
                  <i className="fas fa-volume-up"></i>
                </button>
                <div className="recognizer-audio-progress-container">
                  <div 
                    className="recognizer-audio-progress" 
                    style={{ width: `${audioProgressWidth}%` }}
                  ></div>
                </div>
              </div>

              <div className="recognizer-additional-info">
                <div className="recognizer-confidence">
                  <span>Confidence: <span className="recognizer-confidence-value">98%</span></span>
                  <span>Alternative: <span className="recognizer-alternative-value">None</span></span>
                </div>
              </div>
            </div>

            <div className="recognizer-tips">
              <h3 className="recognizer-tips-title">
                <i className="fas fa-lightbulb recognizer-tips-icon"></i> Tips for Better Recognition
              </h3>
              <ul className="recognizer-tips-list">
                <li className="recognizer-tip-item">
                  <i className="fas fa-sun recognizer-tip-icon"></i>
                  <span>Ensure good lighting on your hands</span>
                </li>
                <li className="recognizer-tip-item">
                  <i className="fas fa-bullseye recognizer-tip-icon"></i>
                  <span>Position your hands in the center of the frame</span>
                </li>
                <li className="recognizer-tip-item">
                  <i className="fas fa-clock recognizer-tip-icon"></i>
                  <span>Hold the sign steady for 1-2 seconds</span>
                </li>
                <li className="recognizer-tip-item">
                  <i className="fas fa-adjust recognizer-tip-icon"></i>
                  <span>Make sure your hand is clearly visible against the background</span>
                </li>
              </ul>
              <div className="recognizer-learn-more">
                <a href="/learn" className="recognizer-learn-link">
                  <i className="fas fa-graduation-cap"></i> Learn more signs
                </a>
              </div>
            </div>

            <div className="recognizer-support">
              <p className="recognizer-support-text">
                Need help? <a href="#" className="recognizer-support-link">Contact Support</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}