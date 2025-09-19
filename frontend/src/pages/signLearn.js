 
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'; 
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLearningStats } from '../contexts/learningStatsContext'; 
import { AngieSigns } from '../components/angieSigns';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {Suspense} from 'react';
import { getLandmarks } from '../utils/apiCalls'; 

const MEMORY_HINTS = {
    'a': 'Make a fist with your thumb to the side - like the letter A without the crossbar.',
    'b': 'Hold up four fingers with your thumb across your palm - like the letter B.',
    'c': 'Curve your fingers like the letter C.',
    'd': 'Point your index finger up with other fingers touching your thumb - like the letter D.',
    'e': 'Curl all fingers down touching your thumb.',
    'f': 'Touch your thumb and index finger, other fingers up - like "OK" but with three fingers.',
    'g': 'Point your index finger and thumb forward horizontally.',
    'h': 'Point your index and middle finger forward horizontally.',
    'i': 'Hold up your pinky finger - the smallest letter gets the smallest finger.',
    'j': 'Like the letter I, but draw a J in the air with your pinky.',
    'k': 'Index finger up, middle finger out, thumb touches middle finger.',
    'l': 'Make an L shape with your thumb and index finger.',
    'm': 'Tuck your thumb under three fingers.',
    'n': 'Tuck your thumb under two fingers.',
    'o': 'Make an O shape with all your fingers.',
    'p': 'Like K but pointing down - "p" hangs below the line.',
    'q': 'Like G but pointing down.',
    'r': 'Cross your index and middle finger like crossing fingers for luck.',
    's': 'Make a fist with your thumb over your fingers.',
    't': 'Tuck your thumb between your index and middle finger.',
    'u': 'Hold up index and middle finger together.',
    'v': 'Hold up index and middle finger in a V shape - like "victory".',
    'w': 'Hold up three fingers (index, middle, ring) - W has three points.',
    'x': 'Hook your index finger - like drawing an X.',
    'y': 'Stick out your thumb and pinky - like "hang loose".',
    'z': 'Draw a Z in the air with your index finger.',

   '1': 'Hold up one finger - your index finger.',
    '2': 'Hold up two fingers in a V - index and middle.',
    '3': 'Hold up three fingers - thumb, index, and middle.',
    '4': 'Hold up four fingers, thumb tucked in.',
    '5': 'Show all five fingers spread wide.',
    '6': 'Touch your thumb to your pinky, other fingers up.',
    '7': 'Touch your thumb to your ring finger, other fingers up.',
    '8': 'Touch your thumb to your middle finger, other fingers up.',
    '9': 'Touch your thumb to your index finger, other fingers up.',
    '10': 'Shake your thumb - like "perfect 10".',

    'red': 'Touch your lips with your index finger and pull down - red lips.',
    'blue': 'Make the letter B and shake it - B for blue.',
    'green': 'Make the letter G and shake it - G for green.',
    'yellow': 'Make the letter Y and shake it - Y for yellow.',
    'black': 'Draw a line across your forehead with your index finger - like a black eyebrow.',
    'white': 'Touch your chest and pull away - like a white shirt.',
    'pink': 'Make the letter P and brush down your lips - pink lips.',
    'purple': 'Make the letter P and shake it - P for purple.',
    'orange': 'Make a fist and squeeze like juicing an orange.',
    'brown': 'Make the letter B and slide down your cheek - brown skin tone.',
    'gold': 'Point to your ear (gold earring) then make the letter Y.',
    'silver': 'Point to your ear then make the letter S.',

    'mother': 'Touch your thumb to your chin - where mom gives kisses.',
    'father': 'Touch your thumb to your forehead - dad\'s strong forehead.',
    'brother': 'Make the letter L, then touch forehead and bring down - like father, then together.',
    'sister': 'Make the letter L, then touch chin and bring down - like mother, then together.',
    'aunt': 'Make the letter A and shake it near your cheek.',
    'uncle': 'Make the letter U and shake it near your temple.',
    'grandma': 'Like mother, but bounce away from chin - grandmother is mother\'s mother.',
    'grandpa': 'Like father, but bounce away from forehead - grandfather is father\'s father.',
    'child': 'Pat down as if patting a child\'s head - someone shorter.',
    'boy': 'Snap your fingers at your forehead - like tipping a boy\'s cap.',
    'girl': 'Brush your thumb down your cheek - like a girl\'s soft cheek.',

   'happy': 'Brush your chest upward with both hands - happiness rising in your heart.',
    'sad': 'Draw tears down your face with both hands.',
    'angry': 'Claw at your face like an angry tiger.',
    'love': 'Cross your arms over your heart - hugging love to yourself.',
    'like': 'Pull your thumb and middle finger from your chest - something pulling at your heartstrings.',
    'sorry': 'Rub your fist on your chest in circles - rubbing away the hurt.',
    'feel': 'Touch your chest with your middle finger - feeling in your heart.',

    'eat': 'Bring your fingers to your mouth - putting food in.',
    'drink': 'Tilt an imaginary cup to your mouth.',
    'sleep': 'Rest your head on your hand like a pillow.',
    'walk': 'Move your hands like feet walking.',
    'sit': 'Hook two fingers over two fingers - like legs hanging over a chair.',
    'stand': 'Stand two fingers on your palm.',
    'see': 'Point from your eyes outward - sight going from eyes.',
    'go': 'Point with both index fingers in the direction you\'re going.',
    'understand': 'Flick your index finger up at your temple - the lightbulb moment.',

   'water': 'Make the letter W and tap your chin - W for water.',
    'apple': 'Twist your index finger knuckle at your cheek - like twisting an apple\'s stem.',
    'milk': 'Squeeze your fist like milking a cow.',
    'hungry': 'Draw your hand down your throat - food going down when hungry.',

    'hello': 'Salute like a soldier greeting an officer.',
    'goodbye': 'Wave your hand - universal goodbye gesture.',
    'thank_you': 'Touch your lips and bring your hand forward - blowing a kiss of thanks.',
    'please': 'Rub your chest in circles - pleading from the heart.',
    'you_are_welcome': 'Open hand forward - welcoming gesture.',
};

const PHRASE_HINTS = {
    'hello_my_name': 'Start with a salute (hello), then point to yourself (my), then tap your forehead twice (name).',
    'nice_meet_you': 'Brush hands together (nice), bring hands together (meet), then point forward (you).',
    'i_love_you': 'Point to yourself (I), cross arms over heart (love), point to them (you).',
    'i_am_happy': 'Point to yourself (I), then brush chest upward (happy) - happiness rising from within.',
    'i_am_sad': 'Point to yourself (I), then draw tears down your face (sad).',
    'see_you_tomorrow': 'Point from eyes outward (see), point to them (you), then thumb forward (tomorrow).',
    'i_am_hungry': 'Point to yourself (I), then draw hand down throat (hungry) - showing the need for food.',
    'drink_water': 'Tilt imaginary cup (drink) then make W at chin (water).',
    'my_mother': 'Point to yourself (my) then touch thumb to chin (mother).',
    'my_father': 'Point to yourself (my) then touch thumb to forehead (father).',
    'go_sleep': 'Point forward (go) then rest head on hand (sleep) - going to bed.',
    'i_understand': 'Point to yourself (I) then flick finger at temple (understand) - the lightbulb moment.',
    'hot_weather': 'Claw hand at face (hot) then move hands in waves (weather patterns).',
    'cold_weather': 'Shiver with clenched fists (cold) then wave hands (weather).',
    'eat_apple': 'Bring fingers to mouth (eat) then twist knuckle at cheek (apple).',
    'my_pet_is_a_dog': 'Point to self (my), pat leg (pet), point down (is), then pat leg and snap (dog).'
};

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
    const [hasTrackedStats, setHasTrackedStats] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const timeoutRef = useRef(null);

    const category = location.state?.category || new URLSearchParams(location.search).get('category');
    const isPhrase = location.pathname.startsWith('/phrase/');
    
    const currentPhrase = isPhrase ? COMMON_PHRASES.find(p => p.id === letter) : null;

   const getCurrentHint = () => {
        if (isPhrase && currentPhrase) {
            return PHRASE_HINTS[letter] || 'Practice each word slowly and remember the key movements.';
        }
        return MEMORY_HINTS[letter?.toLowerCase()] || 'Focus on the hand shape and movement pattern.';
    };

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
     
    const ModelLoadingFallback = () => (
  <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '15px',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '3px solid rgba(255,255,255,0.3)',
        borderTop: '3px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 15px'
      }}></div>
      Loading 3D Model...
    </div>
  </div>
);

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

    
    const handleReplay = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        
           setReplayKey(prev => prev + 1);
        
    };

    const toggleHint = () => {
        setShowHint(!showHint);
    };

    useEffect(() => {
         const timeoutId = timeoutRef.current;
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
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
                    setCurrentWordIndex(0);
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
    <Suspense fallback={<ModelLoadingFallback />}>
                <Canvas camera={{ position: [0, 0.2, 3], fov: 30 }}>
                    
                    {/* eslint-disable react/no-unknown-property */}
                    <ambientLight intensity={5} />
                    {/* eslint-disable react/no-unknown-property */}
                    <group position={[0, -1.1, 0]}>
                        <AngieSigns landmarks={landmarks} replay={replayKey}  duration={isPhrase ? 6.0 : 2.5} />
                    </group>
                    <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={2} maxDistance={3} />
                </Canvas>
                 </Suspense>
            </div>

            {/* Memory Hint Section */}
            <div style={{
                marginTop: '20px',
                maxWidth: '640px',
                width: '100%'
            }}>
                <button
                    onClick={toggleHint}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        backgroundColor: showHint ? '#28a745' : '#218838',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 auto'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                  {showHint ? 'Hide Memory Hint' : 'Show Memory Hint'}
                </button>

                {showHint && (
                    <div style={{
                        marginTop: '15px',
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        border: '2px solid #e9ecef',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '10px',
                            gap: '8px'
                        }}>
                            <span style={{
                                fontSize: '20px'
                            }}></span>
                            <h3 style={{
                                margin: 0,
                                color: '#333',
                                fontSize: '18px'
                            }}>
                                Memory Hint
                            </h3>
                        </div>
                        <p style={{
                            margin: 0,
                            color: '#555',
                            fontSize: '16px',
                            lineHeight: '1.5',
                            fontStyle: 'italic'
                        }}>
                            {getCurrentHint()}
                        </p>
                    </div>
                )}
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
            @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                @keyframes slideIn {
                    0% { 
                        opacity: 0; 
                        transform: translateY(-10px); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
            `}</style>
        </div>
    );
}