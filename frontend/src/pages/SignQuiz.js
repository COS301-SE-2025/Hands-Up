import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLearningStats } from '../contexts/learningStatsContext';
import { useTranslator } from '../hooks/translateResults';
import { useLandmarksDetection } from '../hooks/landmarksDetection';
import { AngieSigns } from '../components/angieSigns';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { getLandmarks } from '../utils/apiCalls';
import { COMMON_PHRASES, CATEGORIES } from '../components/quizData';
import '../styles/signQuiz.css';

export function SignQuiz() {
    const navigate = useNavigate();
    const { category } = useParams();
    const { updateStats, stats } = useLearningStats();

    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quizStarted, setQuizStarted] = useState(false);
    const [hasTrackedQuizStats, setHasTrackedQuizStats] = useState(false);

    const [landmarks, setLandmarks] = useState([]);
    const [replayKey, setReplayKey] = useState(0);
    
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [recordingTimeout, setRecordingTimeout] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [cameraInitializing, setCameraInitializing] = useState(false);
    
    const {
        videoRef,
        canvasRef1,
        canvasRef2,
        result,
        confidence,
        recording,
        startRecording,
        setResult,
    } = useTranslator({
        detectionScope: category
    });

    const shouldUseLandmarksDetection = cameraReady && 
                                       quizStarted && 
                                       quizQuestions[currentQuestionIndex]?.type === 'camera';
    
    const dummyVideoRef = useRef(null);
    
    useLandmarksDetection(
        shouldUseLandmarksDetection ? videoRef : dummyVideoRef, 
        canvasRef2
    );
    
    const currentCategoryData = CATEGORIES[category] || CATEGORIES['alphabets'];
    const isPhrasesQuiz = category === 'phrases';

    const generateQuizQuestions = useCallback(() => {
        let animationQuestions, cameraQuestions;
        
        if (isPhrasesQuiz) {
            const shuffledPhrases = [...COMMON_PHRASES].sort(() => Math.random() - 0.5);
            
            animationQuestions = shuffledPhrases.slice(0, 3).map((phrase, index) => ({
                id: index + 1,
                type: 'animation',
                item: phrase.words[0],
                phrase: phrase,
                correctAnswer: phrase.phrase,
                displayAnswer: phrase.phrase
            }));
            
            cameraQuestions = shuffledPhrases.slice(3, 5).map((phrase, index) => ({
                id: index + 4,
                type: 'camera',
                item: phrase.words[0],
                phrase: phrase,
                correctAnswer: phrase.phrase,
                displayAnswer: phrase.phrase
            }));
        } else {
            const availableItems = currentCategoryData.items;
            const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
            
            animationQuestions = shuffled.slice(0, 3).map((item, index) => ({
                id: index + 1,
                type: 'animation',
                item: item.toLowerCase(),
                correctAnswer: item,
                displayAnswer: item
            }));
            
            cameraQuestions = shuffled.slice(3, 5).map((item, index) => ({
                id: index + 4,
                type: 'camera',
                item: item.toLowerCase(),
                correctAnswer: item,
                displayAnswer: item
            }));
        }
        
        return [...animationQuestions, ...cameraQuestions].sort(() => Math.random() - 0.5);
    }, [currentCategoryData, isPhrasesQuiz]);

     const setupCamera = useCallback(async () => {
        try {
            setCameraError(null);
            setCameraInitializing(true);
            console.log('Setting up camera...');
            
             const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                
                return new Promise((resolve) => {
                    videoRef.current.onloadedmetadata = () => {
                        console.log('Video metadata loaded');
                        setCameraReady(true);
                        setCameraInitializing(false);
                        resolve(true);
                    };
                    
                    videoRef.current.oncanplay = () => {
                        console.log('Video can play');
                        videoRef.current.play().catch(console.error);
                    };
                    
                    setTimeout(() => {
                        if (!cameraReady) {
                            console.log('Camera initialization timeout');
                            setCameraInitializing(false);
                            resolve(false);
                        }
                    }, 5000);
                });
            }
            
        } catch (error) {
            console.error('Camera setup error:', error);
            setCameraError(error.message);
            setCameraReady(false);
            setCameraInitializing(false);
            
            let errorMessage = 'Camera access failed. ';
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please allow camera access and try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found on your device.';
            } else {
                errorMessage += 'Please check your camera settings.';
            }
            
            alert(errorMessage);
            return false;
        }
    }, [videoRef, cameraReady]);

    const stopCamera = useCallback(() => {
        console.log('Stopping camera...');
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
            videoRef.current.srcObject = null;
        }
        setCameraReady(false);
        setCameraError(null);
        setCameraInitializing(false);
    }, [videoRef]);

    const loadAnimationLandmarks = useCallback(async (question) => {
        try {
            console.log('Loading animation for item:', question.item);
            const data = await getLandmarks(question.item);
            
            if (!data || data.length === 0) {
                console.warn('No landmarks found for:', question.item);
                setLandmarks([]);
            } else {
                setLandmarks(data);
            }
            setReplayKey(prev => prev + 1);
        } catch (error) {
            console.error('Failed to load landmarks:', error);
            setLandmarks([]);
        }
    }, []);

    const handleStartRecording = useCallback(async () => {
       if (!cameraReady) {
            const success = await setupCamera();
            if (!success) return;
        }
        
       if (recordingTimeout) {
            clearTimeout(recordingTimeout);
        }

        if (recording) {
           startRecording();
            setRecordingTimeout(null);
            setCountdown(0);
        } else {
            console.log(`Starting recording for ${category} category`);
            startRecording();
            setCountdown(5);
            
            const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            const timeout = setTimeout(() => {
                console.log('Auto-stopping recording after 5 seconds');
                if (recording) {
                    startRecording(); 
                }
                clearInterval(countdownInterval);
                setRecordingTimeout(null);
                setCountdown(0);
            }, 5000);

            setRecordingTimeout(timeout);
        }
    }, [recording, startRecording, recordingTimeout, category, cameraReady, setupCamera]);

    const handleTryAgain = useCallback(() => {
        setResult("");
        if (recordingTimeout) {
            clearTimeout(recordingTimeout);
            setRecordingTimeout(null);
        }
        setCountdown(0);
        
        if (recording) {
            startRecording();
        }
    }, [recording, startRecording, recordingTimeout, setResult]);

    const handleReplay = () => {
        setReplayKey(prev => prev + 1);
    };

    const skipQuestion = () => {
        const currentQuestion = quizQuestions[currentQuestionIndex];
        
        const skippedAnswer = {
            questionId: currentQuestion.id,
            userAnswer: 'SKIPPED',
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect: false,
            questionItem: isPhrasesQuiz ? currentQuestion.phrase.phrase : currentQuestion.item,
            type: currentQuestion.type,
            skipped: true
        };

        const newUserAnswers = [...userAnswers, skippedAnswer];
        setUserAnswers(newUserAnswers);

        setCurrentAnswer('');
        setResult("");
        stopCamera();

        if (currentQuestionIndex + 1 < quizQuestions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setShowResults(true);
            const finalScore = newUserAnswers.filter(answer => answer.isCorrect).length;

            if (!hasTrackedQuizStats) {
                updateStats({
                    quizzesCompleted: (stats?.quizzesCompleted || 0) + 1,
                    quizScore: finalScore,
                    totalQuizQuestions: (stats?.totalQuizQuestions || 0) + quizQuestions.length,
                    [`${category}QuizCompleted`]: true
                });
                setHasTrackedQuizStats(true);
            }
        }
    };

    useEffect(() => {
        const questions = generateQuizQuestions();
        setQuizQuestions(questions);
        setLoading(false);
    }, [generateQuizQuestions]);

    useEffect(() => {
        if (quizStarted && quizQuestions.length > 0 && currentQuestionIndex < quizQuestions.length) {
            const currentQuestion = quizQuestions[currentQuestionIndex];
            
            if (currentQuestion.type === 'animation') {
                stopCamera();
                loadAnimationLandmarks(currentQuestion);
            } else if (currentQuestion.type === 'camera') {
            }
        }
    }, [quizStarted, currentQuestionIndex, quizQuestions, loadAnimationLandmarks, stopCamera, setResult]);

    useEffect(() => {
        return () => {
            console.log('Cleaning up SignQuiz component...');
            stopCamera();
            if (recordingTimeout) {
                clearTimeout(recordingTimeout);
            }
        };
    }, [stopCamera, recordingTimeout]);

    const startQuiz = () => {
        setQuizStarted(true);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setCurrentAnswer('');
        setShowResults(false);
        setScore(0);
        setHasTrackedQuizStats(false);
    };

    const handleAnswerSubmit = (answer = null) => {
        const currentQuestion = quizQuestions[currentQuestionIndex];
        const answerToCheck = answer || currentAnswer;
        
        if (!answerToCheck.trim()) return;

        let isCorrect;
        if (category === 'alphabets') {
           isCorrect = answerToCheck.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase();
        } else if (isPhrasesQuiz) {
            const userWords = answerToCheck.toLowerCase().trim().split(/\s+/);
            const correctWords = currentQuestion.correctAnswer.toLowerCase().trim().split(/\s+/);
            const matchCount = userWords.filter(word => correctWords.includes(word)).length;
            isCorrect = matchCount >= Math.ceil(correctWords.length * 0.7);
        } else {
            isCorrect = answerToCheck.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase();
        }

        const newAnswer = {
            questionId: currentQuestion.id,
            userAnswer: answerToCheck.trim(),
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect,
            questionItem: isPhrasesQuiz ? currentQuestion.phrase.phrase : currentQuestion.item,
            type: currentQuestion.type
        };

        const newUserAnswers = [...userAnswers, newAnswer];
        setUserAnswers(newUserAnswers);

        if (isCorrect) {
            setScore(score + 1);
        }

        setCurrentAnswer('');
        stopCamera();

        if (currentQuestionIndex + 1 < quizQuestions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setShowResults(true);
            const finalScore = newUserAnswers.filter(answer => answer.isCorrect).length;

            if (!hasTrackedQuizStats) {
                updateStats({
                    quizzesCompleted: (stats?.quizzesCompleted || 0) + 1,
                    quizScore: finalScore,
                    totalQuizQuestions: (stats?.totalQuizQuestions || 0) + quizQuestions.length,
                    [`${category}QuizCompleted`]: true
                });
                setHasTrackedQuizStats(true);
            }
        }
    };

    const handleCameraAnswerSubmit = () => {
        let cleanResult = result
            .replace('Detected: ', '')
            .replace('Detected phrase: ', '')
            .replace('API Result: ', '')
            .trim();
            
        console.log(`Camera result for ${category}:`, cleanResult);
        
        if (cleanResult && cleanResult !== "" && cleanResult !== "") {
            handleAnswerSubmit(cleanResult);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAnswerSubmit();
        }
    };

    const restartQuiz = () => {
        setHasTrackedQuizStats(false);
        stopCamera();
        const questions = generateQuizQuestions();
        setQuizQuestions(questions);
        startQuiz();
    };

    const goBackToCategory = () => {
        stopCamera();
        navigate('/learn', { state: { selectedCategory: category } });
    };

    const goBackToLearn = () => {
        stopCamera();
        navigate('/learn');
    };

    if (loading) {
        return (
            <div className="quizcontainer">
                <h1 className="loading-text">Loading {currentCategoryData.name} Quiz...</h1>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div className="quizcontainer">
                <button onClick={goBackToCategory} className="quizback-button">
                    ← Back to {currentCategoryData.name}
                </button>

                <div className="quiz-card">
                    <h2 className="quiz-title">
                        {currentCategoryData.name} QUIZ
                    </h2>
                    <p className="quiz-description">
                        This quiz has 5 questions:
                        <br />
                        <strong>3 questions:</strong> Watch animations and type answers
                        <br />
                        <strong>2 questions:</strong> Sign with your camera
                        <br />
                        <small className="quiz-subtitle">
                            {isPhrasesQuiz ? 
                                "Watch phrase animations or sign phrases yourself!" :
                                `Test your knowledge of ${currentCategoryData.name.toLowerCase()} signs!`
                            }
                        </small>
                    </p>

                    <button onClick={startQuiz} className="start-button">
                        Start Quiz!
                    </button>
                </div>
            </div>
        );
    }

    if (showResults) {
        const percentage = Math.round((score / quizQuestions.length) * 100);
        const passed = percentage >= 60;

        return (
            <div className="quizcontainer">
                <div className="result-card">
                    <h1 className={`result-title ${passed ? 'passed' : 'failed'}`}>
                        {passed ? 'Great Job!' : 'Keep Learning!'}
                    </h1>

                    <h2 className="category-title">
                        {currentCategoryData.name} Quiz Results
                    </h2>

                    <div className="score-summary">
                        <p><strong>Total Score: {score}/{quizQuestions.length} ({percentage}%)</strong></p>
                        <p className="score-breakdown">
                            Animation Questions: {userAnswers.filter(a => a.type === 'animation' && a.isCorrect).length}/3
                            <br />
                            Camera Questions: {userAnswers.filter(a => a.type === 'camera' && a.isCorrect).length}/2
                        </p>
                    </div>

                    <div className="answers-section">
                        <h3 className="section-title">Questions You Got Correct:</h3>
                        {userAnswers.filter(answer => answer.isCorrect).length > 0 ? (
                            <div className="answers-list">
                                {userAnswers.filter(answer => answer.isCorrect).map((answer, index) => (
                                    <div key={index} className="answer-item correct">
                                        <div>
                                            <strong>Question {userAnswers.indexOf(answer) + 1}: {answer.correctAnswer}</strong>
                                            <br />
                                            <span className="answer-details">
                                                Your answer: {answer.userAnswer} ({answer.type === 'camera' ? 'Camera' : 'Animation'})
                                            </span>
                                        </div>
                                        <div className="check-mark">✓</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-answers">No correct answers this time.</p>
                        )}

                        {userAnswers.filter(answer => !answer.isCorrect).length > 0 && (
                            <>
                                <h3 className="section-title">Questions You Got Wrong:</h3>
                                {userAnswers.filter(answer => !answer.isCorrect).map((answer, index) => (
                                    <div key={index} className="answer-item incorrect">
                                        <div>
                                            <strong>Question {userAnswers.indexOf(answer) + 1}: {answer.correctAnswer}</strong>
                                            <br />
                                            <span className="answer-details wrong">
                                                Your answer: {answer.skipped ? 'SKIPPED' : answer.userAnswer} ({answer.type === 'camera' ? 'Camera' : 'Animation'})
                                            </span>
                                            <br />
                                            <span className="answer-details correct-answer">
                                                Correct answer: {answer.correctAnswer}
                                            </span>
                                        </div>
                                        <div className="x-mark">✗</div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="result-buttons">
                        <button onClick={restartQuiz} className="button primary">
                            Try Again
                        </button>
                        <button onClick={goBackToCategory} className="button secondary">
                            Back to {currentCategoryData.name}
                        </button>
                        <button onClick={goBackToLearn} className="button tertiary">
                            Back to Learn
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isAnimationQuestion = currentQuestion?.type === 'animation';
    const isCameraQuestion = currentQuestion?.type === 'camera';

    const cleanResult = result
        .replace('Detected: ', '')
        .replace('Detected phrase: ', '')
        .replace('API Result: ', '')
        .trim();
    
    const hasValidCameraResult = cleanResult && cleanResult !== "Click 'Start Signing' to begin" && cleanResult !== "";

    return (
        <div className="quiz-container">
            <button onClick={goBackToCategory} className="quizback-button">
                ← Back to {currentCategoryData.name}
            </button>

            <div className="quiz-header">
                <h1 className="quiz-title-active">
                    {currentCategoryData.name} Quiz
                </h1>
                <p className="question-info">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length} 
                    ({isAnimationQuestion ? 'Watch & Type' : 'Sign with Camera'})
                </p>
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {isAnimationQuestion && (
                <div className="animation-section">
                    <h2 className="question-title">
                        {isPhrasesQuiz ? 'What phrase is being signed?' : 'What is this sign?'}
                    </h2>

                    <div className="canvas-container">
                        <Canvas camera={{ position: [0, 0.2, 3], fov: 30 }}>
                            <ambientLight intensity={5} />
                            <group position={[0, -1.1, 0]}>             
                                {landmarks && Object.keys(landmarks).length > 0 && (
                                    <AngieSigns key={replayKey} landmarks={landmarks} />
                                )}
                            </group>  
                            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={2} maxDistance={3} />
                        </Canvas>
                    </div>

                    <button onClick={handleReplay} className="replay-button">
                        Replay Animation
                    </button>

                    <div className="answer-input-section">
                        <input
                            type="text"
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your answer..."
                            className="answer-input"
                            style={{
                                textTransform: category === 'alphabets' ? 'uppercase' : 'none'
                            }}
                            autoFocus
                        />

                        <div className="button-row">
                            <button
                                onClick={() => handleAnswerSubmit()}
                                disabled={!currentAnswer.trim()}
                                className={`button primary ${!currentAnswer.trim() ? 'disabled' : ''}`}
                            >
                                Submit Answer
                            </button>
                            <button onClick={skipQuestion} className="button skip">
                                Skip Question →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCameraQuestion && (
                <div className="camera-section">
                    <h2 className="question-title">
                        Sign: "{currentQuestion.correctAnswer}"
                    </h2>

                    <div className="camera-container">
                        <video 
                            ref={videoRef}
                            autoPlay 
                            playsInline 
                            muted
                            className="video-feed"
                            style={{ display: cameraReady ? 'block' : 'none' }}
                        />
                        
                        {cameraInitializing && (
                            <div className="camera-status-overlay">
                                <div className="camera-status-text">
                                    Initializing camera for {category} detection...
                                </div>
                            </div>
                        )}
                        
                        {cameraError && (
                            <div className="camera-status-overlay error">
                                <div className="camera-status-text">
                                Camera Error: {cameraError}
                                <br />
                                <button 
                                    onClick={setupCamera}
                                    className="button secondary"
                                    style={{ marginTop: '10px' }}
                                >
                                    Try Again
                                </button>
                                </div>
                            </div>
                        )}
                        
                        <canvas 
                            ref={canvasRef2} 
                            className="landmarks-overlay"
                            style={{ display: cameraReady ? 'block' : 'none' }}
                        />
                        <canvas 
                            ref={canvasRef1} 
                            style={{ display: 'none' }}
                        />
                        
                        {recording && cameraReady && (
                            <div className="recording-indicator">
                                <div className="recording-dot"></div>
                                Recording... {countdown > 0 && `(${countdown}s)`}
                            </div>
                        )}
                    </div>

                    <div className="camera-controls">
                        {cameraReady ? (
                            <>
                                {!hasValidCameraResult && (
                            <button
                                onClick={handleStartRecording}
                                className={`button ${recording ? 'stop' : 'record'}`}
                            >
                                {recording ? 'Stop Signing' : 'Start Signing'}
                            </button>
                        )}

                        {hasValidCameraResult && (
                            <div className="result-section">
                                <div className="detection-result">
                                    Detected: "{cleanResult}"
                                </div>
                                
                                <div className="confidence-score">
                                    Confidence: {confidence}
                                </div>
                                
                                <div className="button-row">
                                    <button
                                        onClick={handleCameraAnswerSubmit}
                                        className="button primary"
                                    >
                                        ✓ Submit This Answer
                                    </button>
                                    <button
                                        onClick={handleTryAgain}
                                        className="button secondary"
                                    >
                                      Try Again
                                    </button>
                                    <button onClick={skipQuestion} className="button skip">
                                        Skip Question →
                                    </button>
                                </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="camera-setup-prompt">
                                {!cameraError && !cameraInitializing && (
                                    <button onClick={setupCamera} className="button primary">
                                        Initialize Camera
                                    </button>
                                )}
                            </div>
                        )}

                        {cameraReady && !hasValidCameraResult && !recording && (
                            <button onClick={skipQuestion} className="button skip">
                                Skip Question →
                            </button>
                        )}
                    </div>

                    <div className="instructions">
                        <p>
                            <strong>Instructions:</strong> Position your hands clearly in the camera frame and sign "{currentQuestion.correctAnswer}".
                            <br />
                            The recording will automatically stop after 5 seconds, or click "Stop Signing" to end early.
                            <br />
                            <small>Detection scope: {currentCategoryData.name}</small>
                        </p>
                    </div>
                </div>
            )}

            <div className="quiz-footer">
                <p>Current Score: {score}/{quizQuestions.length}</p>
                <p className="question-type-info">
                    Question Type: {isAnimationQuestion ? 'Watch and Type' : 'Sign with Camera'}
                    {isCameraQuestion && (
                        <><br />Target: {currentQuestion.correctAnswer} | Category: {category}</>
                    )}
                </p>
            </div>
        </div>
    );
}