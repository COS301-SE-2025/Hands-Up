import React, { useState,useMemo, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AngieSigns } from './angieSigns';
import { getLandmarks } from '../utils/apiCalls';
import '../styles/learn.css';
import PropTypes from 'prop-types';

const PlacementTest = ({ onComplete, onSkip, onClose }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [landmarks, setLandmarks] = useState({});
    const [replayKey, setReplayKey] = useState(0);
    const [loading, setLoading] = useState(false);

    const placementQuestions  = useMemo(() => [ 
        {
            id: 'basic_alphabet_1',
            level: 'basic',
            question: 'What letter does this sign represent?',
            sign: 'A',
            options: ['A', 'B', 'C', 'D'],
            correct: 'A',
            category: 'alphabets'
        },
        {
            id: 'basic_alphabet_2',
            level: 'basic',
            question: 'What letter does this sign represent?',
            sign: 'B',
            options: ['A', 'B', 'C', 'D'],
            correct: 'B',
            category: 'alphabets'
        },
        {
            id: 'numbers_1',
            level: 'basic',
            question: 'What number does this sign represent?',
            sign: '1',
            options: ['1', '2', '3', '4'],
            correct: '1',
            category: 'numbers'
        },
        {
            id: 'numbers_2',
            level: 'basic',
            question: 'What number does this sign represent?',
            sign: '5',
            options: ['3', '4', '5', '6'],
            correct: '5',
            category: 'numbers'
        },
        {
            id: 'common_words_1',
            level: 'intermediate',
            question: 'What does this sign mean?',
            sign: 'hello',
            options: ['Hello', 'Goodbye', 'Please', 'Thank you'],
            correct: 'Hello',
            category: 'introduce'
        },
        {
            id: 'common_words_2',
            level: 'intermediate',
            question: 'What does this sign mean?',
            sign: 'mother',
            options: ['Father', 'Mother', 'Sister', 'Brother'],
            correct: 'Mother',
            category: 'family'
        },
        {
            id: 'colors_1',
            level: 'intermediate',
            question: 'What color does this sign represent?',
            sign: 'red',
            options: ['Red', 'Blue', 'Green', 'Yellow'],
            correct: 'Red',
            category: 'colours'
        },
        {
            id: 'actions_1',
            level: 'advanced',
            question: 'What action does this sign represent?',
            sign: 'eat',
            options: ['Drink', 'Eat', 'Sleep', 'Walk'],
            correct: 'Eat',
            category: 'actions'
        },
        {
            id: 'emotions_1',
            level: 'advanced',
            question: 'What emotion does this sign represent?',
            sign: 'happy',
            options: ['Sad', 'Happy', 'Angry', 'Surprised'],
            correct: 'Happy',
            category: 'feelings'
        },
        {
            id: 'complex_1',
            level: 'advanced',
            question: 'What does this sign mean?',
            sign: 'weather',
            options: ['Weather', 'Season', 'Time', 'Day'],
            correct: 'Weather',
            category: 'seasons'
        }
    ], []);

    const loadAnimationLandmarks = useCallback(async (questionSign) => {
        try {
            setLoading(true);
            console.log('Loading animation for sign:', questionSign);
            const data = await getLandmarks(questionSign);
            
            if (!data || data.length === 0) {
                console.warn('No landmarks found for:', questionSign);
                setLandmarks({});
            } else {
                setLandmarks(data);
            }
            setReplayKey(prev => prev + 1);
        } catch (error) {
            console.error('Failed to load landmarks:', error);
            setLandmarks({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentQuestion < placementQuestions.length) {
            const currentQ = placementQuestions[currentQuestion];
            loadAnimationLandmarks(currentQ.sign.toLowerCase());
        }
    }, [currentQuestion, loadAnimationLandmarks,placementQuestions]);

    const handleReplay = () => {
        setReplayKey(prev => prev + 1);
    };

    const handleAnswer = (selectedAnswer) => {
        const currentQ = placementQuestions[currentQuestion];
        const isCorrect = selectedAnswer === currentQ.correct;
        
        const newAnswers = [...answers, {
            questionId: currentQ.id,
            correct: isCorrect,
            level: currentQ.level,
            category: currentQ.category
        }];
        
        setAnswers(newAnswers);

        if (currentQuestion < placementQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResults(true);
            calculatePlacement(newAnswers);
        }
    };

    const calculatePlacement = (finalAnswers) => {
        console.log('=== CALCULATING PLACEMENT ===');
        console.log('Final answers:', finalAnswers);
        
        const correctAnswers = finalAnswers.filter(a => a.correct).length;
        const totalQuestions = placementQuestions.length;
        const percentage = (correctAnswers / totalQuestions) * 100;

        console.log(`Placement test results: ${correctAnswers}/${totalQuestions} (${percentage}%)`);

        let startingLevel;
        let unlockedCategories;

        if (percentage >= 90) {
            startingLevel = 'advanced';
            unlockedCategories = [
                'alphabets', 'numbers', 'introduce', 'colours', 'family', 
                'feelings', 'actions', 'questions', 'time', 'food', 'things', 'animals'
            ];
        } else if (percentage >= 70) {
            startingLevel = 'intermediate';
            unlockedCategories = [
                'alphabets', 'numbers', 'introduce','colours', 'family', 
                'feelings', 'actions'
            ];
        } else if (percentage >= 50) {
            startingLevel = 'basic-plus';
            unlockedCategories = ['alphabets', 'numbers', 'introduce', 'colours', 'family'];
        } else {
            startingLevel = 'beginner';
            unlockedCategories = ['alphabets', 'numbers'];
        }

        const results = {
            startingLevel,
            unlockedCategories,
            testScore: percentage,
            correctAnswers,
            totalQuestions,
            timestamp: new Date().toISOString(),
            placementCompleted: true
        };

        console.log('=== FINAL PLACEMENT RESULTS ===');
        console.log('Starting Level:', startingLevel);
        console.log('Unlocked Categories:', unlockedCategories);
        console.log('Full Results Object:', results);
        console.log('==============================');

        setTimeout(() => {
            console.log('=== CALLING onComplete ===');
            console.log('Results being sent:', results);
            onComplete(results);
        }, 2000);
    };

    const skipTest = () => {
        console.log('=== PLACEMENT TEST SKIPPED ===');
        
        const results = {
            startingLevel: 'beginner',
            unlockedCategories: ['alphabets'],
            testScore: 0,
            skipped: true,
            timestamp: new Date().toISOString(),
            placementCompleted: true
        };

        console.log('Skip results being sent:', results);
        console.log('Unlocked categories for skip:', results.unlockedCategories);
        console.log('=============================');
        
        onSkip(results);
    };

    const handleClose = () => {
        console.log('=== PLACEMENT TEST CLOSED (X BUTTON) ===');
        console.log('Closing placement test without affecting any state');
        if (onClose) {
            onClose();
        }
    };

    if (showResults) {
        const correctCount = answers.filter(a => a.correct).length;
        const percentage = Math.round((correctCount / placementQuestions.length) * 100);

        return (
            <div className="placement-test-overlay">
                <div className="results-card">
                   
                    <div className="angie-avatar-container">
                        <Canvas camera={{ position: [0, 0.2, 3], fov: 30 }}>
                            {/* eslint-disable react/no-unknown-property */}
                            <ambientLight intensity={5} />
                            {/* eslint-disable react/no-unknown-property */}
                            <group position={[0, -1.1, 0]}>
                                <AngieSigns landmarks={landmarks} />
                            </group>
                        </Canvas>
                    </div>

                    <div className="results-content">
                        <h2 className="results-title">Placement Test Complete!</h2>

                        <div className="score-display">
                            <div className="score-circle">
                                <span className="score-percentage">{percentage}%</span>
                            </div>
                            
                            <div className="score-details">
                                <p className="score-text">
                                    You got {correctCount} out of {placementQuestions.length} questions correct!
                                </p>
                                
                                <p className="analysis-text">
                                    Analyzing your results to customize your learning experience...
                                </p>
                            </div>
                        </div>

                        <div className="loading-dots">
                            <div className="dot dot-1"></div>
                            <div className="dot dot-2"></div>
                            <div className="dot dot-3"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = placementQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / placementQuestions.length) * 100;

    return (
        <div className="placement-test-overlay">
            <div className="test-card">
                <button 
                    onClick={handleClose}
                    className="close-button"
                    aria-label="Close placement test"
                    title="Close placement test (your progress will not be saved)"
                >
                    ×
                </button>

                {/* Header Section */}
                <div className="test-header">
                    <h1 className="test-title">Sign Language Placement Test</h1>
                    <p className="test-description">
                        Let&apos;s see what you already know to customize your learning journey!
                    </p>
                    
                    <div className="PTprogress-section">
                        <div className="PTprogress-bar">
                            <div 
                                className="PTprogress-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="progress-text">
                            Question {currentQuestion + 1} of {placementQuestions.length}
                        </span>
                    </div>
                </div>

                {/* Animation Section */}
                <div className="animation-section">
                    <div className="animation-container">
                        {loading && (
                            <div className="animation-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading animation...</p>
                            </div>
                        )}
                        
                        <div className="canvas-wrapper" style={{ opacity: loading ? 0.3 : 1 }}>
                            <Canvas camera={{ position: [0, 0.2, 3], fov: 30 }}>
                                {/* eslint-disable react/no-unknown-property */}
                                <ambientLight intensity={5} />
                                {/* eslint-disable react/no-unknown-property */}
                                <group position={[0, -1.1, 0]}>
                                    {landmarks && Object.keys(landmarks).length > 0 && (
                                        <AngieSigns key={replayKey} landmarks={landmarks} />
                                    )}
                                </group>
                                <OrbitControls 
                                    enablePan={false} 
                                    maxPolarAngle={Math.PI / 2} 
                                    minDistance={2} 
                                    maxDistance={3} 
                                />
                            </Canvas>
                        </div>
                        
                        <button 
                            onClick={handleReplay} 
                            className="replay-button"
                            disabled={loading}
                        >
                            Replay Animation
                        </button>
                    </div>
                </div>

                {/* Question Section */}
                <div className="question-section">
                    <h2 className="qquestion-title">{currentQ.question}</h2>

                    <div className="options-container">
                        {currentQ.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className="option-button"
                                disabled={loading}
                            >
                                <span className="option-letter">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="option-text">{option}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="test-footer">
                    <div className="level-indicator">
                        <span className={`level-badge level-${currentQ.level}`}>
                            {currentQ.level} level
                        </span>
                        <span className="category-badge">
                            {currentQ.category}
                        </span>
                    </div>
                    
                    <button
                        onClick={skipTest}
                        className="skip-test-button"
                    >
                        Skip test and start from the beginning
                    </button>
                </div>
            </div>
        </div>
    );
};

PlacementTest.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onSkip: PropTypes.func,
  onClose: PropTypes.func,
};


export default PlacementTest;