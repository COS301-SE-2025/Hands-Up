import React, { useState, useRef, useEffect } from 'react';
import '../styles/Translator.css';

export default function Translator() 
{
  const videoRef = useRef(null);
  const [result, setResult] = useState("Awaiting sign capture...");
  const [recording, setRecording] = useState(false);
  const [speakDisabled, setSpeakDisabled] = useState(true);
  const [audioProgressWidth, setAudioProgressWidth] = useState(0);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) 
      {
        console.log(err);
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

  const capture = () => {
    setResult("Detected: 'Hello'");
    setSpeakDisabled(false);

    setAudioProgressWidth(0);
    setTimeout(() => {
      setAudioProgressWidth(100);
    }, 100);
  };

  const startRecording = () => {
    if (!recording) {
      setRecording(true);
      setResult("Recording signs...");

      setTimeout(() => {
        setRecording(false);
        setResult("Detected phrase: 'How are you?'");
        setSpeakDisabled(false);
      }, 5000);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setResult(`Processing uploaded ${file.type.includes('image') ? 'image' : 'video'}...`);

      setTimeout(() => {
        setResult("Detected: 'Thank you'");
        setSpeakDisabled(false);
      }, 2000);
    }
  };

  const speak = () => {
    const text = result.replace('Detected: ', '').replace('Detected phrase: ', '');
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
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
              <button onClick={startRecording} className="recognizer-control-button recognizer-record-button">
                <i className="fas fa-video"></i> Record Sequence
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
                <div className="recognizer-history-item"></div>
                <div className="recognizer-history-item"></div>
                <div className="recognizer-history-item"></div>
                <div className="recognizer-history-item"></div>
                <div className="recognizer-history-item"></div>
              </div>
            </div>
          </div>

          <div className="recognizer-right-column">
            <div className="recognizer-results">
              <h3 className="recognizer-results-title">
                <i className="fas fa-language recognizer-results-icon"></i> Translation Results
              </h3>
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