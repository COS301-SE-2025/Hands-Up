import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLearningStats } from '../contexts/learningStatsContext';
import { useTranslator } from '../hooks/translateResults';
import { useLandmarksDetection } from '../hooks/landmarksDetection';
import { AngieSigns } from '../components/angieSigns';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const COMMON_PHRASES = [
    { id: 'hello_my_name', phrase: 'Hello My Name', words: ['helloMyName'] },
    { id: 'nice_meet_you', phrase: 'Nice To Meet You', words: ['niceToMeetYou'] },
    { id: 'i_love_you', phrase: 'I Love You', words: ['iLoveYou'] },
    { id: 'i_am_happy', phrase: 'I Am Happy', words: ['meHappy'] },
    { id: 'i_am_sad', phrase: 'I Am Sad', words: ['meSad'] },
    { id: 'see_you_tomorrow', phrase: 'See You Tomorrow', words: ['seeYouTomorrow'] },
    { id: 'i_am_hungry', phrase: 'I Am Hungry', words: ['meHungry'] },
    { id: 'drink_water', phrase: 'Drink Water', words: ['drinkWater'] },
    { id: 'my_mother', phrase: 'My Mother', words: ['myMother'] },
    { id: 'my_father', phrase: 'My Father', words: ['myFather'] },
    { id: 'brother_sister', phrase: 'My Brother and Sister', words: ['myBrotherAndSister'] },
    { id: 'go_sleep', phrase: 'Go To Sleep', words: ['goSleep'] },
    { id: 'i_understand', phrase: 'I Understand', words: ['meUnderstand'] },
    { id: 'hot_weather', phrase: 'Hot Weather', words: ['hotWeather'] },
    { id: 'cold_weather', phrase: 'Cold Weather', words: ['coldWeather'] },
    { id: 'eat_apple', phrase: 'Eat an Apple', words: ['eatApple'] },
    { id: 'my_pet_is_a_dog', phrase: 'My Pet Is A Dog', words: ['myPetDog'] }
];

const CATEGORIES = {
    alphabets: {
        name: 'The Alphabet',
        items: 'abcdefghijklmnopqrstuvwxyz'.split('')
    },
    numbers: {
        name: 'Numbers & Counting',
        items: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
    },
    colours: {
        name: 'Colours',
        items: ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Orange', 'Brown', 'Gold', 'Silver']
    },
    introduce: {
        name: 'Introduce Yourself',
        items: ['hello', 'name', 'my', 'again', 'goodbye', 'nice', 'meet', 'you', 'this', 'sorry', 'and']
    },
    family: {
        name: 'Family Members',
        items: ['brother', 'sister', 'mother', 'father', 'aunt', 'uncle', 'grandma', 'grandpa', 'child', 'siblings', 'boy', 'girl']
    },
    feelings: {
        name: 'Emotions & Feelings',
        items: ['happy', 'sad', 'angry', 'cry', 'sorry', 'like', 'love', 'hate', 'feel']
    },
    actions: {
        name: 'Common Actions',
        items: ['drive', 'watch', 'sleep', 'walk', 'stand', 'sit', 'give', 'understand', 'go', 'stay', 'talk']
    },
    questions: {
        name: 'Asking Questions',
        items: ['why', 'tell', 'when', 'who', 'which']
    },
    time: {
        name: 'Time & Days',
        items: ['today', 'tomorrow', 'yesterday', 'year', 'now', 'future', 'Oclock', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    food: {
        name: 'Food & Drinks',
        items: ['water', 'apple', 'drink', 'cereal', 'eggs', 'eat', 'hungry', 'full', 'cup', 'popcorn', 'candy', 'soup', 'juice', 'milk', 'pizza']
    },
    things: {
        name: 'Objects & Things',
        items: ['shower', 'table', 'lights', 'computer', 'hat', 'chair', 'car', 'ambulance', 'window']
    },
    animals: {
        name: 'Animals',
        items: ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'animal']
    },
    seasons: {
        name: 'Weather & Seasons',
        items: ['spring', 'summer', 'autumn', 'winter', 'sun', 'rain', 'cloudy', 'snow', 'wind', 'sunrise', 'hot', 'cold', 'warm', 'cool', 'weather', 'freeze']
    },
    phrases: {
        name: 'Common Phrases',
        items: COMMON_PHRASES
    }
};

async function getLandmarks(item) {
    try {
        const response = await fetch(`/landmarks/${item}.json`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error loading landmarks for ${item}:`, error);
        return [];
    }
}

export function SignQuiz() {
    const navigate = useNavigate();
    const { category } = useParams();
    const { updateStats, stats } = useLearningStats();

    // Animation-related states
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quizStarted, setQuizStarted] = useState(false);
    const [hasTrackedQuizStats, setHasTrackedQuizStats] = useState(false);
    const [landmarks, setLandmarks] = useState({});
    const [replayKey, setReplayKey] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    
    const [cameraQuizMode, setCameraQuizMode] = useState(false);
    const cameraVideoRef = useRef(null);
    const cameraCanvasRef1 = useRef(null);
    const cameraCanvasRef2 = useRef(null);
    
    const {
        videoRef: translatorVideoRef,
        canvasRef1: translatorCanvasRef1,
        canvasRef2: translatorCanvasRef2,
        result: translatorResult,
        confidence: translatorConfidence,
        recording: translatorRecording,
        startRecording: translatorStartRecording,
        setResult: setTranslatorResult,
    } = useTranslator();

    useLandmarksDetection(cameraQuizMode ? cameraVideoRef : null, cameraCanvasRef2);
    
    const timeoutRef = useRef(null);
    const currentCategoryData = CATEGORIES[category] || CATEGORIES['alphabets'];
    const isPhrasesQuiz = category === 'phrases';

    const generateQuizQuestions = useCallback(() => {
        let animationQuestions, cameraQuestions;
        
        if (isPhrasesQuiz) {
            const shuffledPhrases = [...COMMON_PHRASES].sort(() => Math.random() - 0.5);
            
            animationQuestions = shuffledPhrases.slice(0, 3).map((phrase, index) => ({
                id: index + 1,
                type: 'animation',
                item: phrase.id,
                phrase: phrase,
                correctAnswer: phrase.phrase,
                displayAnswer: phrase.phrase
            }));
            
            cameraQuestions = shuffledPhrases.slice(3, 5).map((phrase, index) => ({
                id: index + 4,
                type: 'camera',
                item: phrase.id,
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

    const setupCameraForQuiz = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            
            if (cameraVideoRef.current) {
                cameraVideoRef.current.srcObject = stream;
            }
            
            if (translatorVideoRef.current) {
                translatorVideoRef.current.srcObject = stream;
            }
            
            setCameraQuizMode(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Camera access required for camera-based questions. Please allow camera access.');
        }
    }, [translatorVideoRef]);

    const stopCameraForQuiz = useCallback(() => {
        if (cameraVideoRef.current && cameraVideoRef.current.srcObject) {
            const stream = cameraVideoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            cameraVideoRef.current.srcObject = null;
        }
        
        if (translatorVideoRef.current && translatorVideoRef.current.srcObject) {
            const stream = translatorVideoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            translatorVideoRef.current.srcObject = null;
        }
        
        setCameraQuizMode(false);
    }, [translatorVideoRef]);

    const loadCurrentQuestionLandmarks = useCallback(async (question) => {
        try {
            if (isPhrasesQuiz && question.phrase) {
                const firstWord = question.phrase.words[0];
                const data = await getLandmarks(firstWord);
                setLandmarks(data);
                setReplayKey(prev => prev + 1);
            } else {
                const data = await getLandmarks(question.item);
                setLandmarks(data);
                setReplayKey(prev => prev + 1);
            }
        } catch (error) {
            console.error('Failed to load landmarks:', error);
            setLandmarks({});
        }
    }, [isPhrasesQuiz]);

    const startPhraseAutoPlay = useCallback((phrase) => {
        if (!phrase || isAutoPlaying) return;

        setIsAutoPlaying(true);

        let index = 0;
        const playNext = async () => {
            if (index < phrase.words.length) {
                try {
                    const data = await getLandmarks(phrase.words[index]);
                    setLandmarks(data);
                    setReplayKey(prev => prev + 1);
                } 
                catch (error) {
                    console.error('Failed to load landmarks for word:', phrase.words[index], error);
                }

                index++;

                if (index < phrase.words.length) {
                    timeoutRef.current = setTimeout(playNext, 3000);
                } else {
                    setIsAutoPlaying(false);
                }
            }
        };

        timeoutRef.current = setTimeout(playNext, 500);
    }, [isAutoPlaying]);

    const handleReplay = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (isPhrasesQuiz && quizQuestions[currentQuestionIndex]?.phrase) {
            startPhraseAutoPlay(quizQuestions[currentQuestionIndex].phrase);
        } else {
            setReplayKey(prev => prev + 1);
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
                stopCameraForQuiz();
                loadCurrentQuestionLandmarks(currentQuestion);
            } else if (currentQuestion.type === 'camera') {
                setupCameraForQuiz();
                setTranslatorResult("Awaiting sign capture...");
            }
        }
    }, [quizStarted, currentQuestionIndex, quizQuestions, loadCurrentQuestionLandmarks, setupCameraForQuiz, stopCameraForQuiz, setTranslatorResult]);

    useEffect(() => {
        if (isPhrasesQuiz && quizStarted && quizQuestions[currentQuestionIndex]?.phrase && 
            quizQuestions[currentQuestionIndex]?.type === 'animation' && 
            landmarks && Object.keys(landmarks).length > 0) {
            const timer = setTimeout(() => {
                startPhraseAutoPlay(quizQuestions[currentQuestionIndex].phrase);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isPhrasesQuiz, quizStarted, currentQuestionIndex, quizQuestions, landmarks, startPhraseAutoPlay]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            stopCameraForQuiz();
        };
    }, [stopCameraForQuiz]);

    const startQuiz = () => {
        setQuizStarted(true);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setCurrentAnswer('');
        setShowResults(false);
        setScore(0);
        setHasTrackedQuizStats(false);
        setTranslatorResult("Awaiting sign capture...");
    };

    const handleAnswerSubmit = (answer = null) => {
        const currentQuestion = quizQuestions[currentQuestionIndex];
        const answerToCheck = answer || currentAnswer;
        
        if (!answerToCheck.trim()) return;

        const isCorrect = answerToCheck.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase();

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
        setTranslatorResult("Awaiting sign capture...");

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsAutoPlaying(false);
        stopCameraForQuiz();

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
        let cleanResult = translatorResult
            .replace('Detected: ', '')
            .replace('Detected phrase: ', '')
            .replace('API Result: ', '')
            .trim();
            
        if (cleanResult && cleanResult !== "Awaiting sign capture...") {
            handleAnswerSubmit(cleanResult);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAnswerSubmit();
        }
    };

    const restartQuiz = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsAutoPlaying(false);
        setHasTrackedQuizStats(false);
        stopCameraForQuiz();
        const questions = generateQuizQuestions();
        setQuizQuestions(questions);
        startQuiz();
    };

    const goBackToCategory = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        stopCameraForQuiz();
        navigate('/learn', { state: { selectedCategory: category } });
    };

    const goBackToLearn = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        stopCameraForQuiz();
        navigate('/learn');
    };

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif'
    };

    const backButtonStyle = {
        position: 'absolute',
        top: '20px',
        left: '20px',
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px'
    };

    const quizCardStyle = {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
    };

    const startButtonStyle = {
        padding: '15px 30px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '20px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease'
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <h1 style={{ color: '#333' }}>Loading {currentCategoryData.name} Quiz...</h1>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div style={containerStyle}>
                <button onClick={goBackToCategory} style={backButtonStyle}>
                    Back to {currentCategoryData.name}
                </button>

                <div style={quizCardStyle}>
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>
                        {currentCategoryData.name} QUIZ
                    </h2>
                    <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
                        This quiz has 5 questions:
                        <br />
                        <strong>3 questions:</strong> Watch animations and type answers
                        <br />
                        <strong>2 questions:</strong> Sign with your camera
                        <br />
                        <small style={{ color: '#888' }}>
                            {isPhrasesQuiz ? 
                                "Watch phrase animations or sign phrases yourself!" :
                                "Identify signs or sign them yourself!"
                            }
                        </small>
                    </p>

                    <button
                        onClick={startQuiz}
                        style={startButtonStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#218838';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#28a745';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Start Hybrid Quiz!
                    </button>
                </div>
            </div>
        );
    }

    if (showResults) {
        const percentage = Math.round((score / quizQuestions.length) * 100);
        const passed = percentage >= 60;

        const resultCardStyle = {
            ...quizCardStyle,
            maxWidth: '700px',
            width: '100%'
        };

        const correctAnswerStyle = {
            padding: '12px',
            margin: '8px 0',
            backgroundColor: '#d4edda',
            borderRadius: '8px',
            border: '2px solid #c3e6cb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        };

        const incorrectAnswerStyle = {
            ...correctAnswerStyle,
            backgroundColor: '#f8d7da',
            border: '2px solid #f5c6cb'
        };

        return (
            <div style={containerStyle}>
                <div style={resultCardStyle}>
                    <h1 style={{ 
                        color: passed ? '#28a745' : '#dc3545', 
                        marginBottom: '20px',
                        fontSize: '2.5em'
                    }}>
                        {passed ? 'Great Job!' : 'Keep Learning!'}
                    </h1>

                    <h2 style={{ color: '#333', marginBottom: '20px' }}>
                        {currentCategoryData.name} Hybrid Quiz Results
                    </h2>

                    <div style={{
                        fontSize: '24px',
                        color: '#333',
                        marginBottom: '30px',
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px'
                    }}>
                        <p><strong>Total Score: {score}/{quizQuestions.length} ({percentage}%)</strong></p>
                        <p style={{ fontSize: '16px', color: '#666', marginTop: '10px' }}>
                            Animation Questions: {userAnswers.filter(a => a.type === 'animation' && a.isCorrect).length}/3
                            <br />
                            Camera Questions: {userAnswers.filter(a => a.type === 'camera' && a.isCorrect).length}/2
                        </p>
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                        <h3 style={{ color: '#333', marginBottom: '15px' }}>Questions You Got Correct:</h3>
                        {userAnswers.filter(answer => answer.isCorrect).length > 0 ? (
                            <div style={{ marginBottom: '20px' }}>
                                {userAnswers.filter(answer => answer.isCorrect).map((answer, index) => (
                                    <div key={index} style={correctAnswerStyle}>
                                        <div>
                                            <strong>Question {userAnswers.indexOf(answer) + 1}: {answer.correctAnswer}</strong>
                                            <br />
                                            <span style={{ color: '#155724', fontSize: '14px' }}>
                                                Your answer: {answer.userAnswer} ({answer.type === 'camera' ? 'Camera' : 'Animation'})
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '24px', color: '#155724', fontWeight: 'bold' }}>
                                            ✓
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>No correct answers this time.</p>
                        )}

                        {userAnswers.filter(answer => !answer.isCorrect).length > 0 && (
                            <>
                                <h3 style={{ color: '#333', marginBottom: '15px' }}>Questions You Got Wrong:</h3>
                                {userAnswers.filter(answer => !answer.isCorrect).map((answer, index) => (
                                    <div key={index} style={incorrectAnswerStyle}>
                                        <div>
                                            <strong>Question {userAnswers.indexOf(answer) + 1}: {answer.correctAnswer}</strong>
                                            <br />
                                            <span style={{ color: '#721c24', fontSize: '14px' }}>
                                                Your answer: {answer.userAnswer} ({answer.type === 'camera' ? 'Camera' : 'Animation'})
                                            </span>
                                            <br />
                                            <span style={{ color: '#155724', fontSize: '14px' }}>
                                                Correct answer: {answer.correctAnswer}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '24px', color: '#721c24', fontWeight: 'bold' }}>
                                            ✗
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={restartQuiz}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Try Again
                        </button>

                        <button
                            onClick={goBackToCategory}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#ffc107',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Back to {currentCategoryData.name}
                        </button>

                        <button
                            onClick={goBackToLearn}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
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

    const quizContainerStyle = {
        ...containerStyle,
        justifyContent: 'flex-start'
    };

    const canvasContainerStyle = {
        width: '640px',
        height: '480px',
        maxWidth: '90%',
        border: '2px solid #ddd',
        borderRadius: '15px',
        backgroundColor: '#fff',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        marginBottom: '20px',
        overflow: 'hidden',
        position: 'relative'
    };

    const progressBarStyle = {
        backgroundColor: '#e9ecef',
        borderRadius: '10px',
        padding: '5px',
        width: '300px',
        margin: '0 auto'
    };

    const replayButtonStyle = {
        padding: '8px 16px',
        backgroundColor: isAutoPlaying ? '#ccc' : '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: isAutoPlaying ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '20px',
        transition: 'all 0.3s ease'
    };

    const cleanTranslatorResult = translatorResult
        .replace('Detected: ', '')
        .replace('Detected phrase: ', '')
        .replace('API Result: ', '')
        .trim();
    
    const hasValidCameraResult = cleanTranslatorResult && cleanTranslatorResult !== "Awaiting sign capture...";

    return (
        <div style={quizContainerStyle}>
            <button onClick={goBackToCategory} style={backButtonStyle}>
                Back to {currentCategoryData.name}
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '40px' }}>
                <h1 style={{ color: '#333', marginBottom: '5px' }}>
                    {currentCategoryData.name} Hybrid Quiz
                </h1>
                <p style={{ color: '#666', marginBottom: '10px' }}>
                    Question {currentQuestionIndex + 1} of {quizQuestions.length} 
                    ({isAnimationQuestion ? 'Watch & Type' : 'Sign with Camera'})
                </p>
                {isPhrasesQuiz && isAutoPlaying && (
                    <p style={{ color: '#4caf50', fontSize: '14px', fontWeight: 'bold' }}>
                        Auto-playing phrase...
                    </p>
                )}
                <div style={progressBarStyle}>
                    <div style={{
                        backgroundColor: '#28a745',
                        height: '20px',
                        borderRadius: '8px',
                        width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`,
                        transition: 'width 0.3s ease'
                    }}></div>
                </div>
            </div>

            {isAnimationQuestion && (
                <>
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>
                        {isPhrasesQuiz ? 'What phrase is being signed?' : 'What is this sign?'}
                    </h2>

                    <div style={canvasContainerStyle}>
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

                    <button
                        onClick={handleReplay}
                        disabled={isAutoPlaying}
                        style={replayButtonStyle}
                        onMouseEnter={(e) => {
                            if (!isAutoPlaying) {
                                e.currentTarget.style.backgroundColor = '#138496';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isAutoPlaying) {
                                e.currentTarget.style.backgroundColor = '#17a2b8';
                            }
                        }}
                    >
                        {isPhrasesQuiz ? 
                            (isAutoPlaying ? 'Playing Phrase...' : 'Replay Phrase') : 
                            'Replay'
                        }
                    </button>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <input
                            type="text"
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your answer..."
                            style={{
                                padding: '15px',
                                fontSize: '18px',
                                textAlign: 'center',
                                border: '2px solid #ddd',
                                borderRadius: '10px',
                                width: '200px',
                                textTransform: category === 'alphabets' ? 'uppercase' : 'none'
                            }}
                            autoFocus
                        />

                        <button
                            onClick={() => handleAnswerSubmit()}
                            disabled={!currentAnswer.trim()}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: currentAnswer.trim() ? '#28a745' : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: currentAnswer.trim() ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Submit Answer
                        </button>
                    </div>
                </>
            )}

            {isCameraQuestion && (
                <>
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>
                        Sign: "{currentQuestion.correctAnswer}"
                    </h2>

                    <div style={canvasContainerStyle}>
                        <video 
                            ref={translatorVideoRef}
                            autoPlay 
                            playsInline 
                            muted
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                            }}
                        />
                        <canvas 
                            ref={translatorCanvasRef2} 
                            style={{  
                                position: 'absolute', 
                                top: 0, 
                                left: '15%', 
                                zIndex: 1,
                                pointerEvents: 'none'
                            }}
                        />
                        <canvas 
                            ref={translatorCanvasRef1} 
                            style={{ display: 'none' }}
                        />
                        
                        {translatorRecording && (
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: 'red',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'pulse 1s infinite'
                                }}></div>
                                Recording...
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px',
                        marginBottom: '20px'
                    }}>
                        {!translatorRecording && !hasValidCameraResult && (
                            <button
                                onClick={translatorStartRecording}
                                style={{
                                    padding: '15px 30px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#c82333';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#dc3545';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Start Signing
                            </button>
                        )}

                        {translatorRecording && (
                            <button
                                onClick={translatorStartRecording}
                                style={{
                                    padding: '15px 30px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Stop Signing
                            </button>
                        )}

                        {hasValidCameraResult && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div style={{
                                    padding: '15px 30px',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    borderRadius: '10px',
                                    fontSize: '18px',
                                    fontWeight: 'bold'
                                }}>
                                    Detected: "{cleanTranslatorResult}"
                                </div>
                                
                                <div style={{ 
                                    fontSize: '14px', 
                                    color: '#666',
                                    marginBottom: '10px'
                                }}>
                                    Confidence: {translatorConfidence}
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={handleCameraAnswerSubmit}
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Submit This Answer
                                    </button>
                                    
                                    <button
                                        onClick={translatorStartRecording}
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
                            <strong>Instructions:</strong> Position your hands clearly in the camera frame and sign "{currentQuestion.correctAnswer}".
                            <br />
                            Click "Start Signing" when ready, then perform the sign and hold it steady for recognition.
                        </p>
                    </div>
                </>
            )}

            <div style={{
                marginTop: '30px',
                color: '#666',
                textAlign: 'center'
            }}>
                <p>Current Score: {score}/{quizQuestions.length}</p>
                <p style={{ fontSize: '14px' }}>
                    Question Type: {isAnimationQuestion ? 'Watch and Type' : 'Sign with Camera'}
                    {isCameraQuestion && (
                        <><br />Target: {currentQuestion.correctAnswer}</>
                    )}
                </p>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}