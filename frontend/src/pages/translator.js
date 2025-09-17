import React, { useState, useEffect } from 'react';
import {TestSetup} from '../components/testSetup';
import {useTranslator} from '../hooks/translateResults';
import {renderMediaPreview} from '../components/mediaPreview';
import { useSwitchLandmarks } from '../hooks/switchLandmarks.js';
import { useAuth } from '../contexts/authContext.js';
import '../styles/translator.css';

export function Translator(){

  const [audioProgressWidth] = useState(0);
  const { justSignedUp } = useAuth();
  const [showTest, setShowTest] = useState(false);

  const {
    videoRef,
    canvasRef1,
    canvasRef2,
    result,
    confidence,
    recording,
    capturedImage,
    capturedType,
    capturedBlob,
    startRecording,
    setResult,
  } = useTranslator();

  useSwitchLandmarks(videoRef, canvasRef2);

  const speakDisabled = result === "";
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    const alreadySeenTest = localStorage.getItem("translatorTestSeen");

    if (!alreadySeenTest && justSignedUp) {
      setShowTest(true);
      localStorage.setItem("translatorTestSeen", "true"); 
    }
  }, [justSignedUp]);

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
              <p>Swipe your hand in the camera to switch models</p>
            </div>

            <div className="recognizer-camera-container relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="recognizer-video"
              ></video>
              <canvas 
                ref={canvasRef2} 
                style={{  position: 'absolute', top: 0, left: '5%', zIndex: 1  }}
              ></canvas>
              <canvas 
                ref={canvasRef1} 
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

            <button className="recognizer-control-button recognizer-test-button" onClick={() => setShowTest(true)}>Test Your Environment</button>

            <TestSetup
              isOpen={showTest}
              onClose={() => setShowTest(false)}
            />

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
              Need help? &nbsp; 
              <a 
                className="recognizer-support-link" 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=tmkdt.cos301@gmail.com&su=Support%20Request&body=Hi%20Support%20Team,%0D%0A%0D%0AI%20need%20help%20with%20..." 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                Contact Support
              </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
