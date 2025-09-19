import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { getLearningProgress, updateLearningProgress } from "../utils/apiCalls";
import { useAuth } from './authContext';
import PropTypes from "prop-types";

const LearningStatsContext = createContext();

const DEFAULT_STATS = {
    lessonsCompleted: 0,
    signsLearned: 0,
    streak: 0,
    currentLevel: "Bronze",
    quizzesCompleted: 0,
    completedQuizzes: [], 
    unlockedCategories: ['alphabets'],
};

function LearningStatsProvider({ children }) {
    const { currentUser, isLoggedIn, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(DEFAULT_STATS);
    const hasFetchedStats = useRef(false);
    const currentUsernameRef = useRef(null);

    const username = currentUser?.username;

    useEffect(() => {
        if (currentUsernameRef.current !== username) {
            hasFetchedStats.current = false;
            currentUsernameRef.current = username;
        }
    }, [username]);

    useEffect(() => {
       

        if (authLoading) {
            
            return;
        }

        if (!isLoggedIn) {
            
            setStats(DEFAULT_STATS);
            return;
        }

        if (!username) {
           
            return;
        }
        
        if (!hasFetchedStats.current) {
            const loadStats = async () => {
                
                try {
                    const progress = await getLearningProgress(username);
                   

                    if (progress?.data?.[0]) {
                        const fetchedData = progress.data[0];
                        

                        setStats({
                            lessonsCompleted: fetchedData.lessonsCompleted || 0,
                            signsLearned: fetchedData.signsLearned || 0,
                            streak: fetchedData.streak || 0,
                            currentLevel: fetchedData.currentLevel || "Bronze",
                            quizzesCompleted: fetchedData.quizzesCompleted || 0,
                            completedQuizzes: fetchedData.completedQuizzes || [],
                            unlockedCategories: fetchedData.unlockedCategories || ['alphabets'],
                        });
                    } else {
                        
                        setStats(DEFAULT_STATS);
                    }
                    
                    hasFetchedStats.current = true;
                } catch (error) {
                    console.error("Failed to load learning stats:", error);
                    setStats(DEFAULT_STATS);
                }
            };
            
            loadStats();
        }
    }, [username, isLoggedIn, authLoading]);

    const updateStats = async (updates) => {
        if (!username) {
            console.error("Cannot update stats: User not logged in");
            return;
        }
        
        const newStats = {
            ...stats,
            ...updates 
        };

        setStats(newStats);
        

        try {
            const response = await updateLearningProgress(username, newStats);
            if (response && response.status !== "error") {
                // console.log("Stats successfully persisted to backend");
            } else {
                console.error("Failed to update stats in backend:", response);
            }
        } catch (error) {
            console.error("Failed to update stats:", error);
        }
    };

   const unlockNextCategory = (completedCategory) => {
        const categoryOrder = [
            'alphabets',
            'numbers', 
            'introduce',
            'family',
            'feelings',
            'actions',
            'questions',
            'time',
            'food',
            'colours',
            'things',
            'animals',
            'seasons'
        ];

        const currentIndex = categoryOrder.indexOf(completedCategory);
        const nextCategoryIndex = currentIndex + 1;
        
        if (nextCategoryIndex < categoryOrder.length) {
            const nextCategory = categoryOrder[nextCategoryIndex];
            const currentUnlocked = stats.unlockedCategories || ['alphabets'];
            
            if (!currentUnlocked.includes(nextCategory)) {
                const newUnlockedCategories = [...currentUnlocked, nextCategory];
                const newCompletedQuizzes = [...(stats.completedQuizzes || []), completedCategory];
                
                updateStats({
                    unlockedCategories: newUnlockedCategories,
                    completedQuizzes: newCompletedQuizzes,
                    quizzesCompleted: (stats.quizzesCompleted || 0) + 1
                });
                
                return nextCategory;
            }
        }
        
        return null;
    };

    return (
        <LearningStatsContext.Provider value={{ 
            stats, 
            updateStats, 
            unlockNextCategory 
        }}>
            {children}
        </LearningStatsContext.Provider>
    );
}

LearningStatsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

const useLearningStats = () => useContext(LearningStatsContext);

export { LearningStatsProvider, useLearningStats };