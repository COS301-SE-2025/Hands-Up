export const levelNames = [
  "Bronze",     
  "Silver",     
  "Gold",       
  "Platinum",   
  "Diamond",    
  "Ruby",       
];

export function getLevelNameByIndex(index) {
  return levelNames[index] || "Bronze";
}

export function calculateLevelIndex(stats) {
  const score = stats.lessonsCompleted + stats.signsLearned + stats.streak;
  return Math.min(Math.floor(score / 5), levelNames.length - 1); 
}
