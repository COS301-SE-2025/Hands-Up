import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLearningStats } from '../contexts/learningStatsContext';
import { AngieSigns } from '../components/angieSigns';
import { PhilSigns } from '../components/philSigns';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

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
        items: ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Orange', 'Brown',  'Gold', 'Silver']
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
        items: [ 'today', 'tomorrow', 'yesterday', 'year', 'now', 'future', 'Oclock', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
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
    
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quizStarted, setQuizStarted] = useState(false);
    
    const [landmarks, setLandmarks] = useState({});
    const [replayKey, setReplayKey] = useState(0);
    const [selectedCharacter, setSelectedCharacter] = useState('angie');

    const currentCategoryData = CATEGORIES[category] || CATEGORIES['alphabets'];

    const generateQuizQuestions = useCallback(() => {
        const availableItems = currentCategoryData.items;
        
       const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
        const selectedItems = shuffled.slice(0, Math.min(5, availableItems.length));
        
        return selectedItems.map((item, index) => ({
            id: index + 1,
            item: item.toLowerCase(),
            correctAnswer: item,
            displayAnswer: item
        }));
    }, [currentCategoryData]);

    const loadCurrentQuestionLandmarks = useCallback(async (item) => {
        try {
            const data = await getLandmarks(item);
            setLandmarks(data);
            setReplayKey(prev => prev + 1);
        } catch (error) {
            console.error('Failed to load landmarks:', error);
            setLandmarks({});
        }
    }, []);

    useEffect(() => {
        const questions = generateQuizQuestions();
        setQuizQuestions(questions);
        setLoading(false);
    }, [generateQuizQuestions]);

    useEffect(() => {
        if (quizStarted && quizQuestions.length > 0 && currentQuestionIndex < quizQuestions.length) {
            const currentQuestion = quizQuestions[currentQuestionIndex];
            loadCurrentQuestionLandmarks(currentQuestion.item);
        }
    }, [quizStarted, currentQuestionIndex, quizQuestions, loadCurrentQuestionLandmarks]);

    const startQuiz = () => {
        setQuizStarted(true);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setCurrentAnswer('');
        setShowResults(false);
        setScore(0);
    };

    const handleAnswerSubmit = () => {
        if (!currentAnswer.trim()) return;

        const currentQuestion = quizQuestions[currentQuestionIndex];
        const isCorrect = currentAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase();
        
        const newAnswer = {
            questionId: currentQuestion.id,
            userAnswer: currentAnswer.trim(),
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect,
            questionItem: currentQuestion.item
        };

        const newUserAnswers = [...userAnswers, newAnswer];
        setUserAnswers(newUserAnswers);

        if (isCorrect) {
            setScore(score + 1);
        }

        setCurrentAnswer('');

        if (currentQuestionIndex + 1 < quizQuestions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setShowResults(true);
            const finalScore = newUserAnswers.filter(answer => answer.isCorrect).length;
            updateStats({
                quizzesCompleted: (stats?.quizzesCompleted || 0) + 1,
                quizScore: finalScore,
                totalQuizQuestions: (stats?.totalQuizQuestions || 0) + quizQuestions.length,
                [`${category}QuizCompleted`]: true
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAnswerSubmit();
        }
    };

    const handleReplay = () => {
        setReplayKey(prev => prev + 1);
    };

    const restartQuiz = () => {
        const questions = generateQuizQuestions();
        setQuizQuestions(questions);
        startQuiz();
    };

   const goBackToCategory = () => {
        navigate('/learn', { state: { selectedCategory: category } });
    };

    const goBackToLearn = () => {
        navigate('/learn');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                minHeight: '100vh',
                justifyContent: 'center'
            }}>
                <h1 style={{ color: '#333' }}>Loading {currentCategoryData.name} Quiz...</h1>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                minHeight: '100vh',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif'
            }}>
                <button
                    onClick={goBackToCategory}
                    style={{
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
                    }}
                >
                    ← Back to {currentCategoryData.name}
                </button>

                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '15px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>
                        {currentCategoryData.name} QUIZ
                    </h2>
                    <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
                        You&apos;ll see 5 different {currentCategoryData.name.toLowerCase()} signs.
                        <br />Type the correct answer for each sign!
                    </p>



                    <button
                        onClick={startQuiz}
                        style={{
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
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#218838';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#28a745';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Start {currentCategoryData.name} Quiz!
                    </button>
                </div>
            </div>
        );
    }

    if (showResults) {
        const percentage = Math.round((score / quizQuestions.length) * 100);
        const passed = percentage >= 60;

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                minHeight: '100vh',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '15px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    maxWidth: '700px',
                    width: '100%'
                }}>
                    <h1 style={{ 
                        color: passed ? '#28a745' : '#dc3545', 
                        marginBottom: '20px',
                        fontSize: '2.5em'
                    }}>
                        {passed ? '🎉 Great Job!' : '📚 Keep Learning!'}
                    </h1>
                    
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>
                        {currentCategoryData.name} Quiz Results
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
                            Correct Answers: {score} | Incorrect Answers: {quizQuestions.length - score}
                        </p>
                    </div>

                    <div style={{
                        textAlign: 'left',
                        marginBottom: '30px'
                    }}>
                        <h3 style={{ color: '#333', marginBottom: '15px' }}>Questions You Got Correct:</h3>
                        {userAnswers.filter(answer => answer.isCorrect).length > 0 ? (
                            <div style={{ marginBottom: '20px' }}>
                                {userAnswers.filter(answer => answer.isCorrect).map((answer, index) => (
                                    <div key={index} style={{
                                        padding: '12px',
                                        margin: '8px 0',
                                        backgroundColor: '#d4edda',
                                        borderRadius: '8px',
                                        border: '2px solid #c3e6cb',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <strong>Question {userAnswers.indexOf(answer) + 1}: {answer.correctAnswer}</strong>
                                            <br />
                                            <span style={{ color: '#155724', fontSize: '14px' }}>
                                                Your answer: {answer.userAnswer}
                                            </span>
                                        </div>
                                        <div style={{ 
                                            fontSize: '24px',
                                            color: '#155724',
                                            fontWeight: 'bold'
                                        }}>
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
                                    <div key={index} style={{
                                        padding: '12px',
                                        margin: '8px 0',
                                        backgroundColor: '#f8d7da',
                                        borderRadius: '8px',
                                        border: '2px solid #f5c6cb',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <strong>Question {userAnswers.indexOf(answer) + 1}: {answer.correctAnswer}</strong>
                                            <br />
                                            <span style={{ color: '#721c24', fontSize: '14px' }}>
                                                Your answer: {answer.userAnswer}
                                            </span>
                                            <br />
                                            <span style={{ color: '#155724', fontSize: '14px' }}>
                                                Correct answer: {answer.correctAnswer}
                                            </span>
                                        </div>
                                        <div style={{ 
                                            fontSize: '24px',
                                            color: '#721c24',
                                            fontWeight: 'bold'
                                        }}>
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



    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh',
            fontFamily: 'Inter, sans-serif'
        }}>
            <button
                onClick={goBackToCategory}
                style={{
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
                }}
            >
                ← Back to {currentCategoryData.name}
            </button>

            <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                marginTop: '40px'
            }}>
                <h1 style={{ color: '#333', marginBottom: '5px' }}>
                    {currentCategoryData.name} Quiz
                </h1>
                <p style={{ color: '#666', marginBottom: '10px' }}>
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </p>
                <div style={{
                    backgroundColor: '#e9ecef',
                    borderRadius: '10px',
                    padding: '5px',
                    width: '300px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        backgroundColor: '#28a745',
                        height: '20px',
                        borderRadius: '8px',
                        width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`,
                        transition: 'width 0.3s ease'
                    }}></div>
                </div>
            </div>

            <h2 style={{ color: '#333', marginBottom: '20px' }}>
                What is this sign?
            </h2>

            <div style={{
                width: '640px',
                height: '480px',
                maxWidth: '90%',
                border: '2px solid #ddd',
                borderRadius: '15px',
                backgroundColor: '#fff',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                marginBottom: '20px',
                overflow: 'hidden'
            }}>
                <Canvas camera={{ position: [0, 0.2, 3], fov: 30 }}>
                    {/* eslint-disable-next-line react/no-unknown-property */}
                    <ambientLight intensity={5} />
                     {/* eslint-disable-next-line react/no-unknown-property */}
                    <group position={[0, -1.1, 0]}>             
                        {landmarks && Object.keys(landmarks).length > 0 && (
                            selectedCharacter === 'angie' ? (
                                <AngieSigns key={replayKey} landmarks={landmarks} />
                            ) : (
                                <PhilSigns key={replayKey} landmarks={landmarks} />
                            )
                        )}
                    </group>  
                    <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={2} maxDistance={3} />
                </Canvas>
            </div>

            <button
                onClick={handleReplay}
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#138496';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#17a2b8';
                }}
            >
                🔄 Replay
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
                    onClick={handleAnswerSubmit}
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
                    {currentQuestionIndex + 1 === quizQuestions.length ? 'Finish Quiz' : 'Next Question'} →
                </button>
            </div>

            <div style={{
                marginTop: '30px',
                color: '#666',
                textAlign: 'center'
            }}>
                <p>Current Score: {score}/{quizQuestions.length}</p>
                <p style={{ fontSize: '14px' }}>
                    Hint: {category === 'alphabets' ? 'Single letter (A-Z)' : 
                           category === 'numbers' ? 'Number (1-20)' : 
                           'Word or phrase'}
                </p>
            </div>
        </div>
    );
}