import React from "react";
import { useLearningStats } from "../contexts/learningStatsContext";

export function LearningStats(){
    const statsContext = useLearningStats() || {};
    const { stats } = statsContext;

    const {
      lessonsCompleted = 0,
      signsLearned = 0,
      streak: practiseDays = 0,
      currentLevel = "Bronze",
    } = stats || {};

    const TOTAL_LESSONS = 30;
    const calcLessonsCompleted = Math.min(lessonsCompleted, TOTAL_LESSONS);
    const progressPercent = Math.min(100, Math.round((calcLessonsCompleted / TOTAL_LESSONS) * 100));

  return (
    <section className="learning-progress">
      <h3>Learning Progress</h3>

      <div className="progress-bar-wrapper" aria-label="Learning progress bar">
        <div className="progress-header">
          <span className="progress-status">In Progress</span>
          <span className="progress-percent">{progressPercent}%</span>
        </div>
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="progress-stats">
        <div className="stat-card">
          <p className="stat-value">
            {calcLessonsCompleted}/{TOTAL_LESSONS}
          </p>
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
    </section>
  );
}

