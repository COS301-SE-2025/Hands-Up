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

useLearningStats.PropTypes={
    children: PropTypes.node.isRequired,
}
export const LearningStatsProvider = ({ children }) => {
    const [stats, setStats] = useState(() => {
        try {
            const saved = localStorage.getItem('learningStats');
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
            
            if (saved) {
                const parsedStats = JSON.parse(saved);
                return { ...defaultStats, ...parsedStats };
            }
            
            return defaultStats;
        } catch (error) {
            console.error('Error loading stats from localStorage:', error);
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
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('learningStats', JSON.stringify(stats));
        } catch (error) {
            console.error('Error saving stats to localStorage:', error);
        }
    }, [stats]);

    const updateStats = (updater) => {
        setStats(prevStats => {
            const newStats = typeof updater === 'function' ? updater(prevStats) : updater;
            
            newStats.learnedSigns = newStats.learnedSigns || [];
            newStats.learnedPhrases = newStats.learnedPhrases || [];
            newStats.unlockedCategories = newStats.unlockedCategories || ['alphabets'];
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
            
           // console.log('Stats updated:', newStats);
            return newStats;
        });
    };

    const addLearnedSign = (sign) => {
        updateStats(prevStats => {
            const normalizedSign = sign.toLowerCase();
            if (!prevStats.learnedSigns.includes(normalizedSign)) {
                return {
                    ...prevStats,
                    learnedSigns: [...prevStats.learnedSigns, normalizedSign],
                    signsLearned: prevStats.learnedSigns.length + 1
                };
            }
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
        completeQuiz
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