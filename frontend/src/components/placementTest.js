import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AngieSigns } from './angieSigns';
import '../styles/learn.css';


const landmarks = {};

const PlacementTest = ({ onComplete, onSkip }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);

    const placementQuestions = [
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
    ];

    const handleAnswer = (selectedAnswer) => {
        const currentQ = placementQuestions[currentQuestion];
        const isCorrect = selectedAnswer === currentQ.correct;
        
        setAnswers([...answers, {
            questionId: currentQ.id,
            correct: isCorrect,
            level: currentQ.level,
            category: currentQ.category
        }]);

        if (currentQuestion < placementQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResults(true);
            calculatePlacement();
        }
    };

    const calculatePlacement = () => {
        const correctAnswers = answers.filter(a => a.correct).length + 
                              (placementQuestions[currentQuestion].options.includes(placementQuestions[currentQuestion].correct) ? 1 : 0);
        const totalQuestions = placementQuestions.length;
        const percentage = (correctAnswers / totalQuestions) * 100;

        let startingLevel;
        let unlockedCategories;

        if (percentage >= 90) {
            startingLevel = 'advanced';
            unlockedCategories = [
                'alphabets', 'numbers', 'introduce', 'family', 'feelings', 
                'actions', 'questions', 'time', 'food', 'colours', 'things', 'animals'
            ];
        } else if (percentage >= 70) {
            startingLevel = 'intermediate';
            unlockedCategories = [
                'alphabets', 'numbers', 'introduce', 'family', 'feelings', 
                'actions', 'colours'
            ];
        } else if (percentage >= 50) {
            startingLevel = 'basic-plus';
            unlockedCategories = ['alphabets', 'numbers', 'introduce', 'family', 'colours'];
        } else {
            startingLevel = 'beginner';
            unlockedCategories = ['alphabets', 'numbers'];
        }

        setTimeout(() => {
            onComplete({
                startingLevel,
                unlockedCategories,
                testScore: percentage,
                correctAnswers,
                totalQuestions
            });
        }, 2000);
    };

    const skipTest = () => {
        onSkip({
            startingLevel: 'beginner',
            unlockedCategories: ['alphabets'],
            testScore: 0,
            skipped: true
        });
    };

    if (showResults) {
        const correctCount = answers.filter(a => a.correct).length + 1; 
        const percentage = Math.round((correctCount / placementQuestions.length) * 100);

        return (
            <div className="placement-test-container fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center z-50">
                <div className="placement-test-card bg-white rounded-3xl shadow-2xl p-8 max-w-2xl mx-4 text-center">
                    <div className="w-32 h-32 rounded-2xl bg-white shadow-lg mb-6 mx-auto flex items-center justify-center">
                        <Canvas camera={{ position: [0, 0.2, 3], fov: 30 }}>
                            <ambientLight intensity={5} />
                            <group position={[0, -1.1, 0]}>
                                <AngieSigns landmarks={landmarks} />
                            </group>
                        </Canvas>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Placement Test Complete!
                    </h2>

                    <div className="results-summary mb-6">
                        <div className="score-circle mx-auto mb-4 w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{percentage}%</span>
                        </div>
                        
                        <p className="text-lg text-gray-600 mb-2">
                            You got {correctCount} out of {placementQuestions.length} questions correct!
                        </p>
                        
                        <p className="text-gray-500">
                            Analyzing your results to customize your learning experience...
                        </p>
                    </div>

                    <div className="loading-animation">
                        <div className="flex justify-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = placementQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / placementQuestions.length) * 100;

    return (
        <div className="placement-test-container fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center z-50">
            <div className="placement-test-card bg-white rounded-3xl shadow-2xl p-8 max-w-2xl mx-4">
                {/* Header */}
                <div className="test-header mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Sign Language Placement Test
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Let's see what you already know to customize your learning journey!
                    </p>
                    
                    {/* Progress bar */}
                    <div className="progress-bar w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div 
                            className="progress-fill bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    
                    <span className="text-sm text-gray-500">
                        Question {currentQuestion + 1} of {placementQuestions.length}
                    </span>
                </div>

                {/* Question */}
                <div className="question-section mb-8">
                    <div className="sign-display w-48 h-48 rounded-2xl bg-white shadow-lg mb-6 mx-auto flex items-center justify-center border-4 border-gray-100">
                        <Canvas camera={{ position: [0, 0.2, 3], fov: 30 }}>
                            <ambientLight intensity={5} />
                            <group position={[0, -1.1, 0]}>
                                <AngieSigns landmarks={landmarks} />
                            </group>
                        </Canvas>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                        {currentQ.question}
                    </h2>

                    <div className="options-grid grid grid-cols-2 gap-4">
                        {currentQ.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className="option-button p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200 text-lg font-medium text-gray-700 hover:text-blue-700"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Skip option */}
                <div className="test-footer text-center">
                    <button
                        onClick={skipTest}
                        className="skip-button text-gray-500 hover:text-gray-700 underline text-sm"
                    >
                        Skip test and start from the beginning
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlacementTest;