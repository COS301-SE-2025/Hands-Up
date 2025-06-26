import React, { useEffect, useRef, useState, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
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

export function SignLearn() {
    const { letter } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [landmarks, setLandmarks] = useState([]);
    const [frameIndex, setFrameIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const { updateStats, stats } = useLearningStats();

    const getNextLetter = useCallback((currentLetter) => {
        if (!currentLetter) return 'a';
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const currentIndex = alphabet.indexOf(currentLetter.toLowerCase());
        const nextIndex = (currentIndex + 1) % alphabet.length;
        return alphabet[nextIndex];
    }, []); 

    const getPreviousLetter = useCallback((currentLetter) => {
        if (!currentLetter) return 'z';
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const currentIndex = alphabet.indexOf(currentLetter.toLowerCase());
        const prevIndex = (currentIndex - 1 + alphabet.length) % alphabet.length;
        return alphabet[prevIndex];
    }, []); 

    const showPreviousButton = letter && letter.toLowerCase() !== 'a';
    const showNextButton = letter && letter.toLowerCase() !== 'z';

    const handleBackToLearn = () => {
        navigate('/learn');
    };

    const handleNextAlphabet = () => {
        const nextLetter = getNextLetter(letter);
        navigate(`/sign/${nextLetter}`);
    };

    const handlePreviousAlphabet = () => {
        const prevLetter = getPreviousLetter(letter);
        navigate(`/sign/${prevLetter}`);
    };

    useEffect(() => {
        async function loadData() {
            if (!letter) return;

            setLoading(true);
            try {
                const frames = await getLandmarks(letter);
                setLandmarks(frames);
                setFrameIndex(0);

                const learnedSigns = stats?.learnedSigns || []; // Assuming 'learnedSigns' array in stats
                if (!learnedSigns.includes(letter.toLowerCase())) {
                    updateStats({
                        signsLearned: (stats?.signsLearned || 0) + 1,
                        learnedSigns: [...learnedSigns, letter.toLowerCase()]
                    });
                }

               
            } catch (error) {
                console.error('Failed to load landmarks:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [letter, updateStats, stats, getNextLetter]); 

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        function drawFrame() {
            if (!ctx || landmarks.length === 0) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

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

            if ( landmarks.length > 1) {
                setTimeout(() => {
                    setFrameIndex((prev) => (prev + 1) % landmarks.length);
                }, 30);
            }
        }

        drawFrame();
    }, [landmarks, frameIndex]);



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
                <h1 style={{ color: '#333' }}>Loading Sign: {letter}</h1>
                <div style={{
                    fontSize: '18px',
                    color: '#666',
                    marginTop: '20px'
                }}>
                    Loading landmarks...
                </div>
            </div>
        );
    }

    if (!landmarks || landmarks.length === 0) {
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
                <h1 style={{ color: '#333' }}>Learning Sign: {letter}</h1>
                <div style={{
                    fontSize: '18px',
                    color: '#dc3545',
                    marginTop: '20px'
                }}>
                    No landmark data found for letter &quot{letter}&quot
                </div>
            </div>
        );
    }

    return (
        <div className="sign-learn-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh',
            fontFamily: 'Inter, sans-serif',
            position: 'relative'
        }}>

            <button
                onClick={handleBackToLearn}
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
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 10
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5a6268';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6c757d';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                ← Back to Learn
            </button>

            {showPreviousButton && (
                <button
                    onClick={handlePreviousAlphabet}
                    style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '15px',
                        backgroundColor: '#ffc107',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e0a800';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffc107';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                    title={`Previous: ${getPreviousLetter(letter).toUpperCase()}`}
                >
                    ‹
                </button>
            )}

            {showNextButton && (
                <button
                    onClick={handleNextAlphabet}
                    style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '15px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#218838';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#28a745';
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                    title={`Next: ${getNextLetter(letter).toUpperCase()}`}
                >
                    ›
                </button>
            )}

            <h1 className="sign-learn-title" style={{
                color: '#333',
                marginBottom: '20px',
                fontSize: '2.5em',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                marginTop: '40px'
            }}>
                Learning Sign: {letter.toUpperCase()}
            </h1>

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
                    height: 'auto'
                }}
            />

            <div className="controls-container" style={{
                marginTop: '30px',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>

            </div>
        </div>
    );
}