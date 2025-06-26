import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStats } from '../contexts/learningStatsContext';

async function getLandmarks(letter) {
    try {
        const response = await fetch(`/landmarks/${letter}.json`);
        const data = await response.json();
        return data.frames;
    } catch (error) {
        console.error(`Error loading landmarks for ${letter}:`, error);
        return [];
    }
}

export function SignQuiz() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const { updateStats, stats } = useLearningStats();
    
    // Quiz state
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quizStarted, setQuizStarted] = useState(false);
    
    // Animation state
    const [landmarks, setLandmarks] = useState([]);
    const [frameIndex, setFrameIndex] = useState(0);

    // Generate random quiz questions
    const generateQuizQuestions = useCallback(() => {
        const learnedSigns = stats?.learnedSigns || [];
        const availableLetters = learnedSigns.length >= 5 ? learnedSigns : ['a', 'b', 'c', 'd', 'e'];
        
        // Shuffle and pick 5 letters
        const shuffled = [...availableLetters].sort(() => Math.random() - 0.5);
        const selectedLetters = shuffled.slice(0, 5);
        
        return selectedLetters.map((letter, index) => ({
            id: index + 1,
            letter: letter.toLowerCase(),
            correctAnswer: letter.toUpperCase()
        }));
    }, [stats]);

    // Load landmarks for current question
    const loadCurrentQuestionLandmarks = useCallback(async (letter) => {
        try {
            const frames = await getLandmarks(letter);
            setLandmarks(frames);
            setFrameIndex(0);
        } catch (error) {
            console.error('Failed to load landmarks:', error);
            setLandmarks([]);
        }
    }, []);

    // Initialize quiz
    useEffect(() => {
        const questions = generateQuizQuestions();
        setQuizQuestions(questions);
        setLoading(false);
    }, [generateQuizQuestions]);

    // Load landmarks when question changes
    useEffect(() => {
        if (quizStarted && quizQuestions.length > 0 && currentQuestionIndex < quizQuestions.length) {
            const currentQuestion = quizQuestions[currentQuestionIndex];
            loadCurrentQuestionLandmarks(currentQuestion.letter);
        }
    }, [quizStarted, currentQuestionIndex, quizQuestions, loadCurrentQuestionLandmarks]);

    // Canvas drawing effect
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        function drawFrame() {
            if (!ctx || landmarks.length === 0) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#e8f4f8');
            gradient.addColorStop(1, '#f0f8ff');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const frame = landmarks[frameIndex];
            if (!frame || frame.length < 21) return;

            const getCoord = ({ x, y, z = 0 }) => {
                const canvasX = x * canvas.width;
                const canvasY = y * canvas.height;
                const depth = z * 100;
                const perspective = 1 + (depth * 0.001);

                return {
                    x: canvasX,
                    y: canvasY,
                    z: depth,
                    perspective: perspective
                };
            };

            const points = frame.map(getCoord);

            const getUniformSkinColor = (baseAlpha = 1) => {
                const baseR = 230;
                const baseG = 190;
                const baseB = 150;
                return `rgba(${baseR}, ${baseG}, ${baseB}, ${baseAlpha})`;
            };

            const fingerSegments = [
                [[1, 2], [2, 3], [3, 4]],
                [[5, 6], [6, 7], [7, 8]],
                [[9, 10], [10, 11], [11, 12]],
                [[13, 14], [14, 15], [15, 16]],
                [[17, 18], [18, 19], [19, 20]]
            ];

            const segmentsWithDepth = [];
            fingerSegments.forEach((finger, fingerIndex) => {
                finger.forEach((segment, segmentIndex) => {
                    const [startIdx, endIdx] = segment;
                    const avgZ = (points[startIdx].z + points[endIdx].z) / 2;
                    segmentsWithDepth.push({
                        fingerIndex,
                        segmentIndex,
                        segment,
                        avgZ
                    });
                });
            });

            segmentsWithDepth.sort((a, b) => b.avgZ - a.avgZ);

            // Draw shadow
            ctx.save();
            ctx.translate(8, 10);
            ctx.scale(0.98, 0.95);

            const palmPoints = [points[0], points[1], points[5], points[9], points[13], points[17]];
            ctx.beginPath();
            ctx.moveTo(palmPoints[0].x, palmPoints[0].y);

            for (let i = 1; i < palmPoints.length; i++) {
                const current = palmPoints[i];
                const next = palmPoints[(i + 1) % palmPoints.length];
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;
                ctx.quadraticCurveTo(current.x, current.y, midX, midY);
            }

            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.filter = 'blur(6px)';
            ctx.fill();
            ctx.filter = 'none';
            ctx.restore();

            // Draw palm
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.quadraticCurveTo(points[0].x - 30, points[0].y + 50, points[1].x - 10, points[1].y + 10);
            ctx.lineTo(points[5].x - 10, points[5].y + 5);
            ctx.lineTo(points[9].x, points[9].y);
            ctx.lineTo(points[13].x + 10, points[13].y + 5);
            ctx.lineTo(points[17].x + 10, points[17].y + 10);
            ctx.quadraticCurveTo(points[0].x + 30, points[0].y + 50, points[0].x, points[0].y);
            ctx.closePath();

            ctx.fillStyle = getUniformSkinColor(1);
            ctx.fill();
            ctx.strokeStyle = `rgba(150, 100, 80, 0.5)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw finger connections
            const fingerConnectionPairs = [
                [0, 1], [0, 5], [9, 5], [13, 9], [17, 13]
            ];

            fingerConnectionPairs.forEach(([startIdx, endIdx]) => {
                const start = points[startIdx];
                const end = points[endIdx];

                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.lineWidth = 20;
                ctx.strokeStyle = getUniformSkinColor(1);
                ctx.lineCap = 'round';
                ctx.stroke();
            });

            // Draw finger segments
            segmentsWithDepth.forEach(({ fingerIndex, segmentIndex, segment }) => {
                const [startIdx, endIdx] = segment;
                const start = points[startIdx];
                const end = points[endIdx];

                let baseWidth;
                if (fingerIndex === 0) baseWidth = 28;
                else if (fingerIndex === 1) baseWidth = 22;
                else if (fingerIndex === 2) baseWidth = 24;
                else if (fingerIndex === 3) baseWidth = 21;
                else baseWidth = 19;

                const widthMultiplier = segmentIndex === 2 ? 0.6 : segmentIndex === 1 ? 0.8 : 1;
                let segmentWidth = baseWidth * widthMultiplier;

                const avgPerspective = (start.perspective + end.perspective) / 2;
                segmentWidth *= avgPerspective;

                const angle = Math.atan2(end.y - start.y, end.x - start.x);
                const perpAngle = angle + Math.PI / 2;

                const halfWidth = segmentWidth / 2;
                const startX1 = start.x + Math.cos(perpAngle) * halfWidth;
                const startY1 = start.y + Math.sin(perpAngle) * halfWidth;
                const startX2 = start.x - Math.cos(perpAngle) * halfWidth;
                const startY2 = start.y - Math.sin(perpAngle) * halfWidth;

                const endHalfWidth = halfWidth * (segmentIndex === 2 ? 0.6 : 0.8);
                const endX1 = end.x + Math.cos(perpAngle) * endHalfWidth;
                const endY1 = end.y + Math.sin(perpAngle) * endHalfWidth;
                const endX2 = end.x - Math.cos(perpAngle) * endHalfWidth;
                const endY2 = end.y - Math.sin(perpAngle) * endHalfWidth;

                ctx.beginPath();
                ctx.moveTo(startX1, startY1);
                ctx.lineTo(endX1, endY1);
                ctx.lineTo(endX2, endY2);
                ctx.lineTo(startX2, startY2);
                ctx.closePath();

                ctx.fillStyle = getUniformSkinColor(1);
                ctx.fill();

                ctx.strokeStyle = `rgba(150, 100, 80, 0.5)`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            });

            if (landmarks.length > 1) {
                setTimeout(() => {
                    setFrameIndex((prev) => (prev + 1) % landmarks.length);
                }, 30);
            }
        }

        drawFrame();
    }, [landmarks, frameIndex]);

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
        const isCorrect = currentAnswer.toUpperCase() === currentQuestion.correctAnswer;
        
        const newAnswer = {
            questionId: currentQuestion.id,
            userAnswer: currentAnswer.toUpperCase(),
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect
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
            // Quiz finished
            setShowResults(true);
            
            // Update stats
            const finalScore = newUserAnswers.filter(answer => answer.isCorrect).length;
            updateStats({
                quizzesCompleted: (stats?.quizzesCompleted || 0) + 1,
                quizScore: finalScore,
                totalQuizQuestions: (stats?.totalQuizQuestions || 0) + 5
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAnswerSubmit();
        }
    };

    const restartQuiz = () => {
        const questions = generateQuizQuestions();
        setQuizQuestions(questions);
        startQuiz();
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
                <h1 style={{ color: '#333' }}>Loading Quiz...</h1>
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
                    onClick={goBackToLearn}
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
                    ← Back to Learn
                </button>

                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '15px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>QUIZ </h2>
                    <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
                        You&apos;ll see 5 different sign language gestures. 
                        <br />Type the correct letter for each sign!
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
                    maxWidth: '600px',
                    width: '100%'
                }}>
                    <h1 style={{ 
                        color: passed ? '#28a745' : '#dc3545', 
                        marginBottom: '20px',
                        fontSize: '3em'
                    }}>
                        {passed ? '🎉 Great Job!' : '📚 Keep Learning!'}
                    </h1>
                    
                    <div style={{
                        fontSize: '24px',
                        color: '#333',
                        marginBottom: '30px'
                    }}>
                        <p><strong>Your Score: {score}/{quizQuestions.length} ({percentage}%)</strong></p>
                    </div>

                    <div style={{
                        textAlign: 'left',
                        marginBottom: '30px'
                    }}>
                        <h3 style={{ color: '#333', marginBottom: '15px' }}>Quiz Results:</h3>
                        {userAnswers.map((answer, index) => (
                            <div key={index} style={{
                                padding: '10px',
                                margin: '5px 0',
                                backgroundColor: answer.isCorrect ? '#d4edda' : '#f8d7da',
                                borderRadius: '5px',
                                border: `1px solid ${answer.isCorrect ? '#c3e6cb' : '#f5c6cb'}`
                            }}>
                                <strong>Question {index + 1}:</strong>
                                <br />
                                Your answer: <strong>{answer.userAnswer}</strong>
                                <br />
                                {!answer.isCorrect && (
                                    <>Correct answer: <strong>{answer.correctAnswer}</strong></>
                                )}
                                <span style={{ 
                                    float: 'right', 
                                    color: answer.isCorrect ? '#155724' : '#721c24',
                                    fontWeight: 'bold'
                                }}>
                                    {answer.isCorrect ? '✓' : '✗'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
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
                onClick={goBackToLearn}
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
                ← Back to Learn
            </button>

            <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                marginTop: '40px'
            }}>
                <h1 style={{ color: '#333', marginBottom: '10px' }}>
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </h1>
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
                What letter is this sign?
            </h2>

            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{
                    border: '2px solid #ddd',
                    borderRadius: '15px',
                    backgroundColor: '#fff',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    maxWidth: '90%',
                    height: 'auto',
                    marginBottom: '30px'
                }}
            />

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px'
            }}>
                <input
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value.slice(0, 1))}
                    onKeyPress={handleKeyPress}
                    placeholder="Type the letter..."
                    style={{
                        padding: '15px',
                        fontSize: '24px',
                        textAlign: 'center',
                        border: '2px solid #ddd',
                        borderRadius: '10px',
                        width: '100px',
                        textTransform: 'uppercase'
                    }}
                    maxLength={1}
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
                <p>Score: {score}/{quizQuestions.length}</p>
            </div>
        </div>
    );
}