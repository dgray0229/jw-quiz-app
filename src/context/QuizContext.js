import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import * as Device from "expo-device";

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
				id = localStorage.getItem("quiz_device_id");
				if (!id) {
					id = `${Device.modelName || "web"}-${Date.now()}-${Math.random()
						.toString(36)
						.substring(2, 9)}`;
					localStorage.setItem("quiz_device_id", id);
				}
			} catch (e) {
				// fallback for React Native (no localStorage)
				id = `${Device.modelName || "mobile"}-${Date.now()}-${Math.random()
					.toString(36)
					.substring(2, 9)}`;
			}
			setDeviceId(id);
		};
		getOrCreateDeviceId();
	}, []);

	// Fetch all categories from Supabase
	const fetchCategories = async () => {
		const { data, error } = await supabase.from("categories").select("*");
		if (!error) setCategories(data);
	};

	// Fetch all quizzes from Supabase
	const fetchQuizzes = async () => {
		const { data, error } = await supabase.from("quizzes").select("*");
		if (!error) setQuizzes(data);
	};

	// Fetch all questions from Supabase
	const fetchQuestions = async () => {
		const { data, error } = await supabase.from("questions").select("*");
		if (!error) setQuestions(data);
	};

	// Fetch best scores for this device from Supabase
	const fetchScores = async (deviceId) => {
		if (!deviceId) return;
		const { data, error } = await supabase
			.from("device_scores")
			.select("quiz_id, score")
			.eq("device_id", deviceId);
		if (!error && data) {
			// Map to { quizId: bestScore }
			const bestScores = {};
			data.forEach(({ quiz_id, score }) => {
				if (!bestScores[quiz_id] || score > bestScores[quiz_id]) {
					bestScores[quiz_id] = score;
				}
			});
			setScores(bestScores);
		}
	};

	// Initial load
	useEffect(() => {
		const loadAll = async () => {
			setLoading(true);
			await fetchCategories();
			await fetchQuizzes();
			await fetchQuestions();
			if (deviceId) await fetchScores(deviceId);
			setLoading(false);
		};
		loadAll();
		// eslint-disable-next-line
	}, [deviceId]);

	// Get all quizzes for a specific category
	const getQuizzesForCategory = (categoryId) => {
		return quizzes.filter((quiz) => quiz.category_id === categoryId);
	};

	// Get a specific quiz by its ID (with questions)
	const getQuizById = (categoryId, quizId) => {
		const quiz = quizzes.find((q) => q.id === quizId);
		if (!quiz) return null;
		const quizQuestions = questions.filter((q) => q.quiz_id === quizId);
		return { ...quiz, questions: quizQuestions };
	};

	// Get best score for a specific quiz
	const getScoreForQuiz = (quizId) => {
		return scores[quizId] || 0;
	};

	// Update (insert) a new quiz score for this device
	const updateScore = async (quizId, newScore) => {
		if (!deviceId) return;
		// Insert new score
		await supabase.from("device_scores").insert({
			device_id: deviceId,
			quiz_id: quizId,
			score: newScore,
		});
		// Refresh scores
		await fetchScores(deviceId);
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
