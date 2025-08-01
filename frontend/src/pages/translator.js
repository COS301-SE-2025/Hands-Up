import React, { useState, useEffect } from 'react';
import {useTranslator} from '../hooks/translateResults';
import {renderMediaPreview} from '../components/mediaPreview';
import {renderHistoryItem} from '../components/historyItem';
import {FingerspellingToggle} from '../components/fingerSpellingToggle'
import '../styles/translator.css';

export function Translator(){

  const [audioProgressWidth] = useState(0);

  const {
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
    handleFileUpload,
    setResult,
    fingerspellingMode,
    setFingerspellingMode
  } = useTranslator();

  const speakDisabled = result === "";
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); 

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = () => {
    const preferredVoice = availableVoices.find((voice) => voice.name === 'Microsoft Zira - English (United States)');

    const text = result.replace('Detected: ', '').replace('Detected phrase: ', '').replace('API Result: ', '');
    const utterance = new SpeechSynthesisUtterance(text);

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

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
              <div>
                <FingerspellingToggle 
                  fingerspellingMode={fingerspellingMode} 
                  setFingerspellingMode={setFingerspellingMode} 
                />
            </div>
              <button onClick={() => setResult("")} className="recognizer-control-button recognizer-capture-button">
                <i></i> Clear Results
              </button>
              <button 
                onClick={startRecording} 
                className={`recognizer-control-button ${recording ? 'recognizer-stop-button' : 'recognizer-record-button'}`}
              >
                <i className={`fas ${recording ? 'fa-stop' : 'fa-video'}`}></i> 
                {recording ? 'Stop Signing' : 'Start Signing'}
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
                {captureHistory.map((capture) => (
                  <div 
                    key={capture.id} 
                    className="recognizer-history-item" 
                    title={`${capture.type} - ${capture.timestamp}`}
                    //onClick={() => handleHistoryClick(capture)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
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
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    className="history-hover-overlay"
                    >
                    
                    </div>
                  </div>
                ))}
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
                  aria-label='Volume Up'
                  className="recognizer-speak-button" 
                  disabled={speakDisabled}
                  onClick={speak} 
                >
                  <i className="fas fa-volume-up"></i>
                </button>
                <button 
                  className="recognizer-speak-button" 
                  disabled={!capturedBlob}
                  title="Send to API for processing"
                  style={{ marginLeft: '10px' }}
                >
                  <i className="fas fa-cloud-upload-alt"></i>
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
                  <span>Confidence: <span className="recognizer-confidence-value">{confidence}</span></span>
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
                  <span>Hold the sign steady for 2 seconds</span>
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
                Need help? <button className="recognizer-support-link">Contact Support</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
