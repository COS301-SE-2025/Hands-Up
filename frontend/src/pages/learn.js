import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/learnSidebar';
import { CategoryTile } from '../components/learnCategoryTile';
import { LevelTile } from '../components/learnLevelTile';
import '../styles/learn.css';
import { useLearningStats } from '../contexts/learningStatsContext';
import { AngieSigns } from '../components/angieSigns';
import { Canvas } from '@react-three/fiber';
import PropTypes from 'prop-types';
import PlacementTest from '../components/placementTest';

const landmarks = {};

const CATEGORY_PROGRESSION = [
    'alphabets',     
    'numbers',      
    'introduce',  
    'colours',   
    'family',    
    'feelings', 
    'actions',    
    'questions',    
    'time',       
    'food',        
    'things',       
    'animals',      
    'seasons',     
    'phrases',      
];

const HelpMessage = ({ message, onClose, position }) => {
    const [webglError, setWebglError] = useState(false);

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

    const handleCanvasError = (error) => {
        console.warn('WebGL Canvas error:', error);
        setWebglError(true);
    };

    const checkWebGLSupport = () => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch {
            return false;
        }
    };

    const hasWebGL = checkWebGLSupport();

    return (
       <div className="help-message-backdrop fixed inset-0 bg-black bg-opacity-50 z-[9998] animate-fadeIn">
            <div className={`help-message-overlay fixed z-[9999] p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 border border-gray-200 ${positionClasses} animate-fadeInScale max-w-[90vw] sm:max-w-md`}>
                <div className="w-full max-w-[150px] sm:max-w-[200px] h-[150px] sm:h-[200px] rounded-xl bg-white shadow-md mb-4 flex items-center justify-center">
                    {hasWebGL && !webglError ? (
                        <Canvas 
                            camera={{ position: [0, 0.2, 3], fov: 30 }}
                            onError={handleCanvasError}
                            gl={{ 
                                antialias: false,
                                powerPreference: "default",
                                failIfMajorPerformanceCaveat: false 
                            }}
                        >
                            {/* eslint-disable react/no-unknown-property */}
                            <ambientLight intensity={5} />
                            {/* eslint-disable react/no-unknown-property */}
                            <group position={[0, -1.1, 0]}>
                                <AngieSigns landmarks={landmarks} />
                            </group>
                        </Canvas>
                    ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                            <div className="text-center">
                                <div className="text-4xl mb-2"></div>
                                <div className="text-sm text-gray-600 font-medium">HandsUP</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {!hasWebGL ? 'WebGL not available' : 'Using fallback display'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-gray-800 text-base sm:text-lg text-center font-medium mb-4 sm:mb-6 leading-relaxed max-w-md px-2">
                    {message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                       onClick={onClose}
                       className="btn-secondary text-sm sm:text-base px-4 py-2"
                      >
                      Okay
                    </button>
                </div>
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
const FAMILY_MEMBERS = ['brother', 'sister', 'mother','father', 'aunt', 'uncle', 'grandma', 'grandpa', 'child', 'siblings','boy','girl'];
const EMOTIONS_FEELINGS = ['happy', 'sad', 'angry','cry', 'sorry', 'like', 'love', 'hate', 'feel'];
const COMMON_ACTIONS = ['drive', 'watch','see', 'sleep', 'walk', 'stand', 'sit', 'give', 'understand', 'go', 'stay', 'talk'];
const ASKING_QUESTIONS = ['why', 'tell', 'when', 'who', 'which'];
const TIME_DAYS = [ 'today', 'tomorrow', 'yesterday', 'year', 'now', 'future','Oclock', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FOOD_DRINKS = ['water', 'apple', 'drink', 'cereal', 'eggs', 'eat', 'hungry', 'full', 'cup', 'popcorn', 'candy', 'soup','drink', 'juice', 'milk', 'pizza'];
const OBJECTS_THINGS = ['shower', 'table', 'lights', 'computer', 'hat', 'chair', 'car', 'ambulance', 'window'];
const ANIMALS = ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'animal'];
const SEASONS_WEATHER = ['spring', 'summer', 'autumn', 'winter', 'sun', 'rain', 'snow', 'wind', 'sunrise', 'hot', 'cold', 'warm', 'cool','weather', 'freeze'];

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
    { id: 'go_sleep', phrase: 'Go Sleep', words: ['goSleep'] },
    { id: 'i_understand', phrase: 'I Understand', words: ['meUnderstand'] },
    { id: 'hot_weather', phrase: 'Hot Weather', words: ['hotWeather'] },
    { id: 'cold_weather', phrase: 'Cold Weather', words: ['coldWeather'] },
    { id: 'eat_apple', phrase: 'Eat an Apple', words: ['eatApple'] },
    { id: 'my_pet_is_a_dog', phrase: 'My Pet Is A Dog', words: ['myPetDog'] }
];

const CATEGORY_HELP_MESSAGES = {
    welcome: "Welcome to HandsUP! Here you'll learn sign language through interactive lessons and quizzes. We'll start with a quick placement test to assess your current knowledge and unlock the right categories for your level. This ensures you get the best learning experience tailored just for you!",
    dashboard:"Welcome to the Learn page! Here you'll find interactive lessons and quizzes to help you master sign language. Each category builds upon the previous one, so complete quizzes to unlock new content!",
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
    const { stats, completePlacementTest, markHelpSeen, isLoading, hasLoadedFromBackend, updateStats } = useLearningStats();
    const [selectedSection, setSelectedSection] = useState('dashboard');
    const [currentCategory, setCurrentCategory] = useState(null);
    const [unlockedLevels] = useState(27); 
    const navigate = useNavigate();
    const location = useLocation();
    const [showHelpMessage, setShowHelpMessage] = useState(false);
    const [showPlacementTest, setShowPlacementTest] = useState(false);

    const hasShownWelcomeThisSessionRef = useRef(false);
    const hasShownDashboardThisSessionRef = useRef(false);
    const shownCategoryHelpRef = useRef(new Set());
    const currentCategoryRef = useRef(null);
    const hasProcessedLocationStateRef = useRef(false);
    const initializationCompleteRef = useRef(false);
    
useEffect(() => {
    currentCategoryRef.current = currentCategory;
}, [currentCategory]);

    const normalizedStats = useMemo(() => {
        if (!stats) return null;
        
        let actualStats = stats;
        const hasNestedStructure = Object.keys(stats).some(key => !isNaN(parseInt(key)));
        
        if (hasNestedStructure) {
            const numericKeys = Object.keys(stats).filter(key => !isNaN(parseInt(key)));
            if (numericKeys.length > 0) {
                actualStats = stats[numericKeys[0]] || stats;
            }
        }
        
        return actualStats;
    }, [stats]);

    const isNewUser = useMemo(() => {
        if (!normalizedStats) return true;
        
        if (normalizedStats.isNewUser !== undefined) {
            return normalizedStats.isNewUser;
        }
        
        const hasAnyProgress = normalizedStats.placementTestCompleted || 
                              (normalizedStats.lessonsCompleted || 0) > 0 || 
                              (normalizedStats.signsLearned || 0) > 0 || 
                              (normalizedStats.learnedSigns || []).length > 0;
        
        return !hasAnyProgress;
    }, [normalizedStats]);

    useEffect(() => {
        if (!normalizedStats || isLoading || !hasLoadedFromBackend || initializationCompleteRef.current) {
            console.log('Initialization skipped:', { 
                hasStats: !!normalizedStats, 
                isLoading, 
                hasLoadedFromBackend, 
                initializationComplete: initializationCompleteRef.current 
            });
            return;
        }

        console.log('=== LEARN COMPONENT INITIALIZATION ===');
        console.log('Normalized stats unlockedCategories:', normalizedStats.unlockedCategories);
        console.log('isNewUser:', isNewUser);
        console.log('placementTestCompleted:', normalizedStats.placementTestCompleted);
        console.log('hasSeenWelcome:', normalizedStats.hasSeenWelcome);

        initializationCompleteRef.current = true;

        if (isNewUser && !normalizedStats.hasSeenWelcome && !hasShownWelcomeThisSessionRef.current && !normalizedStats.placementTestCompleted) {
            console.log('Showing welcome message for truly new user');
            hasShownWelcomeThisSessionRef.current = true;
            setTimeout(() => {
                setShowHelpMessage({ 
                    message: CATEGORY_HELP_MESSAGES.welcome, 
                    position: 'center', 
                    helpKey: 'welcome' 
                });
            }, 500);
        }
        else if (isNewUser && normalizedStats.hasSeenWelcome && !normalizedStats.placementTestCompleted && !hasShownWelcomeThisSessionRef.current) {
            console.log('User has seen welcome, showing placement test directly');
            hasShownWelcomeThisSessionRef.current = true;
            setTimeout(() => {
                setShowPlacementTest(true);
            }, 500);
        }

        console.log('=== INITIALIZATION COMPLETE ===');
    }, [normalizedStats, isLoading, hasLoadedFromBackend, isNewUser]);

    const handleClosePlacementTest = () => {
        console.log('=== PLACEMENT TEST CLOSED (X BUTTON) ===');
        setShowPlacementTest(false);
        
        if (isNewUser && !normalizedStats?.placementTestCompleted) {
            markHelpSeen('welcome');
        }
    };

const handlePlacementComplete = async (results) => {
    console.log('=== PLACEMENT TEST COMPLETED ===');
    console.log('Results:', results);
    
    completePlacementTest(results, true); 
    
    setShowPlacementTest(false);

    setTimeout(() => {
        setShowHelpMessage({ 
            message: `Placement test complete! Based on your results, you're starting at ${results.startingLevel} level with ${results.unlockedCategories.length} categories unlocked. Great job!`,
            position: 'center',
            helpKey: 'placement_complete'
        });
    }, 500);
};

const handlePlacementSkip = async (results) => {
    console.log('=== PLACEMENT TEST SKIPPED ===');
    console.log('Results:', results);
    
   completePlacementTest({
        ...results,
        unlockedCategories: ['alphabets'],
        skipMerge: true 
    });
    
    setShowPlacementTest(false);

    setTimeout(() => {
        setShowHelpMessage({ 
            message: "Welcome! Since you skipped the placement test, you'll start from the beginning with the Alphabet category. You can always retake the placement test later!",
            position: 'center',
            helpKey: 'placement_skipped'
        });
    }, 500);
};

 

    const unlockedCategories = useMemo(() => {
        console.log('=== Computing unlocked categories ===');
        console.log('Backend unlockedCategories:', normalizedStats?.unlockedCategories);
        
        if (!normalizedStats) {
            console.log('No stats available, defaulting to alphabets only');
            return ['alphabets'];
        }
        
        let finalUnlocked = ['alphabets'];
        const backendUnlocked = normalizedStats.unlockedCategories;
        
        if (backendUnlocked && Array.isArray(backendUnlocked) && backendUnlocked.length > 0) {
            finalUnlocked = [...new Set([...finalUnlocked, ...backendUnlocked])];
            console.log('Merged unlocked categories with backend:', finalUnlocked);
        }
        
        for (let i = 0; i < CATEGORY_PROGRESSION.length - 1; i++) {
            const currentCategory = CATEGORY_PROGRESSION[i];
            const nextCategory = CATEGORY_PROGRESSION[i + 1];
            const quizKey = `${currentCategory}QuizCompleted`;
            
            if (finalUnlocked.includes(currentCategory) && normalizedStats[quizKey]) {
                if (!finalUnlocked.includes(nextCategory)) {
                    finalUnlocked.push(nextCategory);
                    console.log('Progressive unlock:', nextCategory);
                }
            }
        }
        
        console.log('=== Final unlocked categories:', finalUnlocked, '===');
        return finalUnlocked;
    }, [normalizedStats]);

const unlockNextCategory = useCallback(async (completedCategory) => {
    console.log(`Attempting to unlock next category after completing: ${completedCategory}`);
    
    const currentIndex = CATEGORY_PROGRESSION.indexOf(completedCategory);
    
    updateStats(prevStats => {
        const currentUnlocked = prevStats?.unlockedCategories || ['alphabets'];
        const quizCompletedKey = `${completedCategory}QuizCompleted`;
        
        let updatedStats = {
            ...prevStats,
            [quizCompletedKey]: true,
            quizzesCompleted: (prevStats?.quizzesCompleted || 0) + 1
        };
        
        if (currentIndex !== -1 && currentIndex < CATEGORY_PROGRESSION.length - 1) {
            const nextCategory = CATEGORY_PROGRESSION[currentIndex + 1];
            
            if (!currentUnlocked.includes(nextCategory)) {
                const updatedUnlocked = [...currentUnlocked, nextCategory];
                console.log(`Unlocking category: ${nextCategory}`, updatedUnlocked);
                
                updatedStats = {
                    ...updatedStats,
                    unlockedCategories: updatedUnlocked
                };
            }
        }
        
        if (prevStats?.placementTestCompleted) {
            updatedStats.placementTestCompleted = true;
            updatedStats.placementResults = prevStats.placementResults;
        }
        
        return updatedStats;
    });
}, [updateStats]);

useEffect(() => {
    const handleQuizCompletion = (event) => {
        const { category, score, passed } = event.detail;
        console.log(`Quiz completion detected for category: ${category}, Passed: ${passed}, Score: ${score}`);
        
        if (passed) {
            unlockNextCategory(category);
        } else {
            updateStats(prevStats => ({
                ...prevStats,
                quizzesCompleted: (prevStats?.quizzesCompleted || 0) + 1,
                lastQuizScore: score,
                lastQuizCategory: category
            }));
        }
    };

    window.addEventListener('quizCompleted', handleQuizCompletion);
    return () => window.removeEventListener('quizCompleted', handleQuizCompletion);
}, [unlockNextCategory, updateStats]);

    const lessonsCompleted = normalizedStats?.lessonsCompleted || 0;
    const signsLearned = normalizedStats?.signsLearned || 0;
    const quizzesCompleted = normalizedStats?.quizzesCompleted || 0;

    const categories = useMemo(() => [
        { id: 'alphabets', name: 'The Alphabet', unlocked: unlockedCategories.includes('alphabets') },
        { id: 'numbers', name: 'Numbers & Counting', unlocked: unlockedCategories.includes('numbers') },
        { id: 'introduce', name: 'Introduce Yourself', unlocked: unlockedCategories.includes('introduce') },
        { id: 'colours', name: 'Colours', unlocked: unlockedCategories.includes('colours') },
        { id: 'family', name: 'Family Members', unlocked: unlockedCategories.includes('family') },
        { id: 'feelings', name: 'Emotions & Feelings', unlocked: unlockedCategories.includes('feelings') },
        { id: 'actions', name: 'Common Actions', unlocked: unlockedCategories.includes('actions') },
        { id: 'questions', name: 'Asking Questions', unlocked: unlockedCategories.includes('questions') },
        { id: 'time', name: 'Time & Days', unlocked: unlockedCategories.includes('time') },
        { id: 'food', name: 'Food & Drinks', unlocked: unlockedCategories.includes('food') },
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

    useEffect(() => {
   if (location.state?.selectedCategory && 
        !hasProcessedLocationStateRef.current && 
        !currentCategoryRef.current) {
        
        const category = categories.find(cat => cat.id === location.state.selectedCategory);
        if (category) {
            setCurrentCategory(category);
            setSelectedSection('category');
            hasProcessedLocationStateRef.current = true;
        }
    }
}, [location.state, categories]);
   
const goBack = useCallback(() => {
    setCurrentCategory(null);
    currentCategoryRef.current = null;
    setSelectedSection('dashboard');
    hasProcessedLocationStateRef.current = false;
    navigate('/learn', { replace: true, state: {} });
    
    const shouldShowDashboard = normalizedStats && 
                               normalizedStats.placementTestCompleted && 
                               !normalizedStats.hasSeenCategoryHelp?.dashboard && 
                               !hasShownDashboardThisSessionRef.current &&
                               !isNewUser;
    
    if (shouldShowDashboard) {
        hasShownDashboardThisSessionRef.current = true;
        setTimeout(() => {
            setShowHelpMessage({ 
                message: CATEGORY_HELP_MESSAGES.dashboard, 
                position: 'center', 
                helpKey: 'dashboard' 
            });
        }, 300);
    }
}, [normalizedStats, isNewUser, navigate]);

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
            case 'alphabets': return '/quiz';
            case 'numbers': return '/numbers-quiz';
            case 'introduce': return '/introduce-quiz';
            case 'colours': return '/colours-quiz';
            case 'family': return '/family-quiz';
            case 'feelings': return '/feelings-quiz';
            case 'actions': return '/actions-quiz';
            case 'questions': return '/questions-quiz';
            case 'time': return '/time-quiz';
            case 'food': return '/food-quiz';
            case 'things': return '/things-quiz';
            case 'animals': return '/animals-quiz';
            case 'seasons': return '/seasons-quiz';
            case 'phrases': return '/phrases-quiz';
            default: return '/quiz';
        }
    };

const handleCloseHelp = useCallback(() => {
    const helpKey = showHelpMessage?.helpKey;
    
    setShowHelpMessage(false);
    
    if (helpKey) {
        markHelpSeen(helpKey);
        
        if (helpKey === 'welcome' && isNewUser && !normalizedStats?.placementTestCompleted) {
            setTimeout(() => {
                setShowPlacementTest(true);
            }, 300);
        }
    }
}, [showHelpMessage, isNewUser, normalizedStats, markHelpSeen]);
    const getLockedCategoryMessage = (categoryId) => {
        const currentIndex = CATEGORY_PROGRESSION.indexOf(categoryId);
        if (currentIndex <= 0) return "This category should be available. Please try again.";
        
        const previousCategory = CATEGORY_PROGRESSION[currentIndex - 1];
        const previousCategoryName = categories.find(cat => cat.id === previousCategory)?.name || previousCategory;
        
        return `Complete the quiz in '${previousCategoryName}' to unlock this category!`;
    };
/* eslint-disable react-hooks/exhaustive-deps */
const handleCategoryClick = useCallback((category) => {
    if (category.unlocked) {
        setShowHelpMessage(false);
        
        hasProcessedLocationStateRef.current = true;
        
        setCurrentCategory(category);
        currentCategoryRef.current = category;
        
        const hasSeenFromBackend = normalizedStats?.hasSeenCategoryHelp?.[category.id] === true;
        const hasShownThisSession = shownCategoryHelpRef.current.has(category.id);
        
        if (!hasSeenFromBackend && !hasShownThisSession) {
            shownCategoryHelpRef.current.add(category.id);
            setTimeout(() => {
                if (currentCategoryRef.current?.id === category.id) {
                    setShowHelpMessage({ 
                        message: CATEGORY_HELP_MESSAGES[category.id], 
                        position: 'center', 
                        helpKey: category.id
                    });
                }
            }, 300);
        }
    } else {
        setShowHelpMessage({ 
            message: getLockedCategoryMessage(category.id),
            position: 'center',
            helpKey: `locked_${category.id}`
        });
    }
}, [normalizedStats]);
/* eslint-disable react-hooks/exhaustive-deps */

    const retakePlacementTest = async () => {
       
        updateStats(prevStats => ({
            ...prevStats,
            placementTestCompleted: false,
            placementResults: null,
            unlockedCategories: ['alphabets'],
            alphabetsQuizCompleted: false,
            numbersQuizCompleted: false,
            introduceQuizCompleted: false,
            coloursQuizCompleted: false,
            familyQuizCompleted: false,
            feelingsQuizCompleted: false,
            actionsQuizCompleted: false,
            questionsQuizCompleted: false,
            timeQuizCompleted: false,
            foodQuizCompleted: false,
            thingsQuizCompleted: false,
            animalsQuizCompleted: false,
            seasonsQuizCompleted: false,
            phrasesQuizCompleted: false,
            quizzesCompleted: 0
        }));
        
        setShowPlacementTest(true);
    };

    if (isLoading || !normalizedStats || !hasLoadedFromBackend) {
        return (
            <div className="duo-app">
                <div className="learn-main-content flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your learning progress...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (showPlacementTest) {
        return (
            <PlacementTest 
                onComplete={handlePlacementComplete}
                onSkip={handlePlacementSkip}
                onClose={handleClosePlacementTest}  
            />
        );
    }

    return (
        <div className="duo-app">
            <Sidebar
                onSelect={goBack}
                progressPercent={progressPercent}
                signsLearned={signsLearned}
                lessonsCompleted={lessonsCompleted}
                quizzesCompleted={quizzesCompleted}
                placementTestCompleted={normalizedStats?.placementTestCompleted || false}
                onRetakePlacementTest={retakePlacementTest}
            />

            <div className="learn-main-content relative min-h-screen">
                {selectedSection === 'dashboard' && !currentCategory && (
                    <div className="dashboard">
                        <div className="category-tiles grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
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
                    <div className="category-levels px-4 sm:px-6 lg:px-8">
                        <div className="category-header mb-6 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                                {currentCategory.name}
                            </h2>
                            <div className="category-subtitle-line w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        </div>
                        
                        <div className={`stepping-poles grid gap-3 sm:gap-4 md:gap-6 ${
                            currentCategory.id === 'phrases' 
                                ? 'phrases-layout grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                        }`}>

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
                                                setShowHelpMessage({ 
                                                    message: `You need to learn at least 5 signs in the Alphabet category to unlock this quiz. Keep practicing!`,
                                                    position: 'center',
                                                    helpKey: 'alphabet_quiz_locked'
                                                });
                                            }
                                        }}
                                        style={{
                                            backgroundColor: signsLearned >= 5 ? '#ffc107' : '#ccc',
                                            color: signsLearned >= 5 ? '#fff' : '#666',
                                            fontWeight: 'bold',
                                            fontSize: '12px sm:14px'
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
                                            fontSize: '12px sm:14px'
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
                                            fontSize: '12px sm:14px',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                                        }}
                                    />
                                </>
                            ) : currentCategory.id === 'phrases' ? (
                                <>
                                    {COMMON_PHRASES.map((phrase) => (
                                        <div
                                            key={phrase.id}
                                            className="level-card phrase-card unlocked w-full"
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
                                        className={`level-card phrase-card phrase-quiz w-full ${
                                            COMMON_PHRASES.every(phrase => normalizedStats?.learnedPhrases?.includes(phrase.id))
                                                ? 'unlocked' 
                                                : 'locked'
                                        }`}
                                        onClick={() => {
                                            if (COMMON_PHRASES.every(phrase => normalizedStats?.learnedPhrases?.includes(phrase.id))) {
                                                navigate(getQuizRoute(currentCategory.id));
                                            } else {
                                                setShowHelpMessage({ 
                                                    message: `You need to learn all phrases in the 'Common Phrases' category to unlock this quiz. Keep practicing!`,
                                                    position: 'center',
                                                    helpKey: 'phrases_quiz_locked'
                                                });
                                            }
                                        }}
                                    >
                                        <div className="phrase-content flex items-center justify-between p-3 sm:p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="phrase-icon text-xl sm:text-2xl">
                                                    🏆
                                                </div>
                                                <div className="phrase-text">
                                                    <h3 className="phrase-title text-sm sm:text-base font-semibold">Phrases Quiz</h3>
                                                    <p className="phrase-subtitle text-xs sm:text-sm text-gray-600">
                                                        {COMMON_PHRASES.every(phrase => normalizedStats?.learnedPhrases?.includes(phrase.id))
                                                            ? 'Test your phrase knowledge!'
                                                            : 'Complete all phrases to unlock'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="phrase-arrow text-lg sm:text-xl">→</div>
                                        </div>
                                    </div>
                                </>
                            ) : [
                                'introduce', 'family', 'feelings', 'actions', 'questions', 
                                'time', 'food', 'things', 'animals', 'seasons'
                            ].includes(currentCategory.id) ? (
                                (() => {
                                    const getWordsForCategory = (categoryId) => {
                                        switch (categoryId) {
                                            case 'introduce': return INTRODUCTION_WORDS;
                                            case 'family': return FAMILY_MEMBERS;
                                            case 'feelings': return EMOTIONS_FEELINGS;
                                            case 'actions': return COMMON_ACTIONS;
                                            case 'questions': return ASKING_QUESTIONS;
                                            case 'time': return TIME_DAYS;
                                            case 'food': return FOOD_DRINKS;
                                            case 'things': return OBJECTS_THINGS;
                                            case 'animals': return ANIMALS;
                                            case 'seasons': return SEASONS_WEATHER;
                                            default: return [];
                                        }
                                    };

                                    const getCategoryDisplayName = (categoryId) => {
                                        const names = {
                                            'introduce': 'Introduce Yourself',
                                            'family': 'Family Members',
                                            'feelings': 'Emotions and Feelings',
                                            'actions': 'Common Actions',
                                            'questions': 'Asking Questions',
                                            'time': 'Time and Days',
                                            'food': 'Food and Drinks',
                                            'things': 'Objects and Things',
                                            'animals': 'Animals',
                                            'seasons': 'Weather and Seasons'
                                        };
                                        return names[categoryId] || categoryId;
                                    };

                                    const words = getWordsForCategory(currentCategory.id);
                                    const displayName = getCategoryDisplayName(currentCategory.id);
                                    
                                    return (
                                        <>
                                            {words.map((word) => (
                                                <LevelTile
                                                    key={word}
                                                    level={word.charAt(0).toUpperCase() + word.slice(1)} 
                                                    unlocked={true} 
                                                    onClick={() => navigateToSign(word.toLowerCase(), currentCategory.id)}
                                                />
                                            ))}
                                            <LevelTile
                                                key={`${currentCategory.id}-quiz`}
                                                level={'Quiz'}
                                                unlocked={
                                                    words.every(word => normalizedStats?.learnedSigns?.includes(word.toLowerCase()))
                                                }
                                                onClick={() => {
                                                    if (words.every(word => normalizedStats?.learnedSigns?.includes(word.toLowerCase()))) {
                                                        navigate(getQuizRoute(currentCategory.id));
                                                    } else {
                                                        setShowHelpMessage({ 
                                                            message: `You need to learn all words in the '${displayName}' category to unlock this quiz. Keep practicing!`,
                                                            position: 'center',
                                                            helpKey: `${currentCategory.id}_quiz_locked`
                                                        });
                                                    }
                                                }}
                                                style={{
                                                    backgroundColor: words.every(word => normalizedStats?.learnedSigns?.includes(word.toLowerCase())) ? '#ffc107' : '#ccc',
                                                    color: words.every(word => normalizedStats?.learnedSigns?.includes(word.toLowerCase())) ? '#fff' : '#666',
                                                    fontWeight: 'bold',
                                                    fontSize: '12px sm:14px'
                                                }}
                                            />
                                        </>
                                    );
                                })()
                            ) : (
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
                                            fontSize: '12px sm:14px'
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <button 
                            onClick={goBack} 
                            className="back-button mt-6 sm:mt-8 mb-4 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            ← Back to Categories
                        </button>
                    </div>
                )}

                {showHelpMessage && (
                    <HelpMessage
                        message={showHelpMessage.message}
                        position={showHelpMessage.position}
                        onClose={handleCloseHelp}
                    />
                )}
            </div>
        </div>
    );
}