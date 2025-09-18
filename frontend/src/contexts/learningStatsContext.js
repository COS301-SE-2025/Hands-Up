import React, { createContext, useContext, useState, useEffect } from 'react';

import PropTypes from 'prop-types';
const LearningStatsContext = createContext();


export const useLearningStats = () => {
    const context = useContext(LearningStatsContext);
    if (!context) {
        throw new Error('useLearningStats must be used within a LearningStatsProvider');
    }
    return context;
};

export const LearningStatsProvider = ({ children }) => {
    const [stats, setStats] = useState(() => {
        return {
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
            phrasesQuizCompleted: false
        };
    });

    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadedFromBackend, setHasLoadedFromBackend] = useState(false);

    const getCurrentUser = async () => {
        try {
            const response = await fetch('/api/user', {
                method: 'GET',
                credentials: 'include', 
            });
            
            if (response.ok) {
                const userData = await response.json();
                return userData.user?.username;
            }
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    };

    const loadStatsFromBackend = async () => {
        try {
            setIsLoading(true);
            
            const currentUser = await getCurrentUser();
            
            if (!currentUser) {
                console.log('No authenticated user found, using localStorage only');
                loadStatsFromLocalStorage();
                setIsLoading(false);
                return;
            }

            const response = await fetch(`/api/learning-progress/${currentUser}`, {
                method: 'GET',
                credentials: 'include', 
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.status === 'success' && result.data && result.data.length > 0) {
                    const backendStats = result.data[0];
                    
                    const mergedStats = {
                        lessonsCompleted: backendStats.lessonsCompleted || 0,
                        signsLearned: backendStats.signsLearned || 0,
                        streak: backendStats.streak || 0,
                        currentLevel: backendStats.currentLevel || 'Bronze',
                        quizzesCompleted: backendStats.quizzesCompleted || 0,
                        learnedSigns: backendStats.learnedSigns || [],
                        learnedPhrases: backendStats.learnedPhrases || [],
                        unlockedCategories: backendStats.unlockedCategories || ['alphabets'],
                        placementTestCompleted: backendStats.placementTestCompleted || false,
                        placementResults: backendStats.placementResults || null,
                        startingLevel: backendStats.startingLevel || 'beginner',
                        alphabetsQuizCompleted: backendStats.alphabetsQuizCompleted || false,
                        numbersQuizCompleted: backendStats.numbersQuizCompleted || false,
                        introduceQuizCompleted: backendStats.introduceQuizCompleted || false,
                        coloursQuizCompleted: backendStats.coloursQuizCompleted || false,
                        familyQuizCompleted: backendStats.familyQuizCompleted || false,
                        feelingsQuizCompleted: backendStats.feelingsQuizCompleted || false,
                        actionsQuizCompleted: backendStats.actionsQuizCompleted || false,
                        questionsQuizCompleted: backendStats.questionsQuizCompleted || false,
                        timeQuizCompleted: backendStats.timeQuizCompleted || false,
                        foodQuizCompleted: backendStats.foodQuizCompleted || false,
                        thingsQuizCompleted: backendStats.thingsQuizCompleted || false,
                        animalsQuizCompleted: backendStats.animalsQuizCompleted || false,
                        seasonsQuizCompleted: backendStats.seasonsQuizCompleted || false,
                        phrasesQuizCompleted: backendStats.phrasesQuizCompleted || false
                    };

                    mergedStats.signsLearned = mergedStats.learnedSigns.length;

                    setStats(mergedStats);
                    
                    localStorage.setItem('learningStats', JSON.stringify(mergedStats));
                    
                    setHasLoadedFromBackend(true);
                    console.log('Stats loaded from backend:', mergedStats);
                    console.log('Unlocked categories from backend:', mergedStats.unlockedCategories);
                    
                } else {
                    loadStatsFromLocalStorage();
                }
            } else {
               console.warn('Failed to load from backend, using localStorage');
                loadStatsFromLocalStorage();
            }
            
        } catch (error) {
            console.error('Error loading stats from backend:', error);
            loadStatsFromLocalStorage();
        } finally {
            setIsLoading(false);
        }
    };

    const loadStatsFromLocalStorage = () => {
        try {
            const saved = localStorage.getItem('learningStats');
            if (saved) {
                const parsedStats = JSON.parse(saved);
                const defaultStats = {
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
                    phrasesQuizCompleted: false
                };
                
                const mergedStats = { ...defaultStats, ...parsedStats };
                mergedStats.signsLearned = mergedStats.learnedSigns.length;
                
                setStats(mergedStats);
                console.log('Stats loaded from localStorage:', mergedStats);
            }
        } catch (error) {
            console.error('Error loading stats from localStorage:', error);
        }
    };

    useEffect(() => {
        loadStatsFromBackend();
    }, []);

    useEffect(() => {
        if (hasLoadedFromBackend || !isLoading) {
            try {
                const statsToSave = {
                    ...stats,
                    signsLearned: stats.learnedSigns.length
                };
                localStorage.setItem('learningStats', JSON.stringify(statsToSave));
            } catch (error) {
                console.error('Error saving stats to localStorage:', error);
            }
        }
    }, [stats, hasLoadedFromBackend, isLoading]);

    useEffect(() => {
        if (!hasLoadedFromBackend || isLoading) return;

        const timeoutId = setTimeout(async () => {
            await saveStatsToBackend();
        }, 1000); 

        return () => clearTimeout(timeoutId);
    }, [stats, hasLoadedFromBackend, isLoading]);

    const saveStatsToBackend = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) return;

            const response = await fetch(`/api/learning-progress/${currentUser}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(stats),
            });

            if (response.ok) {
                console.log('Stats saved to backend successfully');
            } else {
                console.warn('Failed to save stats to backend');
            }
        } catch (error) {
            console.error('Error saving stats to backend:', error);
        }
    };

    const updateStats = (updater) => {
        setStats(prevStats => {
            const newStats = typeof updater === 'function' ? updater(prevStats) : updater;
            
             newStats.learnedSigns = newStats.learnedSigns || [];
            newStats.learnedPhrases = newStats.learnedPhrases || [];
            newStats.unlockedCategories = newStats.unlockedCategories || ['alphabets'];
            
            newStats.signsLearned = newStats.learnedSigns.length;
            
            const totalProgress = (newStats.lessonsCompleted || 0) + 
                                (newStats.signsLearned || 0) + 
                                ((newStats.streak || 0) % 365);

            let calculatedLevel;
            if (totalProgress < 10) {
                calculatedLevel = "Bronze";
            } else if (totalProgress < 25) {
                calculatedLevel = "Silver";
            } else if (totalProgress < 50) {
                calculatedLevel = "Gold";
            } else if (totalProgress < 75) {
                calculatedLevel = "Platinum";
            } else if (totalProgress < 100) {
                calculatedLevel = "Diamond";
            } else {
                calculatedLevel = "Ruby";
            }

            newStats.currentLevel = calculatedLevel;
            
            console.log('Stats updated:', newStats);
            return newStats;
        });
    };

    const addLearnedSign = (sign) => {
        updateStats(prevStats => {
            const normalizedSign = sign.toLowerCase();
            
            if (!prevStats.learnedSigns.includes(normalizedSign)) {
                const newLearnedSigns = [...prevStats.learnedSigns, normalizedSign];
                
                return {
                    ...prevStats,
                    learnedSigns: newLearnedSigns,
                };
            }
            
            console.log(`Sign "${sign}" already learned, not incrementing count`);
            return prevStats;
        });
    };

    const addLearnedPhrase = (phraseId) => {
        updateStats(prevStats => {
            if (!prevStats.learnedPhrases.includes(phraseId)) {
                return {
                    ...prevStats,
                    learnedPhrases: [...prevStats.learnedPhrases, phraseId]
                };
            }
            console.log(`Phrase "${phraseId}" already learned`);
            return prevStats;
        });
    };

    const unlockCategory = (categoryId) => {
        updateStats(prevStats => {
            if (!prevStats.unlockedCategories.includes(categoryId)) {
                return {
                    ...prevStats,
                    unlockedCategories: [...prevStats.unlockedCategories, categoryId]
                };
            }
            return prevStats;
        });
    };

    const completeQuiz = (categoryId) => {
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
            }

            return updates;
        });
    };

    const value = {
        stats,
        updateStats,
        addLearnedSign,
        addLearnedPhrase,
        unlockCategory,
        completeQuiz,
        isLoading,
        hasLoadedFromBackend
    };


    return (
        <LearningStatsContext.Provider value={value}>
            {children}
        </LearningStatsContext.Provider>
    );
};
LearningStatsProvider.propTypes={
    children: PropTypes.node.isRequired,
}