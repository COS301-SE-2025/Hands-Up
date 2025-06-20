import React, { createContext, useContext, useState, useEffect } from "react";
import { getLearningProgress, updateLearningProgress } from "../utils/apiCalls";
import PropTypes from "prop-types";

const LearningStatsContext = createContext();

const LearningStatsProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const storedUser = localStorage.getItem('userData');
  console.log(storedUser); 
  let username = ""; 
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    username = parsedUser.username;
    console.log(username); 
  }
  else {
    console.log("error retrieving username for learning stats"); 
  }

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

LearningStatsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useLearningStats = () => useContext(LearningStatsContext);

export { LearningStatsProvider, useLearningStats };