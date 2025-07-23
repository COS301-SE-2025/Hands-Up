import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/learnSidebar';
import { CategoryTile } from '../components/learnCategoryTile';
import { LevelTile } from '../components/learnLevelTile';
import '../styles/learn.css';
import { useLearningStats } from '../contexts/learningStatsContext';
import ModelViewer from '../components/mascotModelViewer'


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
                    <ModelViewer modelPath={'/models/angieWaving.glb'} />
                </div>

                <p className="text-gray-800 text-lg text-center font-medium mb-6 leading-relaxed">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="
                        bg-gradient-to-r from-blue-500 to-blue-700 
                        hover:from-blue-600 hover:to-blue-800 
                        text-white font-bold py-3 px-8 rounded-full 
                        transition duration-300 ease-in-out 
                        transform hover:scale-105 active:scale-95 
                        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75
                        shadow-lg hover:shadow-xl
                        text-lg tracking-wide
                    "
                >
                    Okay!
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
     'siblings','boy','girl',];

const EMOTIONS_FEELINGS = ['happy', 'sad', 'angry','cry','hurt', 'sorry', 'like', 'love', 'hate', 'feel'];

const COMMON_ACTIONS = ['drive', 'watch', 'sleep', 'walk', 'stand', 'sit', 'give', 'understand', 'go', 'stay',
    'talk'];

const ASKING_QUESTIONS = ['why', 'tell', 'when', 'who', 'which'];

const TIME_DAYS = ['morning', 'afternoon', 'evening', 'night', 'today', 'tomorrow', 'yesterday', 'year',
    'now', 'future','Oclock', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FOOD_DRINKS = ['water', 'apple', 'drink', 'cereal', 'eggs', 'eat', 'hungry', 'full', 'cup',
    'popcorn', 'candy', 'soup','drink', 'juice', 'milk', 'pizza'];

const OBJECTS_THINGS = ['shower', 'table', 'lights', 'computer', 'hat', 'chair', 'car',
    'ambulance', 'window'];

const ANIMALS = ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'animal'];

const SEASONS_WEATHER = ['spring', 'summer', 'autumn', 'winter', 'sun', 'rain', 'cloudy', 'snow',
    'wind', 'sunrise', 'hot', 'cold', 'warm', 'cool','weather', 'freeze'];



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
        ? [...stats.unlockedCategories, 'numbers', 'colours', 'introduce', 'family', 'feelings', 'actions', 'questions', 'time', 'food', 'things', 'animals', 'seasons']
        : ['alphabets', 'numbers', 'colours', 'introduce', 'family', 'feelings', 'actions', 'questions', 'time', 'food', 'things', 'animals', 'seasons'];

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
                            ) :  currentCategory.id === 'family' ? ( 
                                <>
                                    {FAMILY_MEMBERS.map((word, i) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${word.toLowerCase()}`)}
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
                                                    'center'
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
                                    {EMOTIONS_FEELINGS.map((word, i) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${word.toLowerCase()}`)}
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
                                                    'center'
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
                                    {COMMON_ACTIONS.map((word, i) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${word.toLowerCase()}`)}
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
                                                    'center'
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
                                    {ASKING_QUESTIONS.map((word, i) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${word.toLowerCase()}`)}
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
                                                    'center'
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
                                    {TIME_DAYS.map((word, i) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${word.toLowerCase()}`)}
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
                                                    'center'
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
                                    {FOOD_DRINKS.map((word, i) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${word.toLowerCase()}`)}
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
                                                    'center'
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
                                    {OBJECTS_THINGS.map((word, i) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${word.toLowerCase()}`)}
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
                                                    'center'
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
                                    {ANIMALS.map((word, i) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${word.toLowerCase()}`)}
                                        />
                                    ))}
                                    <LevelTile
                                        key={'actions-quiz'}
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
                                                    'center'
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
                                    {SEASONS_WEATHER.map((word, i) => (
                                        <LevelTile
                                            key={word}
                                            level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                            unlocked={true} 
                                            onClick={() => navigate(`/sign/${word.toLowerCase()}`)}
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
                                                    'center'
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
