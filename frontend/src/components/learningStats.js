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

    const TOTAL_LEVELS = 12;
    const LESSONS_PER_LEVEL = 30;
    const TOTAL_LESSONS = TOTAL_LEVELS * LESSONS_PER_LEVEL; 
    const TOTAL_SIGNS = 26; 

    const calcLessonsCompleted = Math.min(lessonsCompleted, TOTAL_LESSONS);
    const calcSignsLearned = Math.min(signsLearned, TOTAL_SIGNS);

   const LESSON_WEIGHT = 0.7; 
    const SIGN_WEIGHT = 0.3;   

    const lessonProgress = (calcLessonsCompleted / TOTAL_LESSONS) * 100;
    const signProgress = (calcSignsLearned / TOTAL_SIGNS) * 100;
    
    const progressPercent = Math.min(100, Math.round(
      (lessonProgress * LESSON_WEIGHT) + (signProgress * SIGN_WEIGHT)
    ));

    const currentLevelNumber = Math.min(TOTAL_LEVELS, Math.floor(calcLessonsCompleted / LESSONS_PER_LEVEL) + 1);
    const lessonsInCurrentLevel = calcLessonsCompleted % LESSONS_PER_LEVEL;

  return (
    <section className="learning-progress">
      <h3>Learning Progress</h3>

      <div className="progress-bar-wrapper" aria-label="Learning progress bar">
        <div className="progress-header">
          <span className="progress-status">
            {progressPercent === 100 ? "Complete" : "In Progress"}
          </span>
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
          <p className="stat-value">{calcSignsLearned}/{TOTAL_SIGNS}</p>
          <p className="stat-label">Signs Learned</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{practiseDays}</p>
          <p className="stat-label">Practice Days</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">
            Level {currentLevelNumber} ({lessonsInCurrentLevel}/{LESSONS_PER_LEVEL})
          </p>
          <p className="stat-label">Current Level</p>
        </div>
      </div>

      <div className="progress-breakdown" style={{ marginTop: '1rem', fontSize: '0.9em', color: '#666' }}>
        <div>Lesson Progress: {Math.round(lessonProgress)}%</div>
        <div>Sign Progress: {Math.round(signProgress)}%</div>
      </div>
    </section>
  );
}