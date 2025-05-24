import {getLearningProgress} from "../utils/apiCalls.js";
import React, { useEffect, useState } from "react";

export function LearningStats() {

  const [practiseDays, setPractiseDays] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [signsLearned, setSignsLearned] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);

  const TOTAL_LESSONS = 30; // Let's make total lessons 30 for now
  const progressPercent = Math.min(100, Math.round((lessonsCompleted / TOTAL_LESSONS) * 100));

  useEffect(() => {
    const username = localStorage.getItem("username") || "tester1";
    localStorage.setItem("username", username);

    const fetchLearningProgress = async () => {
      const progress = await getLearningProgress(username);
      if (!progress || !progress.data || !progress.data[0]) {
        console.error("Invalid learning progress response", progress);
        return;
      }

      const data = progress.data[0];

      setPractiseDays(data.streak);
      setLessonsCompleted(data.lessonsCompleted);
      setSignsLearned(data.signsLearned);
      setCurrentLevel(data.currentLevel);

      console.log("Learning progress fetched:", data);
    };

    fetchLearningProgress();
  }, []);

  return(
    <section className="learning-progress">
        <h3>Learning Progress</h3>

        <div className="progress-bar-wrapper" aria-label="Learning progress bar">
        <div className="progress-header">
            <span className="progress-status">In Progress</span>
            <span className="progress-percent">{progressPercent}%</span>
        </div>
        <div className="progress-bar" role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        </div>

        <div className="progress-stats">
        <div className="stat-card">
            <p className="stat-value">{lessonsCompleted}/{TOTAL_LESSONS}</p>
            <p className="stat-label">Lessons Completed</p>
        </div>
        <div className="stat-card">
            <p className="stat-value">{signsLearned}</p>
            <p className="stat-label">Signs Learned</p>
        </div>
        <div className="stat-card">
            <p className="stat-value">{practiseDays}</p>
            <p className="stat-label">Practice Days</p>
        </div>
        <div className="stat-card">
            <p className="stat-value">{currentLevel}</p>
            <p className="stat-label">Current Level</p>
        </div>
        </div>
    </section>)
}