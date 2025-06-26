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
        console.log('LearningStatsContext useEffect triggered:', { 
            authLoading, 
            isLoggedIn, 
            username, 
            hasFetchedStats: hasFetchedStats.current 
        });

        if (authLoading) {
            console.log('Auth is still loading, waiting...');
            return;
        }

       if (!isLoggedIn) {
            console.log('User is logged out. Resetting stats to defaults.');
            setStats(DEFAULT_STATS);
            return;
        }

       if (!username) {
            console.log('User is logged in but username not available yet, waiting...');
            return;
        }
    if (!hasFetchedStats.current) {
            const loadStats = async () => {
                console.log(`Loading persistent stats for user: ${username}`);
                try {
                    const progress = await getLearningProgress(username);
                    console.log('Raw progress data from API:', progress);

                    if (progress?.data?.[0]) {
                        const fetchedData = progress.data[0];
                        console.log('Fetched persistent stats:', fetchedData);

                        setStats({
                            lessonsCompleted: fetchedData.lessonsCompleted || 0,
                            signsLearned: fetchedData.signsLearned || 0,
                            streak: fetchedData.streak || 0,
                            currentLevel: fetchedData.currentLevel || "Bronze",
                        });
                    } else {
                        console.log('No learning progress found in DB. Using defaults.');
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
        console.log('Optimistically updated stats:', newStats);

        try {
            const response = await updateLearningProgress(username, newStats);
            if (response && response.status !== "error") {
                console.log("Stats successfully persisted to backend");
            } else {
                console.error("Failed to update stats in backend:", response);
              }
        } catch (error) {
            console.error("Failed to update stats:", error);
        
        }
    };

    return (
        <LearningStatsContext.Provider value={{ stats, updateStats }}>
            {children}
        </LearningStatsContext.Provider>
    );
}

LearningStatsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

const useLearningStats = () => useContext(LearningStatsContext);

export { LearningStatsProvider, useLearningStats };