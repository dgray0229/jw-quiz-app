// DEPRECATED: All quiz data and scores are now managed via Supabase. Do not use these functions.
import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for storage
const SCORES_STORAGE_KEY = "quiz_app_scores";

// Save quiz score
export const saveQuizScore = async (quizId, score) => {
	try {
		// Get current scores
		const currentScores = await getQuizScores();

		// Update score only if it's better than the current one
		const updatedScores = {
			...currentScores,
			[quizId]: Math.max(score, currentScores[quizId] || 0),
		};

		// Save back to storage
		await AsyncStorage.setItem(
			SCORES_STORAGE_KEY,
			JSON.stringify(updatedScores)
		);
		return true;
	} catch (error) {
		console.error("Error saving quiz score:", error);
		return false;
	}
};

// Get all saved quiz scores
export const getQuizScores = async () => {
	try {
		const scores = await AsyncStorage.getItem(SCORES_STORAGE_KEY);
		return scores ? JSON.parse(scores) : {};
	} catch (error) {
		console.error("Error getting quiz scores:", error);
		return {};
	}
};

// Get score for a specific quiz
export const getQuizScore = async (quizId) => {
	try {
		const scores = await getQuizScores();
		return scores[quizId] || 0;
	} catch (error) {
		console.error("Error getting specific quiz score:", error);
		return 0;
	}
};

// Clear all scores (for testing)
export const clearAllScores = async () => {
	try {
		await AsyncStorage.removeItem(SCORES_STORAGE_KEY);
		return true;
	} catch (error) {
		console.error("Error clearing scores:", error);
		return false;
	}
};
