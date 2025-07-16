import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/learnSidebar';
import { CategoryTile } from '../components/learnCategoryTile';
import { LevelTile } from '../components/learnLevelTile';
import '../styles/learn.css';
import { useLearningStats } from '../contexts/learningStatsContext';


const HelpMessage = ({ message, position, onClose }) => {
    if (!message) return null;

    let positionClasses = '';
    switch (position) {
        case 'top-right':
            positionClasses = 'top-4 right-4';
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
           positionClasses = 'top-4 right-4';
    }

    return (
      <div className={`help-message-overlay fixed z-50 p-4 rounded-lg shadow-lg flex items-start ${positionClasses}`}>
            <div className="help-icon flex-shrink-0 mr-3">
            </div>
           <div className="flex-grow">
                <p className="text-gray-800 text-base mb-3">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Okay
                </button>
            </div>
        </div>
    );
};

const COLORS = [
    'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple',
    'Orange', 'Brown', 'Grey', 'Cyan', 'Magenta', 'Lime', 'Gold', 'Silver'
];

const INTRODUCTION_WORDS = ['hello', 'name', 'my','again', 'goodbye', 'nice', 'meet', 'you', 'this', 'sorry', 'and'];

const FAMILY_MEMBERS = ['brother', 'sister', 'mother','father', 'aunt', 'uncle', 'grandma', 'grandpa', 'child',
     'siblings', 'parents', 'family', 'son', 'daughter', 'cousin', 'nephew', 'niece','boy','girl','stepmother', 'stepfather', 'stepbrother', 'stepsister'];

const EMOTIONS_FEELINGS = ['happy', 'sad', 'angry', 'excited', 'bored', 'tired', 'scared', 'nervous', 'confused',
    'surprised', 'proud', 'embarrassed', 'disappointed', 'relaxed', 'curious', 'hopeful', 'grateful', 'jealous',
    'lonely', 'ashamed', 'anxious', 'content', 'frustrated', 'overwhelmed'];

const COMMON_ACTIONS = ['eat', 'drink', 'sleep', 'walk', 'run', 'sit', 'stand', 'talk', 'listen', 'read',
    'write', 'play', 'work', 'study', 'watch', 'help', 'clean', 'cook', 'drive', 'travel', 'exercise',
    'dance', 'sing', 'draw', 'paint', 'build', 'fix', 'shop', 'call', 'text'];

const ASKING_QUESTIONS = ['who', 'what', 'where', 'when', 'why', 'how', 'which', 'whose', 'can', 'could',
    'will', 'would', 'should', 'may', 'might', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'has',
    'have', 'had', 'shall', 'must'];

const TIME_DAYS = ['morning', 'afternoon', 'evening', 'night', 'today', 'tomorrow', 'yesterday', 'week',
    'month', 'year', 'day', 'hour', 'minute', 'second', 'now', 'soon', 'later', 'early', 'late',
    'schedule', 'time', 'clock', 'calendar', 'date', 'weekend'];

const FOOD_DRINKS = ['water', 'bread', 'rice', 'meat', 'fish', 'fruit', 'vegetable', 'snack', 'dessert',
    'breakfast', 'lunch', 'dinner', 'meal', 'drink', 'juice', 'soda', 'coffee', 'tea', 'milk',
    'soup', 'salad', 'sandwich', 'pizza', 'burger', 'cake', 'ice cream', 'chocolate'];

const OBJECTS_THINGS = ['book', 'pen', 'phone', 'computer', 'table', 'chair', 'car', 'house',
    'bag', 'watch', 'key', 'bottle', 'glass', 'lamp', 'window', 'door', 'picture', 'clock'];

const ANIMALS = ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'sheep', 'pig', 'chicken'];

const SEASONS_WEATHER = ['spring', 'summer', 'autumn', 'winter', 'sunny', 'rainy', 'cloudy', 'snowy',
    'windy', 'stormy', 'hot', 'cold', 'warm', 'cool', 'foggy', 'hail', 'thunder', 'lightning',
    'weather', 'forecast', 'climate'];



export function Learn() {
    const { stats } = useLearningStats();
    const [selectedSection, setSelectedSection] = useState('dashboard');
    const [currentCategory, setCurrentCategory] = useState(null);
    const [unlockedLevels] = useState(27); 
    const navigate = useNavigate();
    const [showHelpMessage, setShowHelpMessage] = useState(false);
    const [helpMessageContent, setHelpMessageContent] = useState('');
    const [helpMessagePosition, setHelpMessagePosition] = useState('top-right');

    const [hasSeenInitialDashboardHelp, setHasSeenInitialDashboardHelp] = useState(
        localStorage.getItem('hasSeenInitialDashboardHelp') === 'true'
    );
    const [hasSeenCategoryQuizHelp, setHasSeenCategoryQuizHelp] = useState(
        JSON.parse(localStorage.getItem('hasSeenCategoryQuizHelp') || '{}')
    );

    console.log(stats);
    const lessonsCompleted = stats?.lessonsCompleted || 0;
    const signsLearned = stats?.signsLearned || 0;
    const quizzesCompleted = stats?.quizzesCompleted || 0;

    const unlockedCategories = stats?.unlockedCategories
        ? [...stats.unlockedCategories, 'numbers', 'colours', 'introduce']
        : ['alphabets', 'numbers', 'colours', 'introduce'];

    const categories = [
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
    ];

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


    const TOTAL_SIGNS_AVAILABLE = TOTAL_ALPHABET_SIGNS + TOTAL_NUMBER_SIGNS + TOTAL_COLOUR_SIGNS + TOTAL_INTRODUCTION_WORDS + TOTAL_FAMILY_MEMBERS + TOTAL_EMOTIONS_FEELINGS +
        TOTAL_COMMON_ACTIONS + TOTAL_ASKING_QUESTIONS + TOTAL_TIME_DAYS + TOTAL_FOOD_DRINKS + TOTAL_OBJECTS_THINGS + TOTAL_ANIMALS + TOTAL_SEASONS_WEATHER;

    const TOTAL_LESSONS = 12 * 30; 
    const calcLessonsCompleted = Math.min(lessonsCompleted, TOTAL_LESSONS);
    const calcSignsLearned = Math.min(signsLearned, TOTAL_SIGNS_AVAILABLE); 
    const lessonProgress = (calcLessonsCompleted + calcSignsLearned) / (TOTAL_LESSONS + TOTAL_SIGNS_AVAILABLE) * 100;
    const progressPercent = Math.min(100, Math.round(lessonProgress));

   
    const goBack = () => {
        setCurrentCategory(null);
        setSelectedSection('dashboard');
        if (!hasSeenInitialDashboardHelp) {
            showHelp(
                "Welcome to the Learn page! Here you can explore different categories of sign language. Click on an unlocked category to start your learning journey.",
                'top-right'
            );
        }
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
            default:
                return '/quiz'; 
        }
    };


    const showHelp = (message, position) => {
        setHelpMessageContent(message);
        setHelpMessagePosition(position);
        setShowHelpMessage(true);
    };

 
    const handleCloseHelp = (messageType) => {
        setShowHelpMessage(false);
        if (messageType === 'dashboard') {
            setHasSeenInitialDashboardHelp(true);
            localStorage.setItem('hasSeenInitialDashboardHelp', 'true');
        } else if (messageType === 'categoryQuiz' && currentCategory) {
            const updatedSeen = { ...hasSeenCategoryQuizHelp, [currentCategory.id]: true };
            setHasSeenCategoryQuizHelp(updatedSeen);
            localStorage.setItem('hasSeenCategoryQuizHelp', JSON.stringify(updatedSeen));
        }
    };

    useEffect(() => {
        if (!hasSeenInitialDashboardHelp && selectedSection === 'dashboard' && !currentCategory) {
            showHelp(
                "Welcome to the Learn page! Here you can explore different categories of sign language. Click on an unlocked category to start your learning journey.",
                'top-right'
            );
        }
    }, [selectedSection, currentCategory, hasSeenInitialDashboardHelp]);

    useEffect(() => {
       if (currentCategory && !hasSeenCategoryQuizHelp[currentCategory.id]) {
            let message = "";
            if (currentCategory.id === 'alphabets') {
                message = `In the ${currentCategory.name} category, you need to learn at least 5 signs before you can attempt the quiz. Complete the lessons to unlock it!`;
            } else if (currentCategory.id === 'introduce') {
                message = `To unlock the quiz for ${currentCategory.name}, you must learn all words in this category. Once the quiz is completed, new categories might unlock!`;
            }
            else {
                message = `To unlock the quiz for ${currentCategory.name}, you must complete all lessons in this category. Once the quiz is completed, new categories might unlock!`;
            }
            showHelp(message, 'bottom-right');
        }
    }, [currentCategory, hasSeenCategoryQuizHelp]);

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
                                    onClick={() => {
                                        if (cat.unlocked) {
                                            setCurrentCategory(cat);
                                            setShowHelpMessage(false);
                                        } else {
                                            showHelp(
                                                `The '${cat.name}' category is currently locked. Complete the quiz in the previous category to unlock new ones!`,
                                                'center'
                                            );
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {currentCategory && (
                    <div className="category-levels">
                        <h2>{currentCategory.name} Levels</h2>
                        <div className="stepping-poles">

                            {currentCategory.id === 'alphabets' ? (
                                <>
                                    {[...Array(26)].map((_, i) => (
                                        <LevelTile
                                            key={i}
                                            level={String.fromCharCode(65 + i)}
                                            unlocked={i < unlockedLevels}
                                            onClick={() => navigate(`/sign/${String.fromCharCode(65 + i)}`)}
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
                                                    'center'
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
                                    {[...Array(20)].map((_, i) => (
                                        <LevelTile
                                            key={i + 1}
                                            level={(i + 1).toString()}
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${i + 1}`)} 
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
                                    {COLORS.map((color, i) => (
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
                                            onClick={() => navigate(`/sign/${color.toLowerCase()}`)} 
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
                            ) : currentCategory.id === 'introduce' ? ( 
                                <>
                                    {INTRODUCTION_WORDS.map((word, i) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${word.toLowerCase()}`)}
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
                                                    'center'
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
                            ) : (
                               
                                <>
                                    {[...Array(5)].map((_, i) => (
                                        <LevelTile
                                            key={i}
                                            level={`Level ${i + 1}`}
                                            unlocked={true} 
                                            onClick={() => navigate(`/${currentCategory.id}/level/${i + 1}`)}
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
                        message={helpMessageContent}
                        position={helpMessagePosition}
                        onClose={() => {
                            if (helpMessageContent.includes("Welcome to the Learn page!")) {
                                handleCloseHelp('dashboard');
                            } else if (helpMessageContent.includes("To unlock the quiz for") || helpMessageContent.includes("You need to learn at least 5 signs")) {
                                handleCloseHelp('categoryQuiz');
                            } else {
                                setShowHelpMessage(false);
                            }
                        }}

                    />
                )}
            </div>
        </div>
    );
}
