import React, { createContext, useCallback, useMemo, useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const LearningStatsContext = createContext();


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

export const useLearningStats = () => {
    const context = useContext(LearningStatsContext);
    if (!context) {
        throw new Error('useLearningStats must be used within a LearningStatsProvider');
    }
    return context;
};

export const LearningStatsProvider = ({ children }) => {
    const [stats, setStats] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadedFromBackend, setHasLoadedFromBackend] = useState(false);
    const saveTimeoutRef = useRef(null);
    const loadingRef = useRef(false);
    
    const hasLoadedInitialRef = useRef(false);
    const mountedRef = useRef(false);

    const API_BASE_URL = 'https://hands-up.onrender.com/handsUPApi';

    const defaultStats = useMemo(() => ({
        lessonsCompleted: 0,
        signsLearned: 0,
        streak: 0,
        currentLevel: 'Bronze',
        quizzesCompleted: 0,
        learnedSigns: [],
        learnedPhrases: [],
        unlockedCategories: ['alphabets'],
        placementTestCompleted: false,
        placementResults: null,
        startingLevel: 'beginner',
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
        hasSeenWelcome: false,
        hasSeenCategoryHelp: {}
    }), []);

    const getCurrentUser = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/me`, {
                method: 'GET',
                credentials: 'include', 
            });
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    const userData = await response.json();
                    // console.log('User data received:', userData);
                    return userData.user?.username;
                } else {
                    const textResponse = await response.text();
                    console.warn('Expected JSON but received:', textResponse.substring(0, 200));
                    return null;
                }
            } else {
                console.warn('API request failed with status:', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    };

    const loadStatsFromBackend = useCallback(async (forceReload = false) => {
        if (loadingRef.current && !forceReload) return;
        if (hasLoadedInitialRef.current && !forceReload) return;

        try {
            loadingRef.current = true;
            setIsLoading(true);
            
            const currentUser = await getCurrentUser();
            
            if (!currentUser) {
                //console.log('No authenticated user found, using defaults');
                setStats(defaultStats);
                setIsLoading(false);
                setHasLoadedFromBackend(true);
                hasLoadedInitialRef.current = true;
                return;
            }

            //console.log(`Loading stats for user: ${currentUser}`);

            const response = await fetch(`${API_BASE_URL}/learning/progress/${currentUser}`, {
                method: 'GET',
                credentials: 'include', 
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.status === 'success' && result.data) {
                    const backendStats = result.data;
                    
                    let actualStats = backendStats;
                    const hasNestedStructure = Object.keys(backendStats).some(key => !isNaN(parseInt(key)));
                    
                    if (hasNestedStructure) {
                        const numericKeys = Object.keys(backendStats).filter(key => !isNaN(parseInt(key)));
                        if (numericKeys.length > 0) {
                            actualStats = backendStats[numericKeys[0]] || backendStats;
                        }
                    }
                    
                    const mergedStats = {
                        ...defaultStats,
                        ...actualStats,
                        learnedSigns: Array.isArray(actualStats.learnedSigns) ? actualStats.learnedSigns : [],
                        learnedPhrases: Array.isArray(actualStats.learnedPhrases) ? actualStats.learnedPhrases : [],
                        unlockedCategories: Array.isArray(actualStats.unlockedCategories) ? actualStats.unlockedCategories : ['alphabets'],
                        hasSeenCategoryHelp: actualStats.hasSeenCategoryHelp && typeof actualStats.hasSeenCategoryHelp === 'object' ? actualStats.hasSeenCategoryHelp : {},
                        placementTestCompleted: Boolean(actualStats.placementTestCompleted),
                        hasSeenWelcome: Boolean(actualStats.hasSeenWelcome),
                        alphabetsQuizCompleted: Boolean(actualStats.alphabetsQuizCompleted),
                        numbersQuizCompleted: Boolean(actualStats.numbersQuizCompleted),
                        introduceQuizCompleted: Boolean(actualStats.introduceQuizCompleted),
                        coloursQuizCompleted: Boolean(actualStats.coloursQuizCompleted),
                        familyQuizCompleted: Boolean(actualStats.familyQuizCompleted),
                        feelingsQuizCompleted: Boolean(actualStats.feelingsQuizCompleted),
                        actionsQuizCompleted: Boolean(actualStats.actionsQuizCompleted),
                        questionsQuizCompleted: Boolean(actualStats.questionsQuizCompleted),
                        timeQuizCompleted: Boolean(actualStats.timeQuizCompleted),
                        foodQuizCompleted: Boolean(actualStats.foodQuizCompleted),
                        thingsQuizCompleted: Boolean(actualStats.thingsQuizCompleted),
                        animalsQuizCompleted: Boolean(actualStats.animalsQuizCompleted),
                        seasonsQuizCompleted: Boolean(actualStats.seasonsQuizCompleted),
                        phrasesQuizCompleted: Boolean(actualStats.phrasesQuizCompleted)
                    };

                    mergedStats.signsLearned = mergedStats.learnedSigns.length;

                    //console.log('Stats loaded from backend for user:', currentUser, mergedStats);
                    setStats(mergedStats);
                    
                } else {
                    //console.log('No stats found in backend, using defaults for user:', currentUser);
                    setStats(defaultStats);
                }
            } else {
                //console.warn('Failed to load from backend, using defaults');
                setStats(defaultStats);
            }
            
            setHasLoadedFromBackend(true);
            hasLoadedInitialRef.current = true;
            
        } catch (error) {
            console.error('Error loading stats from backend:', error);
            setStats(defaultStats);
            setHasLoadedFromBackend(true);
            hasLoadedInitialRef.current = true;
        } finally {
            setIsLoading(false);
            loadingRef.current = false;
        }
    }, [defaultStats]);

    const saveStatsToBackend = useCallback(async (statsToSave = null) => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                //console.log('No user authenticated, skipping save');
                return;
            }

            const dataToSave = statsToSave || stats;
            if (!dataToSave) {
                //console.log('No stats to save');
                return;
            }

           const dataToSend = {
                ...dataToSave,
                unlockedCategories: Array.isArray(dataToSave.unlockedCategories) ? dataToSave.unlockedCategories : ['alphabets']
            };

            //console.log('Saving stats to backend for user:', currentUser, dataToSend);

            const response = await fetch(`${API_BASE_URL}/learning/progress/${currentUser}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                console.log('Stats saved to backend successfully for user:', currentUser);
                } else {
                const errorText = await response.text();
                console.warn('Failed to save stats to backend. Status:', response.status, 'Response:', errorText);
            }
        } catch (error) {
            console.error('Error saving stats to backend:', error);
        }
    }, [stats]); 

    useEffect(() => {
        if (mountedRef.current) {
            return;
        }
        
        mountedRef.current = true;
        //console.log('LearningStatsProvider mounted, loading stats...');
        loadStatsFromBackend();
        
        return () => {
            //console.log('LearningStatsProvider unmounting');
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [loadStatsFromBackend]);

    useEffect(() => {
        if (!stats || !hasLoadedFromBackend || isLoading) {
            return;
        }

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            await saveStatsToBackend(stats);
        }, 2000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [stats, hasLoadedFromBackend, isLoading, saveStatsToBackend]);

const updateStats = useCallback((updater) => {
    setStats(prevStats => {
        if (!prevStats) {
            //console.warn('Attempted to update stats before they were loaded');
            return prevStats;
        }
        
        const newStats = typeof updater === 'function' ? updater(prevStats) : updater;
        
        const mergedStats = { ...prevStats, ...newStats };
        mergedStats.learnedSigns = Array.isArray(mergedStats.learnedSigns) ? mergedStats.learnedSigns : [];
        mergedStats.learnedPhrases = Array.isArray(mergedStats.learnedPhrases) ? mergedStats.learnedPhrases : [];
        
        if (newStats.unlockedCategories && Array.isArray(newStats.unlockedCategories)) {
            if (prevStats.unlockedCategories && Array.isArray(prevStats.unlockedCategories)) {
                const mergedUnlocked = [...new Set([...prevStats.unlockedCategories, ...newStats.unlockedCategories])];
                mergedStats.unlockedCategories = mergedUnlocked.sort((a, b) => 
                    CATEGORY_PROGRESSION.indexOf(a) - CATEGORY_PROGRESSION.indexOf(b)
                );
            } else {
                mergedStats.unlockedCategories = newStats.unlockedCategories;
            }
        } else if (!mergedStats.unlockedCategories || !Array.isArray(mergedStats.unlockedCategories)) {
           mergedStats.unlockedCategories = ['alphabets'];
        }
        
        mergedStats.hasSeenCategoryHelp = mergedStats.hasSeenCategoryHelp && typeof mergedStats.hasSeenCategoryHelp === 'object' ? mergedStats.hasSeenCategoryHelp : {};
        
        mergedStats.signsLearned = mergedStats.learnedSigns.length;
        
        if (prevStats.placementTestCompleted) {
            mergedStats.placementTestCompleted = true;
            mergedStats.placementResults = prevStats.placementResults || mergedStats.placementResults;
        }
        
        if (prevStats.placementSkipped !== undefined) {
            mergedStats.placementSkipped = prevStats.placementSkipped;
        }
        
        const totalProgress = (mergedStats.lessonsCompleted || 0) + 
                            (mergedStats.signsLearned || 0) + 
                            ((mergedStats.streak || 0) % 365);

        let calculatedLevel;
        if (totalProgress < 10) calculatedLevel = "Bronze";
        else if (totalProgress < 25) calculatedLevel = "Silver";
        else if (totalProgress < 50) calculatedLevel = "Gold";
        else if (totalProgress < 75) calculatedLevel = "Platinum";
        else if (totalProgress < 100) calculatedLevel = "Diamond";
        else calculatedLevel = "Ruby";

        mergedStats.currentLevel = calculatedLevel;
        
        //console.log('Stats updated. Unlocked categories:', mergedStats.unlockedCategories);
        //console.log('Placement test preserved:', mergedStats.placementTestCompleted);
        return mergedStats;
    });
}, []);

    const completePlacementTest = useCallback((results) => {
        //console.log('Completing placement test with results:', results);
        
        updateStats(prevStats => ({
            ...prevStats,
            placementTestCompleted: true,
            placementResults: results,
            unlockedCategories: results.unlockedCategories || ['alphabets'],
            startingLevel: results.startingLevel || 'beginner'
        }));
    }, [updateStats]);

    const addLearnedSign = useCallback((sign) => {
        updateStats(prevStats => {
            const normalizedSign = sign.toLowerCase();
            if (!prevStats.learnedSigns.includes(normalizedSign)) {
                const newLearnedSigns = [...prevStats.learnedSigns, normalizedSign];
                return { ...prevStats, learnedSigns: newLearnedSigns };
            }
           // console.log(`Sign "${sign}" already learned`);
            return prevStats;
        });
    }, [updateStats]);

    const addLearnedPhrase = useCallback((phraseId) => {
        updateStats(prevStats => {
            if (!prevStats.learnedPhrases.includes(phraseId)) {
                return { ...prevStats, learnedPhrases: [...prevStats.learnedPhrases, phraseId] };
            }
            return prevStats;
        });
    }, [updateStats]);

    const unlockCategory = useCallback((categoryId) => {
        updateStats(prevStats => {
            if (!prevStats.unlockedCategories.includes(categoryId)) {
                const newUnlocked = [...prevStats.unlockedCategories, categoryId];
                //console.log('Unlocking category:', categoryId, 'New unlocked:', newUnlocked);
                return { ...prevStats, unlockedCategories: newUnlocked };
            }
            return prevStats;
        });
    }, [updateStats]);

    const completeQuiz = useCallback((categoryId) => {
        const CATEGORY_PROGRESSION = [
            'alphabets', 'numbers', 'introduce', 'colours', 'family', 
            'feelings', 'actions', 'questions', 'time', 'food', 
            'things', 'animals', 'seasons', 'phrases'
        ];

        updateStats(prevStats => {
            const quizKey = `${categoryId}QuizCompleted`;
            const currentIndex = CATEGORY_PROGRESSION.indexOf(categoryId);
            const nextCategory = CATEGORY_PROGRESSION[currentIndex + 1];
            
            const updates = {
                ...prevStats,
                [quizKey]: true,
                quizzesCompleted: prevStats.quizzesCompleted + 1
            };

            if (nextCategory && !prevStats.unlockedCategories.includes(nextCategory)) {
                updates.unlockedCategories = [...prevStats.unlockedCategories, nextCategory];
                //console.log('Unlocked next category after quiz:', nextCategory);
            }

            return updates;
        });
    }, [updateStats]);

    const markHelpSeen = useCallback((helpKey) => {
        updateStats(prevStats => ({
            ...prevStats,
            hasSeenWelcome: helpKey === 'welcome' ? true : prevStats.hasSeenWelcome,
            hasSeenCategoryHelp: {
                ...prevStats.hasSeenCategoryHelp,
                [helpKey]: true
            }
        }));
    }, [updateStats]);

    const clearStats = useCallback(() => {
        //console.log('Clearing stats due to logout');
        setStats(null);
        setHasLoadedFromBackend(false);
        setIsLoading(true);
        hasLoadedInitialRef.current = false;
        mountedRef.current = false;
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
    }, []);

    const reloadStats = useCallback(() => {
        //console.log('Manual stats reload requested');
        loadStatsFromBackend(true);
    }, [loadStatsFromBackend]);

    const value = {
        stats,
        updateStats,
        completePlacementTest,
        addLearnedSign,
        addLearnedPhrase,
        unlockCategory,
        completeQuiz,
        markHelpSeen,
        isLoading,
        hasLoadedFromBackend,
        clearStats,
        reloadStats
    };

    return (
        <LearningStatsContext.Provider value={value}>
            {children}
        </LearningStatsContext.Provider>
    );
};

LearningStatsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};