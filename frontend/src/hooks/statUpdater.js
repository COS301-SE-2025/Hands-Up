import { useLearningStats } from "../contexts/learningStatsContext";

export function useStatUpdater() {
    const { stats, updateStats, addLearnedSign, addLearnedPhrase, completeQuiz } = useLearningStats();

    const handleUpdate = (type, identifier = null) => {
        console.log(`handleUpdate called with type: ${type}, identifier: ${identifier}`);
        
        if (type === "lesson") {
            updateStats(prevStats => ({
                ...prevStats,
                lessonsCompleted: (prevStats.lessonsCompleted || 0) + 1
            }));
        } 
        else if (type === "sign" && identifier) {
            addLearnedSign(identifier);
        } 
        else if (type === "phrase" && identifier) {
            addLearnedPhrase(identifier);
        }
        else if (type === "quiz" && identifier) {
            completeQuiz(identifier);
        }
        else if (type === "streak") {
            updateStats(prevStats => ({
                ...prevStats,
                streak: (prevStats.streak || 0) + 1
            }));
        }
        else if (type === "placement_complete") {
            const results = identifier; 
            updateStats(prevStats => ({
                ...prevStats,
                placementTestCompleted: true,
                placementResults: results,
                unlockedCategories: [...new Set([
                    'alphabets',
                    ...(prevStats.unlockedCategories || []),
                    ...(results.unlockedCategories || [])
                ])],
                startingLevel: results.startingLevel || 'beginner'
            }));
        }
    };

    const isSignLearned = (sign) => {
        return stats?.learnedSigns?.includes(sign.toLowerCase()) || false;
    };

    const isPhraseLearned = (phraseId) => {
        return stats?.learnedPhrases?.includes(phraseId) || false;
    };

    const isQuizCompleted = (categoryId) => {
        const quizKey = `${categoryId}QuizCompleted`;
        return stats?.[quizKey] || false;
    };

    const getCurrentStats = () => {
        return {
            lessonsCompleted: stats?.lessonsCompleted || 0,
            signsLearned: stats?.learnedSigns?.length || 0,
            streak: stats?.streak || 0,
            currentLevel: stats?.currentLevel || 'Bronze',
            quizzesCompleted: stats?.quizzesCompleted || 0,
            learnedSigns: stats?.learnedSigns || [],
            learnedPhrases: stats?.learnedPhrases || [],
            unlockedCategories: stats?.unlockedCategories || ['alphabets'],
            placementTestCompleted: stats?.placementTestCompleted || false
        };
    };

    return {
        handleUpdate,
        isSignLearned,
        isPhraseLearned,
        isQuizCompleted,
        getCurrentStats,
        stats
    };
}