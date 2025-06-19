import React, { createContext, useContext, useState, useEffect } from "react";
import { getLearningProgress, updateLearningProgress } from "../utils/apiCalls";
import { useAuth } from './authContext'; 
import PropTypes from "prop-types";

const LearningStatsContext = createContext();
 
export function LearningStatsProvider({ children }) {
  const { currentUser, isLoggedIn, loading: authLoading } = useAuth(); 
  const [stats, setStats] = useState(null);

  const username = currentUser?.username; 

  useEffect(() => {
    if (!authLoading && isLoggedIn && username) {
      const loadStats = async () => {
        try {
          const progress = await getLearningProgress(username);
          if (progress?.data?.[0]) {
            setStats(progress.data[0]);
          } else {
            setStats(null);
          }
        } catch (error) {
          console.error("Failed to load learning stats", error);
          setStats(null); 
        }
      };
      loadStats();
    } else if (!authLoading && !isLoggedIn) {
  
      setStats(null);
    }
  }, [username, isLoggedIn, authLoading]); 

  const updateStats = async (updates) => {
    if (!username) {
      console.error("Cannot update stats: User not logged in or username not available.");
      return;
    }
    const newStats = { ...stats, ...updates };
    try {
      const response = await updateLearningProgress(username, newStats);
      if (response && response.status !== "error") {
        setStats(newStats);
      } else {
        console.error("Failed to update stats: API error or unexpected response.");
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

export const useLearningStats = () => useContext(LearningStatsContext);