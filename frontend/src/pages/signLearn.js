import React, { useEffect, useState, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { useLearningStats } from '../contexts/learningStatsContext'; 
import { AnimatedAngie } from '../components/angieSigns';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

async function getLandmarks(letter) {
    try {
        const response = await fetch(`/landmarks/${letter}.json`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error loading landmarks for ${letter}:`, error);
        return [];
    }
}

export function SignLearn() {
    const { letter } = useParams();
    const navigate = useNavigate();
    const [landmarks, setLandmarks] = useState({});
    const [loading, setLoading] = useState(true);
    const { updateStats, stats } = useLearningStats();
    const [replayKey, setReplayKey] = useState(0);

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

    const handleReplay = () => {
        setReplayKey(prev => prev + 1); 
    };

    useEffect(() => {
        async function loadData() {
            if (!letter) return;

            setLoading(true);
            try {
                const data = await getLandmarks(letter);
                setLandmarks(data);
                // console.log(data); 

                const learnedSigns = stats?.learnedSigns || []; 
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

            <div style={{
                width: '100%',
                maxWidth: '640px',
                height: '480px',
                borderRadius: '15px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                overflow: 'hidden'
                }}>
                <Canvas camera={{ position: [0, 0.2, 3], fov: 30 }}>
                    <ambientLight intensity={5} />
                    <directionalLight position={[2, 5, 5]} intensity={2} />
                    <group position={[0, -1.1, 0]}>
                        <AnimatedAngie landmarks={landmarks} replay={replayKey}/>
                    </group>
                    <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={2} maxDistance={3} />
                </Canvas>
            </div>

            <div className="controls-container" style={{
                marginTop: '30px',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <button
                    onClick={handleReplay}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        backgroundColor: '#ffe44d',
                        color: 'black',
                        border: 'none',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: '0.3s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >Replay Animation</button>
            </div>
        </div>
    );
}