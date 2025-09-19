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
      learnedSigns = [],
      learnedPhrases = []
    } = stats || {};

   const TOTAL_LEVELS = 14; 
    const LESSONS_PER_LEVEL = 30;
    const TOTAL_LESSONS = TOTAL_LEVELS * LESSONS_PER_LEVEL;
    const TOTAL_ALPHABET_SIGNS = 26;
    const TOTAL_NUMBER_SIGNS = 20;
    const TOTAL_COLOUR_SIGNS = 12; 
    const TOTAL_INTRODUCTION_WORDS = 11;
    const TOTAL_FAMILY_MEMBERS = 11;
    const TOTAL_EMOTIONS_FEELINGS = 9;
    const TOTAL_COMMON_ACTIONS = 12;
    const TOTAL_ASKING_QUESTIONS = 5;
    const TOTAL_TIME_DAYS = 14;
    const TOTAL_FOOD_DRINKS = 16;
    const TOTAL_OBJECTS_THINGS = 9;
    const TOTAL_ANIMALS = 7;
    const TOTAL_SEASONS_WEATHER = 15;
    const TOTAL_PHRASES = 17;
    
    const TOTAL_SIGNS_AVAILABLE = TOTAL_ALPHABET_SIGNS + TOTAL_NUMBER_SIGNS + 
      TOTAL_COLOUR_SIGNS + TOTAL_INTRODUCTION_WORDS + TOTAL_FAMILY_MEMBERS + 
      TOTAL_EMOTIONS_FEELINGS + TOTAL_COMMON_ACTIONS + TOTAL_ASKING_QUESTIONS + 
      TOTAL_TIME_DAYS + TOTAL_FOOD_DRINKS + TOTAL_OBJECTS_THINGS + 
      TOTAL_ANIMALS + TOTAL_SEASONS_WEATHER + TOTAL_PHRASES;

    const actualSignsLearned = learnedSigns.length;
    const calcLessonsCompleted = Math.min(lessonsCompleted, TOTAL_LESSONS);
    const calcSignsLearned = Math.min(actualSignsLearned, TOTAL_SIGNS_AVAILABLE);

    const lessonProgress = (calcLessonsCompleted + calcSignsLearned) / 
      (TOTAL_LESSONS + TOTAL_SIGNS_AVAILABLE) * 100;

    const progressPercent = Math.min(100, Math.round(lessonProgress));

    console.log('LearningStats Debug:', {
      signsLearned,
      actualSignsLearned, 
      learnedSignsArray: learnedSigns,
      arrayLength: learnedSigns.length,
      totalAvailable: TOTAL_SIGNS_AVAILABLE
    });

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
          <p className="stat-value">
                        {actualSignsLearned}/{TOTAL_SIGNS_AVAILABLE}
</p>
          <p className="stat-label">Signs Learned</p>
                     {actualSignsLearned !== signsLearned && (
                        <p className="stat-warning" style={{ fontSize: '10px', color: '#ff6b6b' }}>
                            (Syncing: {signsLearned})
                        </p>
                    )}
                </div>
                <div className="stat-card">
                    <p className="stat-value">{learnedPhrases.length}</p>
                    <p className="stat-label">Phrases Learned</p>
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

