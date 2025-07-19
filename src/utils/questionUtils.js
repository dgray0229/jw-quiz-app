// src/utils/questionUtils.js
// Utilities for handling randomizable questions with optional explanations

/**
 * Shuffle answer options while preserving their properties
 * @param {Array} answerOptions - Array of answer option objects
 * @param {string|number} seed - Optional seed for consistent shuffling
 * @returns {Array} Shuffled array of answer options
 */
export const shuffleAnswers = (answerOptions, seed = null) => {
	if (!answerOptions || !Array.isArray(answerOptions)) {
		console.warn("Invalid answerOptions provided to shuffleAnswers");
		return [];
	}

	// If seed is provided, use a seeded random number generator
	// This ensures consistent shuffling for the same question
	const shuffled = [...answerOptions];
	
	if (seed !== null) {
		// Simple seeded random using the seed to generate consistent indices
		const seedNum = typeof seed === 'string' ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : seed;
		
		// Fisher-Yates shuffle with seeded random
		for (let i = shuffled.length - 1; i > 0; i--) {
			// Generate a pseudo-random index based on seed and current position
			const j = Math.floor((seedNum * (i + 1) * 9301 + 49297) % 233280 / 233280 * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
	} else {
		// Regular random shuffle
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
	}
	
	return shuffled;
};

/**
 * Get all correct answers from answer options
 * @param {Array} answerOptions - Array of answer option objects
 * @returns {Array} Array of correct answer options
 */
export const getCorrectAnswers = (answerOptions) => {
	if (!answerOptions || !Array.isArray(answerOptions)) {
		return [];
	}

	return answerOptions.filter((option) => option.is_correct === true);
};

/**
 * Validate if selected answers are correct
 * @param {Array} selectedOptions - Array of selected answer option objects
 * @param {Array} answerOptions - Array of all answer option objects
 * @param {boolean} allowPartialCredit - Whether to allow partial credit for multiple correct answers
 * @returns {Object} Validation result with score and details
 */
export const validateAnswer = (
	selectedOptions,
	answerOptions,
	allowPartialCredit = false
) => {
	if (!selectedOptions || !answerOptions) {
		return { isCorrect: false, score: 0, details: "Invalid input" };
	}

	const correctAnswers = getCorrectAnswers(answerOptions);
	const selectedCorrect = selectedOptions.filter(
		(opt) => opt.is_correct === true
	);
	const selectedIncorrect = selectedOptions.filter(
		(opt) => opt.is_correct !== true
	);

	// Single correct answer scenario
	if (correctAnswers.length === 1) {
		const isCorrect =
			selectedOptions.length === 1 && selectedOptions[0].is_correct === true;
		return {
			isCorrect,
			score: isCorrect ? 1 : 0,
			details: {
				correctAnswers: correctAnswers.length,
				selectedCorrect: selectedCorrect.length,
				selectedIncorrect: selectedIncorrect.length,
			},
		};
	}

	// Multiple correct answers scenario
	if (correctAnswers.length > 1) {
		if (allowPartialCredit) {
			const maxScore = correctAnswers.length;
			const positiveScore = Math.max(
				0,
				selectedCorrect.length - selectedIncorrect.length
			);
			const score = Math.min(positiveScore / maxScore, 1);

			return {
				isCorrect: score === 1,
				score,
				details: {
					correctAnswers: correctAnswers.length,
					selectedCorrect: selectedCorrect.length,
					selectedIncorrect: selectedIncorrect.length,
					partialCredit: true,
				},
			};
		} else {
			const isCorrect =
				selectedCorrect.length === correctAnswers.length &&
				selectedIncorrect.length === 0;
			return {
				isCorrect,
				score: isCorrect ? 1 : 0,
				details: {
					correctAnswers: correctAnswers.length,
					selectedCorrect: selectedCorrect.length,
					selectedIncorrect: selectedIncorrect.length,
				},
			};
		}
	}

	return { isCorrect: false, score: 0, details: "No correct answers found" };
};

/**
 * Process question data to handle all format variations
 * This is the SINGLE source of truth for question format transformation
 * @param {Object} question - Question object from database
 * @returns {Object} Processed question with normalized enhanced format
 */
export const processQuestionData = (question) => {
	if (!question) return null;

	console.log(`Processing question ${question.id || 'unknown'}, correct_answer: ${question.correct_answer}`);
	
	let answerOptions = null;
	let metadata = {
		shuffleAnswers: false,
		multipleCorrect: false
	};

	// Case 1: Nested enhanced format (answer_options is an object with metadata)
	if (question.answer_options && typeof question.answer_options === 'object' && !Array.isArray(question.answer_options) && question.answer_options.answer_options) {
		console.log('Detected nested enhanced format');
		answerOptions = question.answer_options.answer_options;
		metadata.shuffleAnswers = question.answer_options.shuffle_answers !== false;
		metadata.multipleCorrect = question.answer_options.multiple_correct === true;
	}
	// Case 2: Direct array of objects with is_correct property
	else if (Array.isArray(question.answer_options) && question.answer_options.length > 0 && typeof question.answer_options[0] === 'object' && 'is_correct' in question.answer_options[0]) {
		console.log('Detected direct enhanced format');
		answerOptions = question.answer_options;
	}
	// Case 3: Legacy array of strings with separate correct_answer index
	else if (Array.isArray(question.answer_options)) {
		console.log('Detected legacy string array format');
		answerOptions = question.answer_options.map((option, index) => ({
			id: String.fromCharCode(97 + index),
			text: typeof option === "string" ? option : String(option),
			is_correct: index === (question.correct_answer || 0),
			explanation: null
		}));
	}
	// Case 4: Old format with separate 'options' field
	else if (Array.isArray(question.options)) {
		console.log('Detected old options array format');
		answerOptions = question.options.map((option, index) => ({
			id: String.fromCharCode(97 + index),
			text: typeof option === "string" ? option : String(option),
			is_correct: index === (question.correct_answer || 0),
			explanation: null
		}));
	}
	// Case 5: String that needs to be parsed
	else if (typeof question.answer_options === 'string') {
		try {
			console.log('Attempting to parse string answer_options');
			const parsed = JSON.parse(question.answer_options);
			// Recursively process the parsed result
			return processQuestionData({ ...question, answer_options: parsed });
		} catch (error) {
			console.error('Failed to parse answer_options string:', error);
			// Fallback to default options
			answerOptions = ["Option A", "Option B", "Option C", "Option D"].map((text, index) => ({
				id: String.fromCharCode(97 + index),
				text,
				is_correct: index === 0,
				explanation: null
			}));
		}
	}
	else {
		console.warn('Unknown answer_options format:', question.answer_options);
		// Fallback to default options
		answerOptions = ["Option A", "Option B", "Option C", "Option D"].map((text, index) => ({
			id: String.fromCharCode(97 + index),
			text,
			is_correct: index === 0,
			explanation: null
		}));
	}

	// Handle case where correct_answer is -1 but no is_correct flags are set
	if (question.correct_answer === -1) {
		const hasCorrectAnswer = answerOptions.some(opt => opt.is_correct === true);
		if (!hasCorrectAnswer && answerOptions.length > 0) {
			console.warn(`Question ${question.id} has correct_answer: -1 but no is_correct flags. Setting first option as correct.`);
			answerOptions[0].is_correct = true;
		}
	}

	// Ensure all answer options have required properties
	answerOptions = answerOptions.map((opt, index) => ({
		id: opt.id || String.fromCharCode(97 + index),
		text: opt.text || `Option ${index + 1}`,
		is_correct: opt.is_correct === true,
		explanation: opt.explanation || null
	}));

	// Check if any option has an explanation
	const hasExplanations = answerOptions.some(opt => opt.explanation !== null);

	// Return normalized question
	return {
		...question,
		questionText: question.questionText || question.question_text || "",
		answerOptions,
		shuffleAnswers: metadata.shuffleAnswers,
		multipleCorrect: metadata.multipleCorrect,
		hasExplanations,
		// Remove the old correct_answer field to avoid confusion
		correct_answer: undefined,
		correctAnswer: undefined
	};
};

/**
 * Get explanation for a specific answer option (if available)
 * @param {Object} answerOption - Answer option object
 * @returns {string|null} Explanation text or null if not available
 */
export const getAnswerExplanation = (answerOption) => {
	if (!answerOption || typeof answerOption !== "object") {
		return null;
	}

	return answerOption.explanation || null;
};

/**
 * Check if question has any explanations available
 * @param {Array} answerOptions - Array of answer option objects
 * @returns {boolean} True if any answer has an explanation
 */
export const hasAnyExplanations = (answerOptions) => {
	if (!answerOptions || !Array.isArray(answerOptions)) {
		return false;
	}

	return answerOptions.some(
		(option) => option.explanation && option.explanation.trim().length > 0
	);
};

/**
 * Get explanations for specific answer types
 * @param {Array} answerOptions - Array of answer option objects
 * @param {string} type - 'correct', 'incorrect', or 'all'
 * @returns {Array} Array of explanations
 */
export const getExplanationsByType = (answerOptions, type = "all") => {
	if (!answerOptions || !Array.isArray(answerOptions)) {
		return [];
	}

	let filteredOptions = answerOptions;

	if (type === "correct") {
		filteredOptions = answerOptions.filter((opt) => opt.is_correct === true);
	} else if (type === "incorrect") {
		filteredOptions = answerOptions.filter((opt) => opt.is_correct !== true);
	}

	return filteredOptions
		.filter((opt) => opt.explanation && opt.explanation.trim().length > 0)
		.map((opt) => ({
			text: opt.text,
			explanation: opt.explanation,
			isCorrect: opt.is_correct,
		}));
};

/**
 * Create a summary of answer validation with explanations
 * @param {Object} validationResult - Result from validateAnswer function
 * @param {Array} selectedOptions - Selected answer options
 * @param {Array} answerOptions - All answer options
 * @returns {Object} Summary with explanations
 */
export const createAnswerSummary = (
	validationResult,
	selectedOptions,
	answerOptions
) => {
	const correctAnswers = getCorrectAnswers(answerOptions);
	const selectedCorrect = selectedOptions.filter(
		(opt) => opt.is_correct === true
	);
	const selectedIncorrect = selectedOptions.filter(
		(opt) => opt.is_correct !== true
	);

	return {
		...validationResult,
		summary: {
			totalQuestions: answerOptions.length,
			correctAnswers: correctAnswers.length,
			selectedAnswers: selectedOptions.length,
			selectedCorrect: selectedCorrect.length,
			selectedIncorrect: selectedIncorrect.length,
		},
		explanations: {
			correct: getExplanationsByType(answerOptions, "correct"),
			incorrect: getExplanationsByType(answerOptions, "incorrect"),
			hasExplanations: hasAnyExplanations(answerOptions),
		},
	};
};
