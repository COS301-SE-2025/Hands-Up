import { useLearningStats } from "../context/learningStatsContext";

export function useStatUpdater() {
 const { stats, updateStats } = useLearningStats();

  const handleUpdate = (type, level = null) => {
    const newStats = {
      lessonsCompleted: type === "lesson" ? stats.lessonsCompleted + 1 : stats.lessonsCompleted,
      signsLearned: type === "sign" ? stats.signsLearned + 1 : stats.signsLearned,
      streak: type === "streak" ? stats.streak + 1 : stats.streak,
      currentLevel: type === "level"? level ? level : stats.currentLevel : stats.currentLevel,
    };
    updateStats(newStats);
  };

  return handleUpdate;
}