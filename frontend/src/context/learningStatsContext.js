import React, { createContext, useContext, useState, useEffect } from "react";
import { getLearningProgress, updateLearningProgress } from "../utils/apiCalls";

const LearningStatsContext = createContext();
 
export function LearningStatsProvider({ children }) {
  const [stats, setStats] = useState(null);
  const username = localStorage.getItem("username") || "tester1";

  useEffect(() => {
    const loadStats = async () => {
      try {
        const progress = await getLearningProgress(username);
        if (progress?.data?.[0]) {
          setStats(progress.data[0]);
        } 
      } catch (error) {
        console.error("Failed to load learning stats", error);
      }
    };
    loadStats();
  }, [username]);

  const updateStats = async (updates) => {
    const newStats = { ...stats, ...updates };
    const response = await updateLearningProgress(username, newStats);
    if (response && response.status !== "error") {
      setStats(newStats);
    } else {
      console.error("Failed to update stats");
    }
  };

  return (
    <LearningStatsContext.Provider value={{ stats, updateStats }}>
      {children}
    </LearningStatsContext.Provider>
  );
}

export const useLearningStats = () => useContext(LearningStatsContext);
