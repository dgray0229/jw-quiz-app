import React, { createContext, useState, useContext, useEffect } from "react";
import databaseService from "../services/databaseService";
import * as Device from "expo-device";
import { debugQuestions, fixProblematicQuestions } from "../utils/debugQuestions";
import { processQuestionData } from "../utils/questionUtils";

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
	const [categories, setCategories] = useState([]);
	const [quizzes, setQuizzes] = useState([]); // Flat array of quizzes
	const [questions, setQuestions] = useState([]); // Flat array of questions
	const [scores, setScores] = useState({}); // { quizId: bestScore }
	const [loading, setLoading] = useState(true);
	const [deviceId, setDeviceId] = useState(null);

	// Generate or get a persistent device ID for anonymous users
	useEffect(() => {
		const getOrCreateDeviceId = async () => {
			let id = null;
			try {
				// Try localStorage for web
				if (typeof localStorage !== 'undefined') {
					id = localStorage.getItem("quiz_device_id");
					if (!id) {
						id = `${Device.modelName || "web"}-${Date.now()}-${Math.random()
							.toString(36)
							.substring(2, 9)}`;
						localStorage.setItem("quiz_device_id", id);
					}
				} else {
					// For React Native, create a unique device ID
					id = `${Device.modelName || "mobile"}-${Date.now()}-${Math.random()
						.toString(36)
						.substring(2, 9)}`;
				}
			} catch (e) {
				// fallback for any environment
				id = `device-${Date.now()}-${Math.random()
					.toString(36)
					.substring(2, 9)}`;
			}
			setDeviceId(id);
		};
		getOrCreateDeviceId();
	}, []);

	// Fetch all categories from database
	const fetchCategories = async () => {
		try {
			const { data, error } = await databaseService.from("categories").select("*");
			if (!error) {
				console.log(`Fetched ${data.length} categories from database:`, data);
				setCategories(data);
			} else {
				console.error("Error fetching categories:", error);
			}
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	// Fetch all quizzes from database
	const fetchQuizzes = async () => {
		try {
			const { data, error } = await databaseService.from("quizzes").select("*");
			if (!error) {
				console.log(`Fetched ${data.length} quizzes from database:`, data);
				setQuizzes(data);
			} else {
				console.error("Error fetching quizzes:", error);
			}
		} catch (error) {
			console.error("Error fetching quizzes:", error);
		}
	};

	// Fetch all questions from database
	const fetchQuestions = async () => {
		try {
			const { data, error } = await databaseService.from("questions").select("*");
			if (!error) {
				console.log(`Fetched ${data.length} questions from database:`, data);
				
				// Debug the questions to identify problematic data
				debugQuestions(data);
				
				// Fix any problematic questions before storing
				const fixedQuestions = fixProblematicQuestions(data);
				setQuestions(fixedQuestions);
			} else {
				console.error("Error fetching questions:", error);
			}
		} catch (error) {
			console.error("Error fetching questions:", error);
		}
	};

	// Fetch best scores for this device from database
	const fetchScores = async (deviceId) => {
		if (!deviceId) return;
		try {
			const { data, error } = await databaseService.getDeviceScores(deviceId);
			if (!error && data) {
				// Map to { quizId: bestScore }
				const bestScores = {};
				data.forEach(({ quiz_id, score }) => {
					if (!bestScores[quiz_id] || score > bestScores[quiz_id]) {
						bestScores[quiz_id] = score;
					}
				});
				setScores(bestScores);
				console.log(`Fetched scores for device ${deviceId}:`, bestScores);
			}
		} catch (error) {
			console.error("Error fetching scores:", error);
		}
	};

	// Initial load
	useEffect(() => {
		const loadAll = async () => {
			setLoading(true);
			
			// Initialize database and seed initial data if needed
			await databaseService.initialize();
			await databaseService.seedInitialData();
			
			await fetchCategories();
			await fetchQuizzes();
			await fetchQuestions();
			if (deviceId) await fetchScores(deviceId);
			setLoading(false);
		};
		loadAll();
		// eslint-disable-next-line
	}, [deviceId]);

	// Get all quizzes for a specific category (with questions attached)
	const getQuizzesForCategory = (categoryId) => {
		console.log(`Getting quizzes for category ${categoryId}`);

		const filteredQuizzes = quizzes.filter(
			(quiz) => String(quiz.category_id) === String(categoryId)
		);

		console.log(
			`Found ${filteredQuizzes.length} quizzes for category ${categoryId}:`,
			filteredQuizzes
		);

		// Attach questions to each quiz
		const enrichedQuizzes = filteredQuizzes.map((quiz) => {
			const quizQuestions = questions
				.filter((q) => String(q.quiz_id) === String(quiz.id))
				.map((question) => {
					// Use the centralized processQuestionData function
					const processedQuestion = processQuestionData(question);
					if (!processedQuestion) {
						console.error(`Failed to process question ${question.id}`);
						return null;
					}
					return processedQuestion;
				})
				.filter(q => q !== null); // Remove any failed questions

			console.log(`Quiz ${quiz.id} has ${quizQuestions.length} questions`);

			return { ...quiz, questions: quizQuestions };
		});

		console.log(`Returning ${enrichedQuizzes.length} enriched quizzes`);
		return enrichedQuizzes;
	};

	// Get a specific quiz by its ID (with questions)
	const getQuizById = (categoryId, quizId) => {
		console.log(`Getting quiz ${quizId} for category ${categoryId}`);

		const quiz = quizzes.find((q) => String(q.id) === String(quizId));
		if (!quiz) {
			console.log(`Quiz ${quizId} not found`);
			return null;
		}

		const quizQuestions = questions
			.filter((q) => String(q.quiz_id) === String(quizId))
			.map((question) => {
				// Use the centralized processQuestionData function
				const processedQuestion = processQuestionData(question);
				if (!processedQuestion) {
					console.error(`Failed to process question ${question.id}`);
					return null;
				}
				return processedQuestion;
			})
			.filter(q => q !== null); // Remove any failed questions

		console.log(`Found ${quizQuestions.length} questions for quiz ${quizId}`);

		return { ...quiz, questions: quizQuestions };
	};

	// Get best score for a specific quiz
	const getScoreForQuiz = (quizId) => {
		return scores[quizId] || 0;
	};

	// Update (insert) a new quiz score for this device
	const updateScore = async (quizId, newScore) => {
		if (!deviceId) return;
		try {
			// Insert new score
			await databaseService.insertDeviceScore(deviceId, quizId, newScore);
			// Refresh scores
			await fetchScores(deviceId);
		} catch (error) {
			console.error("Error updating score:", error);
		}
	};

	// Refresh all data from database (for database reset functionality)
	const refreshData = async () => {
		console.log("Refreshing all data from database...");
		setLoading(true);
		await fetchCategories();
		await fetchQuizzes();
		await fetchQuestions();
		if (deviceId) await fetchScores(deviceId);
		setLoading(false);
		console.log("Data refresh completed");
	};

	const contextValue = {
		categories,
		quizzes,
		questions,
		scores,
		loading,
		getQuizzesForCategory,
		getQuizById,
		getScoreForQuiz,
		updateScore,
		refreshData,
	};

	return (
		<QuizContext.Provider value={contextValue}>{children}</QuizContext.Provider>
	);
};

export const useQuiz = () => {
	const context = useContext(QuizContext);
	if (context === undefined) {
		throw new Error("useQuiz must be used within a QuizProvider");
	}
	return context;
};

export default QuizContext;
