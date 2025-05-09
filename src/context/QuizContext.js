// src/context/QuizContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { categories, quizzes, userScores } from "../data/dummyData";
import { getQuizScores, saveQuizScore } from "../utils/storage";

// Create context
const QuizContext = createContext();

// Quiz provider component
export const QuizProvider = ({ children }) => {
	const [allCategories, setAllCategories] = useState(categories);
	const [allQuizzes, setAllQuizzes] = useState(quizzes);
	const [scores, setScores] = useState({});
	const [loading, setLoading] = useState(true);

	// Load scores from AsyncStorage on mount
	useEffect(() => {
		const loadScores = async () => {
			try {
				const savedScores = await getQuizScores();
				// If no saved scores, use dummy data for initial demo
				setScores(
					Object.keys(savedScores).length > 0 ? savedScores : userScores
				);
			} catch (error) {
				console.error("Failed to load scores:", error);
				// Fallback to dummy data
				setScores(userScores);
			} finally {
				setLoading(false);
			}
		};

		loadScores();
	}, []);

	// Save a new quiz score
	const updateScore = async (quizId, newScore) => {
		await saveQuizScore(quizId, newScore);
		setScores((prev) => ({
			...prev,
			[quizId]: Math.max(newScore, prev[quizId] || 0),
		}));
	};

	// Get all quizzes for a specific category
	const getQuizzesForCategory = (categoryId) => {
		return allQuizzes[categoryId] || [];
	};

	// Get a specific quiz by its ID
	const getQuizById = (categoryId, quizId) => {
		const categoryQuizzes = allQuizzes[categoryId] || [];
		return categoryQuizzes.find((quiz) => quiz.id === quizId);
	};

	// Get best score for a specific quiz
	const getScoreForQuiz = (quizId) => {
		return scores[quizId] || 0;
	};

	// Exposed context value
	const contextValue = {
		categories: allCategories,
		quizzes: allQuizzes,
		scores,
		loading,
		getQuizzesForCategory,
		getQuizById,
		getScoreForQuiz,
		updateScore,
	};

	return (
		<QuizContext.Provider value={contextValue}>{children}</QuizContext.Provider>
	);
};

// Custom hook for using quiz context
export const useQuiz = () => {
	const context = useContext(QuizContext);
	if (context === undefined) {
		throw new Error("useQuiz must be used within a QuizProvider");
	}
	return context;
};

export default QuizContext;
