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
        ? [...stats.unlockedCategories, 'numbers', 'colours']
        : ['alphabets', 'numbers', 'colours'];

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

   const TOTAL_LEVELS = 12;
    const LESSONS_PER_LEVEL = 30;
    const TOTAL_LESSONS = TOTAL_LEVELS * LESSONS_PER_LEVEL;
    const TOTAL_SIGNS = 26; 
    const calcLessonsCompleted = Math.min(lessonsCompleted, TOTAL_LESSONS);
    const calcSignsLearned = Math.min(signsLearned, TOTAL_SIGNS);
    const lessonProgress = (calcLessonsCompleted + calcSignsLearned) / (TOTAL_LESSONS + TOTAL_SIGNS) * 100;
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
            } else {
                message = `To unlock the quiz for ${currentCategory.name}, you must complete all lessons in this category. Once the quiz is completed, new categories might unlock!`;
            }
            showHelp(message, 'bottom-right');  }
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
                                            onClick={() => navigate(`/number/${i + 1}`)}
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
                                            onClick={() => navigate(`/colour/${color.toLowerCase()}`)}
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