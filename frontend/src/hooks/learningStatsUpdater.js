import { useLearningStats } from "../contexts/learningStatsContext";

export function useStatUpdater(){
  const { stats, updateStats } = useLearningStats();

  const handleUpdate = (type) => { 
    let newStats = { ...stats };

    if (type === "lesson") {
      newStats.lessonsCompleted = newStats.lessonsCompleted + 1;
    } else if (type === "sign") {
      newStats.signsLearned = newStats.signsLearned + 1;
    } else if (type === "streak") {
      newStats.streak = newStats.streak + 1;
    }

    const TOTAL_LESSONS = 30;
    const calcLessonsCompleted = Math.min(newStats.lessonsCompleted || 0, TOTAL_LESSONS);
    const totalProgress = calcLessonsCompleted + (newStats.signsLearned || 0) + ((newStats.streak || 0) % 365);

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

    if (calculatedLevel !== newStats.currentLevel) {
      newStats.currentLevel = calculatedLevel;
    }

    updateStats(newStats);
  };

  return handleUpdate;
}
