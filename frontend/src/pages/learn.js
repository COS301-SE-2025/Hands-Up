import React, { useState, useEffect, useMemo} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/learnSidebar';
import { CategoryTile } from '../components/learnCategoryTile';
import { LevelTile } from '../components/learnLevelTile';
import '../styles/learn.css';
import { useLearningStats } from '../contexts/learningStatsContext';
import { AngieSigns } from '../components/angieSigns';
import { Canvas } from '@react-three/fiber';
import PropTypes from 'prop-types';

const landmarks = {};

const HelpMessage = ({ message, onClose, position }) => {
    if (!message) return null;

    let positionClasses = '';
    switch (position) {
        case 'top-right':
            positionClasses = 'top-3 right-4';
            break;
        case 'top-left':
           positionClasses = 'top-4 left-4';
            break;
        case 'bottom-right':
           positionClasses = 'bottom-4 right-4';
            break;
        case 'center':
           positionClasses = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
            break;
        default:
           positionClasses = 'top-3 right-4';
    }

    return (
       <div className="help-message-backdrop fixed inset-0 bg-black bg-opacity-50 z-[9998] animate-fadeIn">
            <div className={`help-message-overlay fixed z-[9999] p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 border border-gray-200 ${positionClasses} animate-fadeInScale`}>
                <div className="w-full max-w-[200px] h-[200px] rounded-xl bg-white shadow-md mb-4 flex items-center justify-center">
                    <Canvas camera={{ position: [0, 0.2, 3], fov: 30 }}>
                        {/* eslint-disable-next-line react/no-unknown-property */}
                        <ambientLight intensity={5} />
                        {/* eslint-disable-next-line react/no-unknown-property */}
                        <group position={[0, -1.1, 0]}>
                            <AngieSigns landmarks={landmarks} />
                        </group>
                   </Canvas>
                </div>

                <p className="text-gray-800 text-lg text-center font-medium mb-6 leading-relaxed max-w-md">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="btn-secondary"
                >
                    Okay!
                </button>
            </div>
        </div>
    );
};

HelpMessage.propTypes = {
    message: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    position: PropTypes.string
};

const COLORS = [
    'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple',
    'Orange', 'Brown', 'Gold', 'Silver'
];

const INTRODUCTION_WORDS = ['hello', 'name', 'my','again', 'goodbye', 'nice', 'meet', 'you', 'this', 'sorry', 'and'];

const FAMILY_MEMBERS = ['brother', 'sister', 'mother','father', 'aunt', 'uncle', 'grandma', 'grandpa', 'child',
     'siblings','boy','girl',];

const EMOTIONS_FEELINGS = ['happy', 'sad', 'angry','cry', 'sorry', 'like', 'love', 'hate', 'feel'];

const COMMON_ACTIONS = ['drive', 'watch','see', 'sleep', 'walk', 'stand', 'sit', 'give', 'understand', 'go', 'stay',
    'talk'];

const ASKING_QUESTIONS = ['why', 'tell', 'when', 'who', 'which'];

const TIME_DAYS = [ 'today', 'tomorrow', 'yesterday', 'year',
    'now', 'future','Oclock', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FOOD_DRINKS = ['water', 'apple', 'drink', 'cereal', 'eggs', 'eat', 'hungry', 'full', 'cup',
    'popcorn', 'candy', 'soup','drink', 'juice', 'milk', 'pizza'];

const OBJECTS_THINGS = ['shower', 'table', 'lights', 'computer', 'hat', 'chair', 'car',
    'ambulance', 'window'];

const ANIMALS = ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'animal'];

const SEASONS_WEATHER = ['spring', 'summer', 'autumn', 'winter', 'sun', 'rain', 'snow',
    'wind', 'sunrise', 'hot', 'cold', 'warm', 'cool','weather', 'freeze'];

const COMMON_PHRASES = [
    { id: 'hello_my_name', phrase: 'Hello My Name', words: ['hello', 'my', 'name'] },
    { id: 'nice_meet_you', phrase: 'Nice Meet You', words: ['nice', 'meet', 'you'] },
    { id: 'i_love_you', phrase: 'I Love You', words: ['love', 'you'] },
    { id: 'i_am_happy', phrase: 'I Am Happy', words: ['happy'] },
    { id: 'i_am_sad', phrase: 'I Am Sad', words: ['sad'] },
    { id: 'good_morning', phrase: 'Good Morning', words: ['morning'] },
    { id: 'good_night', phrase: 'Good Night', words: ['night'] },
    { id: 'see_you_tomorrow', phrase: 'See You Tomorrow', words: ['you', 'tomorrow'] },
    { id: 'i_am_hungry', phrase: 'I Am Hungry', words: ['hungry'] },
    { id: 'drink_water', phrase: 'Drink Water', words: ['drink', 'water'] },
    { id: 'my_mother', phrase: 'My Mother', words: ['my', 'mother'] },
    { id: 'my_father', phrase: 'My Father', words: ['my', 'father'] },
    { id: 'brother_sister', phrase: 'Brother Sister', words: ['brother', 'sister'] },
    { id: 'watch_tv', phrase: 'Watch TV', words: ['watch'] },
    { id: 'go_sleep', phrase: 'Go Sleep', words: ['go', 'sleep'] },
    { id: 'i_understand', phrase: 'I Understand', words: ['understand'] },
    { id: 'hot_weather', phrase: 'Hot Weather', words: ['hot', 'weather'] },
    { id: 'cold_weather', phrase: 'Cold Weather', words: ['cold', 'weather'] },
    { id: 'eat_apple', phrase: 'Eat Apple', words: ['eat', 'apple'] },
    { id: 'my_pet_is_a_dog', phrase: 'My Pet Is A Dog', words: ['my', 'pet','dog'] }
];

const CATEGORY_HELP_MESSAGES = {
    dashboard: "Welcome to the Learn page! Here you can explore different categories of sign language. Click on any unlocked category to start your learning journey.",
    alphabets: "Welcome to the Alphabet category! Here you'll learn the basic letter signs. You need to learn at least 5 letters before you can attempt the quiz. Click on any letter to start practicing!",
    numbers: "Welcome to Numbers & Counting! Practice signing numbers 1-20. All levels are unlocked - click on any number to learn its sign. Take the quiz when you're ready!",
    colours: "Welcome to Colours! Learn how to sign different colors. Each tile shows the color you'll be learning. All colors are available - click on any color tile to start!",
    introduce: "Welcome to Introduce Yourself! Learn essential words for introducing yourself and greeting others. You must learn ALL words in this category to unlock the quiz!",
    family: "Welcome to Family Members! Learn signs for different family relationships. Master all family member signs to unlock the quiz and progress further!",
    feelings: "Welcome to Emotions & Feelings! Express your emotions through sign language. Learn all emotion signs to unlock the quiz and continue your journey!",
    actions: "Welcome to Common Actions! Learn signs for everyday activities and actions. Complete all action signs to unlock the quiz!",
    questions: "Welcome to Asking Questions! Learn how to ask important questions in sign language. Master all question words to unlock the quiz!",
    time: "Welcome to Time & Days! Learn signs related to time, days of the week, and time periods. Complete all time-related signs to unlock the quiz!",
    food: "Welcome to Food & Drinks! Learn signs for various foods and beverages. Master all food signs to unlock the quiz!",
    things: "Welcome to Objects & Things! Learn signs for common objects around you. Complete all object signs to unlock the quiz!",
    animals: "Welcome to Animals! Learn signs for different animals. Master all animal signs to unlock the quiz!",
    seasons: "Welcome to Weather & Seasons! Learn signs for weather conditions and seasons. Complete all weather signs to unlock the quiz!",
    phrases: "Welcome to Common Phrases! Learn to combine words into meaningful phrases. Master the art of signing complete thoughts and sentences!"
};

export function Learn() {
    const { stats } = useLearningStats();
    const [selectedSection, setSelectedSection] = useState('dashboard');
    const [currentCategory, setCurrentCategory] = useState(null);
    const [unlockedLevels] = useState(27); 
    const navigate = useNavigate();
    const location = useLocation();
    const [showHelpMessage, setShowHelpMessage] = useState(false);
    const [helpMessageContent, setHelpMessageContent] = useState('');
    const [helpMessagePosition, setHelpMessagePosition] = useState('top-right');

    const [hasSeenHelp, setHasSeenHelp] = useState(() => {
        const saved = localStorage.getItem('learnPageHelpSeen');
        return saved ? JSON.parse(saved) : {};
    });

    console.log(stats);
    const lessonsCompleted = stats?.lessonsCompleted || 0;
    const signsLearned = stats?.signsLearned || 0;
    const quizzesCompleted = stats?.quizzesCompleted || 0;

    const unlockedCategories =  useMemo(() => {
        return stats?.unlockedCategories
        ? [...stats.unlockedCategories, 'numbers', 'colours', 'introduce', 'family', 'feelings', 'actions', 'questions', 'time', 'food', 'things', 'animals', 'seasons', 'phrases']
        : ['alphabets', 'numbers', 'colours', 'introduce', 'family', 'feelings', 'actions', 'questions', 'time', 'food', 'things', 'animals', 'seasons', 'phrases'];
 }, [stats?.unlockedCategories]);
 
    const categories = useMemo(() => [
        { id: 'alphabets', name: 'The Alphabet', unlocked: unlockedCategories.includes('alphabets') },
        { id: 'numbers', name: 'Numbers & Counting', unlocked: unlockedCategories.includes('numbers') },
        { id: 'introduce', name: 'Introduce Yourself', unlocked: unlockedCategories.includes('introduce') },
        { id: 'family', name: 'Family Members', unlocked: unlockedCategories.includes('family') },
        { id: 'feelings', name: 'Emotions & Feelings', unlocked: unlockedCategories.includes('feelings') },
        { id: 'actions', name: 'Common Actions', unlocked: unlockedCategories.includes('actions') },
        { id: 'questions', name: 'Asking Questions', unlocked: unlockedCategories.includes('questions') },
        { id: 'time', name: 'Time & Days', unlocked: unlockedCategories.includes('time') },
        { id: 'food', name: 'Food & Drinks', unlocked: unlockedCategories.includes('food') },
        { id: 'colours', name: 'Colours', unlocked: unlockedCategories.includes('colours') },
        { id: 'things', name: 'Objects & Things', unlocked: unlockedCategories.includes('things') },
        { id: 'animals', name: 'Animals', unlocked: unlockedCategories.includes('animals') },
        { id: 'seasons', name: 'Weather & Seasons', unlocked: unlockedCategories.includes('seasons') },
        { id: 'phrases', name: 'Common Phrases', unlocked: unlockedCategories.includes('phrases') },
    ], [unlockedCategories]);

    const TOTAL_ALPHABET_SIGNS = 26;
    const TOTAL_NUMBER_SIGNS = 20; 
    const TOTAL_COLOUR_SIGNS = COLORS.length;
    const TOTAL_INTRODUCTION_WORDS = INTRODUCTION_WORDS.length;
    const TOTAL_FAMILY_MEMBERS = FAMILY_MEMBERS.length;
    const TOTAL_EMOTIONS_FEELINGS = EMOTIONS_FEELINGS.length;
    const TOTAL_COMMON_ACTIONS = COMMON_ACTIONS.length;
    const TOTAL_ASKING_QUESTIONS = ASKING_QUESTIONS.length;
    const TOTAL_TIME_DAYS = TIME_DAYS.length;
    const TOTAL_FOOD_DRINKS = FOOD_DRINKS.length;
    const TOTAL_OBJECTS_THINGS = OBJECTS_THINGS.length;
    const TOTAL_ANIMALS = ANIMALS.length;
    const TOTAL_SEASONS_WEATHER = SEASONS_WEATHER.length;
    const TOTAL_PHRASES = COMMON_PHRASES.length;

    const TOTAL_SIGNS_AVAILABLE = TOTAL_ALPHABET_SIGNS + TOTAL_NUMBER_SIGNS + TOTAL_COLOUR_SIGNS + TOTAL_INTRODUCTION_WORDS + TOTAL_FAMILY_MEMBERS + TOTAL_EMOTIONS_FEELINGS +
        TOTAL_COMMON_ACTIONS + TOTAL_ASKING_QUESTIONS + TOTAL_TIME_DAYS + TOTAL_FOOD_DRINKS + TOTAL_OBJECTS_THINGS + TOTAL_ANIMALS + TOTAL_SEASONS_WEATHER + TOTAL_PHRASES;

    const TOTAL_LESSONS = 13 * 30; 
    const calcLessonsCompleted = Math.min(lessonsCompleted, TOTAL_LESSONS);
    const calcSignsLearned = Math.min(signsLearned, TOTAL_SIGNS_AVAILABLE); 
    const lessonProgress = (calcLessonsCompleted + calcSignsLearned) / (TOTAL_LESSONS + TOTAL_SIGNS_AVAILABLE) * 100;
    const progressPercent = Math.min(100, Math.round(lessonProgress));

    const saveHelpSeen = (helpKey) => {
        const updated = { ...hasSeenHelp, [helpKey]: true };
        setHasSeenHelp(updated);
        localStorage.setItem('learnPageHelpSeen', JSON.stringify(updated));
    };

    useEffect(() => {
        if (location.state?.selectedCategory) {
            const category = categories.find(cat => cat.id === location.state.selectedCategory);
            if (category) {
                setCurrentCategory(category);
                setSelectedSection('category');
            }
        }
    }, [location.state, categories]);
   
    const goBack = () => {
        setCurrentCategory(null);
        setSelectedSection('dashboard');
        
        if (!hasSeenHelp.dashboard) {
            setTimeout(() => {
                showHelp(CATEGORY_HELP_MESSAGES.dashboard, 'center', 'dashboard');
            }, 300);
        }
    };

    const navigateToSign = (sign, categoryId) => {
        navigate(`/sign/${sign}?category=${categoryId}`, {
            state: { category: categoryId }
        });
    };

    const navigateToPhrase = (phraseId) => {
        navigate(`/phrase/${phraseId}`, {
            state: { category: 'phrases' }
        });
    };
    
    const getQuizRoute = (categoryId) => {
        switch (categoryId) {
            case 'alphabets':
                return '/quiz';
            case 'numbers':
                return '/numbers-quiz';
            case 'introduce':
                return '/introduce-quiz';
            case 'colours':
                return '/colours-quiz';
            case 'family':
                return '/family-quiz';
            case 'feelings':
                return '/feelings-quiz';
            case 'actions':
                return '/actions-quiz';
            case 'questions':   
                return '/questions-quiz';
            case 'time':    
                return '/time-quiz';
            case 'food':
                return '/food-quiz';
            case 'things':
                return '/things-quiz';
            case 'animals':
                return '/animals-quiz';
            case 'seasons':
                return '/seasons-quiz';
            case 'phrases':
                return '/phrases-quiz';
            default:
                return '/quiz'; 
        }
    };

    const showHelp = (message, position, helpKey) => {
        setHelpMessageContent(message);
        setHelpMessagePosition(position);
        setShowHelpMessage(true);
        
        setShowHelpMessage({ message, position, helpKey });
    };

    const handleCloseHelp = () => {
        if (showHelpMessage.helpKey) {
            saveHelpSeen(showHelpMessage.helpKey);
        }
        setShowHelpMessage(false);
    };

    const handleCategoryClick = (category) => {
        if (category.unlocked) {
            setCurrentCategory(category);
            setShowHelpMessage(false);
            
            if (!hasSeenHelp[category.id]) {
                setTimeout(() => {
                    showHelp(CATEGORY_HELP_MESSAGES[category.id], 'center', category.id);
                }, 300);
            }
        } else {
            showHelp(
                `The '${category.name}' category is currently locked. Complete the quiz in the previous category to unlock new ones!`,
                'center',
                `locked_${category.id}`
            );
        }
    };

   useEffect(() => {
        if (!hasSeenHelp.dashboard && selectedSection === 'dashboard' && !currentCategory) {
            setTimeout(() => {
                showHelp(CATEGORY_HELP_MESSAGES.dashboard, 'center', 'dashboard');
            }, 500);
        }
    }, [selectedSection, currentCategory, hasSeenHelp.dashboard]);

    return (
        <div className="duo-app">
            <Sidebar
                onSelect={goBack}
                progressPercent={progressPercent}
                signsLearned={signsLearned}
                lessonsCompleted={lessonsCompleted}
                quizzesCompleted={quizzesCompleted}
            />

            <div className="learn-main-content relative">
                {selectedSection === 'dashboard' && !currentCategory && (
                    <div className="dashboard">
                        <div className="category-tiles">
                            {categories.map(cat => (
                                <CategoryTile
                                    key={cat.id}
                                    name={cat.name}
                                    unlocked={cat.unlocked}
                                    onClick={() => handleCategoryClick(cat)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {currentCategory && (
                    <div className="category-levels">
                        <h2>{currentCategory.name} Levels </h2>
                        <div className={`stepping-poles ${currentCategory.id === 'phrases' ? 'phrases-layout' : ''}`}>

                            {currentCategory.id === 'alphabets' ? (
                                <>
                                    {[...Array(26)].map((_, index) => (
                                        <LevelTile
                                            key={index}
                                            level={String.fromCharCode(65 + index)}
                                            unlocked={index < unlockedLevels}
                                            onClick={() => navigateToSign(String.fromCharCode(65 + index), 'alphabets')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'quiz'}
                                        level={'Quiz'}
                                        unlocked={signsLearned >= 5} 
                                        onClick={() => {
                                            if (signsLearned >= 5) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn at least 5 signs in the Alphabet category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'alphabet_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: signsLearned >= 5 ? '#ffc107' : '#ccc',
                                            color: signsLearned >= 5 ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ) : currentCategory.id === 'numbers' ? (
                                <>
                                    {[...Array(20)].map((_, index) => (
                                        <LevelTile
                                            key={index + 1}
                                            level={(index + 1).toString()}
                                            unlocked={true} 
                                            onClick={() => navigateToSign((index + 1).toString(), 'numbers')}
                                        />
                                    ))}

                                    <LevelTile
                                        key={'numbers-quiz'}
                                        level={'Quiz'}
                                        unlocked={true} 
                                        onClick={() => navigate(getQuizRoute(currentCategory.id))}
                                        style={{
                                            backgroundColor: '#ffc107',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ) : currentCategory.id === 'colours' ? (
                                <>
                                    {COLORS.map((color) => (
                                        <LevelTile
                                            key={color}
                                            level={color}
                                            unlocked={true} 
                                            className="color-tile"
                                            style={{
                                                '--color-bg': color.toLowerCase(),
                                                '--color-text': ['Black', 'Navy', 'Purple', 'Brown', 'Grey'].includes(color) ? '#fff' : '#333',
                                                backgroundColor: color.toLowerCase(),
                                                backgroundImage: 'none',
                                                color: ['Black', 'Navy', 'Purple', 'Brown', 'Grey'].includes(color) ? '#fff' : '#333'
                                            }}
                                            onClick={() => navigateToSign(color.toLowerCase(), 'colours')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'colours-quiz'}
                                        level={'Quiz'}
                                        unlocked={true} 
                                        onClick={() => navigate(getQuizRoute(currentCategory.id))}
                                        style={{
                                            background: 'linear-gradient(45deg,rgb(255, 63, 63), #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
                                            backgroundSize: '200% 200%',
                                            animation: 'rainbow 3s ease infinite',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                                        }}
                                    />
                                </>
                            ) : currentCategory.id === 'phrases' ? (
                                <>
                                    {COMMON_PHRASES.map((phrase) => (

                                        <div
                                            key={phrase.id}
                                            className="level-card phrase-card unlocked"
                                            onClick={() => navigateToPhrase(phrase.id)}
                                        >
                                            <div className="phrase-content">
                                                <div className="phrase-icon">
                                                    💬
                                                </div>
                                                <div className="phrase-text">
                                                    <h3 className="phrase-title">{phrase.phrase}</h3>
                                                    <p className="phrase-subtitle">Learn this common phrase</p>
                                                </div>
                                            </div>
                                            <div className="phrase-arrow">→</div>
                                        </div>
                                    ))}
                                    <div
                                        className={`level-card phrase-card phrase-quiz ${
                                            COMMON_PHRASES.every(phrase => stats?.learnedPhrases?.includes(phrase.id))
                                                ? 'unlocked' 
                                                : 'locked'
                                        }`}

                                        onClick={() => {
                                            if (COMMON_PHRASES.every(phrase => stats?.learnedPhrases?.includes(phrase.id))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all phrases in the 'Common Phrases' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'phrases_quiz_locked'
                                                );
                                            }
                                        }}

                                    >
                                        <div className="phrase-content">
                                            <div className="phrase-icon">
                                              
                                            </div>
                                            <div className="phrase-text">
                                                <h3 className="phrase-title">Phrases Quiz</h3>
                                                <p className="phrase-subtitle">
                                                    {COMMON_PHRASES.every(phrase => stats?.learnedPhrases?.includes(phrase.id))
                                                        ? 'Test your phrase knowledge!'
                                                        : 'Complete all phrases to unlock'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="phrase-arrow"> →</div>
                                    </div>

                                </>
                            ) : currentCategory.id === 'introduce' ? ( 
                                <>
                                    {INTRODUCTION_WORDS.map((word) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigateToSign(word.toLowerCase(), 'introduce')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'introduce-quiz'}
                                        level={'Quiz'}
                                        unlocked={
                                            INTRODUCTION_WORDS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))
                                        }
                                        onClick={() => {
                                            if (INTRODUCTION_WORDS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all words in the 'Introduce Yourself' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'introduce_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: INTRODUCTION_WORDS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                            color: INTRODUCTION_WORDS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ) :  currentCategory.id === 'family' ? ( 
                                <>
                                    {FAMILY_MEMBERS.map((word) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigateToSign(word.toLowerCase(), 'family')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'family-quiz'}
                                        level={'Quiz'}
                                        unlocked={
                                            FAMILY_MEMBERS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))
                                        }
                                        onClick={() => {
                                            if (FAMILY_MEMBERS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all words in the 'Family Member' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'family_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: FAMILY_MEMBERS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                            color: FAMILY_MEMBERS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ):
                            currentCategory.id === 'feelings' ? ( 
                                <>
                                    {EMOTIONS_FEELINGS.map((word) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigateToSign(word.toLowerCase(), 'feelings')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'feelings-quiz'}
                                        level={'Quiz'}
                                        unlocked={
                                            EMOTIONS_FEELINGS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))
                                        }
                                        onClick={() => {
                                            if (EMOTIONS_FEELINGS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all words in the 'Emotions and Feelings' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'feelings_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: EMOTIONS_FEELINGS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                            color: EMOTIONS_FEELINGS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ):
                            currentCategory.id === 'actions' ? ( 
                                <>
                                    {COMMON_ACTIONS.map((word) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigateToSign(word.toLowerCase(), 'actions')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'actions-quiz'}
                                        level={'Quiz'}
                                        unlocked={
                                            COMMON_ACTIONS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))
                                        }
                                        onClick={() => {
                                            if (COMMON_ACTIONS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all words in the 'Common Actions' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'actions_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: COMMON_ACTIONS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                            color: COMMON_ACTIONS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ):
                            currentCategory.id === 'questions' ? ( 
                                <>
                                    {ASKING_QUESTIONS.map((word) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigateToSign(word.toLowerCase(), 'questions')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'questions-quiz'}
                                        level={'Quiz'}
                                        unlocked={
                                            ASKING_QUESTIONS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))
                                        }
                                        onClick={() => {
                                            if (ASKING_QUESTIONS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all words in the 'Asking Questions' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'questions_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: ASKING_QUESTIONS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                            color: ASKING_QUESTIONS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ): 
                            currentCategory.id === 'time' ? ( 
                                <>
                                    {TIME_DAYS.map((word) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigateToSign(word.toLowerCase(), 'time')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'time-quiz'}
                                        level={'Quiz'}
                                        unlocked={
                                            TIME_DAYS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))
                                        }
                                        onClick={() => {
                                            if (TIME_DAYS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all words in the 'Time and Days' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'time_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: TIME_DAYS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                            color: TIME_DAYS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ):
                            currentCategory.id === 'food' ? ( 
                                <>
                                    {FOOD_DRINKS.map((word) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigateToSign(word.toLowerCase(), 'food')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'food-quiz'}
                                        level={'Quiz'}
                                        unlocked={
                                            FOOD_DRINKS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))
                                        }
                                        onClick={() => {
                                            if (FOOD_DRINKS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all words in the 'Food and Drinks' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'food_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: FOOD_DRINKS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                            color: FOOD_DRINKS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ):
                            currentCategory.id === 'things' ? ( 
                                <>
                                    {OBJECTS_THINGS.map((word) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigateToSign(word.toLowerCase(), 'things')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'things-quiz'}
                                        level={'Quiz'}
                                        unlocked={
                                            OBJECTS_THINGS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))
                                        }
                                        onClick={() => {
                                            if (OBJECTS_THINGS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all words in the 'Object and Things' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'things_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: OBJECTS_THINGS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                            color: OBJECTS_THINGS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ):
                            currentCategory.id === 'animals' ? ( 
                                <>
                                    {ANIMALS.map((word) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigateToSign(word.toLowerCase(), 'animals')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'animals-quiz'}
                                        level={'Quiz'}
                                        unlocked={
                                            ANIMALS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))
                                        }
                                        onClick={() => {
                                            if (ANIMALS.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all words in the 'Animals' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'animals_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: ANIMALS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                            color: ANIMALS.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ): currentCategory.id === 'seasons' ? ( 
                                <>
                                    {SEASONS_WEATHER.map((word) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigateToSign(word.toLowerCase(), 'seasons')}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'seasons-quiz'}
                                        level={'Quiz'}
                                        unlocked={
                                            SEASONS_WEATHER.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))
                                        }
                                        onClick={() => {
                                            if (SEASONS_WEATHER.every(word => stats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                showHelp(
                                                    `You need to learn all words in the 'Seasons and Weather' category to unlock this quiz. Keep practicing!`,
                                                    'center',
                                                    'seasons_quiz_locked'
                                                );
                                            }
                                        }}
                                        style={{
                                            backgroundColor: SEASONS_WEATHER.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                            color: SEASONS_WEATHER.every(word => stats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            ):
                            (
                               
                                <>
                                    {[...Array(5)].map((_, index) => (
                                        <LevelTile
                                            key={index}
                                            level={`Level ${index + 1}`}
                                            unlocked={true} 
                                            onClick={() => navigate(`/${currentCategory.id}/level/${index + 1}`)}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'category-quiz'}
                                        level={'Quiz'}
                                        unlocked={true}
                                        onClick={() => navigate(getQuizRoute(currentCategory.id))}
                                        style={{
                                            backgroundColor: '#ffc107',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <button onClick={goBack} className="back-button">← Back</button>
                    </div>
                )}

                {showHelpMessage && (
                    <HelpMessage
                        message={showHelpMessage.message || helpMessageContent}
                        position={showHelpMessage.position || helpMessagePosition}
                        onClose={handleCloseHelp}
                    />
                )}
            </div>
        </div>
    );
}