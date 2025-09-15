/* eslint-disable react/no-unknown-property */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'; 
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLearningStats } from '../contexts/learningStatsContext'; 
import { AngieSigns } from '../components/angieSigns';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { getLandmarks } from '../utils/apiCalls'; 

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

export function SignLearn() {
    const { letter } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [landmarks, setLandmarks] = useState({});
    const [loading, setLoading] = useState(true);
    const { updateStats, stats } = useLearningStats();
    const [replayKey, setReplayKey] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [hasTrackedStats, setHasTrackedStats] = useState(false);
    const timeoutRef = useRef(null);

    const category = location.state?.category || new URLSearchParams(location.search).get('category');
    const isPhrase = location.pathname.startsWith('/phrase/');
    
    const currentPhrase = isPhrase ? COMMON_PHRASES.find(p => p.id === letter) : null;

    const categoryWords = useMemo(() => ({
        'alphabets': 'abcdefghijklmnopqrstuvwxyz'.split(''),
        'numbers': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
        'colours': ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'gold', 'silver'],
        'introduce': ['hello', 'name', 'my', 'again', 'goodbye', 'nice', 'meet', 'you', 'this', 'sorry', 'and'],
        'family': ['brother', 'sister', 'mother', 'father', 'aunt', 'uncle', 'grandma', 'grandpa', 'child', 'siblings', 'boy', 'girl'],
        'feelings': ['happy', 'sad', 'angry', 'cry', 'sorry', 'like', 'love', 'hate', 'feel'],
        'actions': ['drive', 'watch','see', 'sleep', 'walk', 'stand', 'sit', 'give', 'understand', 'go', 'stay', 'talk'],
        'questions': ['why', 'tell', 'when', 'who', 'which'],
        'time': ['today', 'tomorrow', 'yesterday', 'year', 'now', 'future', 'oclock', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        'food': ['water', 'apple', 'drink', 'cereal', 'eggs', 'eat', 'hungry', 'full', 'cup', 'popcorn', 'candy', 'soup', 'juice', 'milk', 'pizza'],
        'things': ['shower', 'table', 'lights', 'computer', 'hat', 'chair', 'car', 'ambulance', 'window'],
        'animals': ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'animal'],
        'seasons': ['spring', 'summer', 'autumn', 'winter', 'sun', 'rain', 'snow', 'wind', 'sunrise', 'hot', 'cold', 'warm', 'cool', 'weather', 'freeze'],
        'phrases': COMMON_PHRASES.map(p => p.id)
    }), []);

    const getNextSign = useCallback((currentSign) => {
        if (!currentSign || !category) return null;
        
        const categoryList = categoryWords[category];
        if (!categoryList) return null;
        
        const currentIndex = categoryList.findIndex(sign => 
            sign.toLowerCase() === currentSign.toLowerCase()
        );
        
        if (currentIndex === -1 || currentIndex === categoryList.length - 1) return null;
        return categoryList[currentIndex + 1];
    }, [category, categoryWords]);

    const getPreviousSign = useCallback((currentSign) => {
        if (!currentSign || !category) return null;
        
        const categoryList = categoryWords[category];
        if (!categoryList) return null;
        
        const currentIndex = categoryList.findIndex(sign => 
            sign.toLowerCase() === currentSign.toLowerCase()
        );
        
        if (currentIndex <= 0) return null;
        return categoryList[currentIndex - 1];
    }, [category, categoryWords]);

    const showPreviousButton = getPreviousSign(letter) !== null;
    const showNextButton = getNextSign(letter) !== null;

    const handleBackToLearn = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (category) {
            navigate('/learn', { state: { selectedCategory: category } });
        } else {
           navigate('/learn');
        }
    };

    const handleNextSign = () => {
        const nextSign = getNextSign(letter);
        if (nextSign) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (category === 'phrases') {
                navigate(`/phrase/${nextSign}`, {
                    state: { category }
                });
            } else {
                navigate(`/sign/${nextSign}${category ? `?category=${category}` : ''}`, {
                    state: { category }
                });
            }
        }
    };

    const handlePreviousSign = () => {
        const prevSign = getPreviousSign(letter);
        if (prevSign) {
           if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (category === 'phrases') {
                navigate(`/phrase/${prevSign}`, {
                    state: { category }
                });
            } else {
                navigate(`/sign/${prevSign}${category ? `?category=${category}` : ''}`, {
                    state: { category }
                });
            }
        }
    };

    const startAutoPlay = useCallback(() => {
        if (!currentPhrase) return;
        
        setIsAutoPlaying(true);
        setCurrentWordIndex(0);
        setReplayKey(prev => prev + 1);
        
        let index = 0;
        const playNext = () => {
            if (index < currentPhrase.words.length) {
                setCurrentWordIndex(index);
                setReplayKey(prev => prev + 1);
                index++;
                
                if (index < currentPhrase.words.length) {
                    timeoutRef.current = setTimeout(playNext, 3000);
                } else {
                    setIsAutoPlaying(false);
                }
            }
        };
        
        timeoutRef.current = setTimeout(playNext, 500);
    }, [currentPhrase]);

    const handleReplay = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        if (isPhrase && currentPhrase) {
            setIsAutoPlaying(false); 
            setTimeout(() => {
                startAutoPlay();
            }, 100);
        } else {
           setReplayKey(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (isPhrase && currentPhrase && landmarks && landmarks.length > 0 && !isAutoPlaying) {
            const timer = setTimeout(startAutoPlay, 500);
            return () => clearTimeout(timer);
        }
    }, [isPhrase, currentPhrase, landmarks, isAutoPlaying, startAutoPlay]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setHasTrackedStats(false);
    }, [letter]);

    useEffect(() => {
        async function loadData() {
            if (!letter) return;

            setLoading(true);
            try {
                let data;
                if (isPhrase && currentPhrase) {
                    const currentWord = currentPhrase.words[currentWordIndex];
                    console.log('Loading animation for word:', currentWord);
                    data = await getLandmarks(currentWord);
                } else {
                    console.log('Loading animation for letter:', letter);
                    data = await getLandmarks(letter);
                }
                
                if (!data || data.length === 0) {
                    console.warn('No landmarks found for:', isPhrase ? currentPhrase.words[currentWordIndex] : letter);
                }
                
                setLandmarks(data);

                if (!hasTrackedStats) {
                    if (isPhrase && currentPhrase) {
                        const learnedPhrases = stats?.learnedPhrases || [];
                        if (!learnedPhrases.includes(letter)) {
                            updateStats({
                                lessonsCompleted: (stats?.lessonsCompleted || 0) + 1,
                                learnedPhrases: [...learnedPhrases, letter]
                            });
                            setHasTrackedStats(true);
                        }
                    } else {
                        const learnedSigns = stats?.learnedSigns || []; 
                        if (!learnedSigns.includes(letter.toLowerCase())) {
                            updateStats({
                                signsLearned: (stats?.signsLearned || 0) + 1, 
                                learnedSigns: [...learnedSigns, letter.toLowerCase()]
                            });
                            setHasTrackedStats(true);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load landmarks:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [letter, currentWordIndex, isPhrase, currentPhrase, updateStats, stats, hasTrackedStats]); 

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
                <h1 style={{ color: '#333' }}>
                    Loading {isPhrase ? 'Phrase' : 'Sign'}: {isPhrase ? currentPhrase?.phrase : letter}
                </h1>
                <div style={{
                    fontSize: '18px',
                    color: '#666',
                    marginTop: '20px'
                }}>
                    {isPhrase && currentPhrase ? 
                        `Loading animation for "${currentPhrase.words[currentWordIndex]}"...` :
                        'Loading animation...'
                    }
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
                <h1 style={{ color: '#333' }}>
                    Learning {isPhrase ? 'Phrase' : 'Sign'}: {isPhrase ? currentPhrase?.phrase : letter}
                </h1>
                <div style={{
                    fontSize: '18px',
                    color: '#dc3545',
                    marginTop: '20px'
                }}>
                    No landmark data found for {isPhrase ? `word "${currentPhrase?.words[currentWordIndex]}" in phrase` : 'letter'} &quot;{isPhrase ? currentPhrase?.phrase : letter}&quot;
                </div>
                <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginTop: '10px'
                }}>
                    Make sure the landmarks exist in the backend curriculum data.
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
                ← Back 
            </button>

            {showPreviousButton && (
                <button
                    onClick={handlePreviousSign}
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
                    title={`Previous: ${getPreviousSign(letter)?.toUpperCase()}`}
                >
                    ‹
                </button>
            )}

            {showNextButton && (
                <button
                    onClick={handleNextSign}
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
                    title={`Next: ${getNextSign(letter)?.toUpperCase()}`}
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
                {isPhrase ? (
                    <div>
                        <div>{currentPhrase?.phrase}</div>
                    </div>
                ) : (
                    <div>
                         {letter.toUpperCase()}
                        {category && (
                            <div style={{ 
                                fontSize: '0.6em', 
                                color: '#666', 
                                fontWeight: 'normal',
                                marginTop: '10px' 
                            }}>
                                {/* Category: {category} */}
                            </div>
                        )}
                    </div>
                )}
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
                    <group position={[0, -1.1, 0]}>
                        <AngieSigns landmarks={landmarks} replay={replayKey}/>
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
                >
                    {isPhrase ? 'Replay Phrase' : 'Replay Animation'}
                </button>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}