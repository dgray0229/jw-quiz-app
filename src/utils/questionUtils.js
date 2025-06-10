// src/utils/questionUtils.js
// Utilities for handling randomizable questions with optional explanations

/**
 * Shuffle answer options while preserving their properties
 * @param {Array} answerOptions - Array of answer option objects
 * @returns {Array} Shuffled array of answer options
 */
export const shuffleAnswers = (answerOptions) => {
  if (!answerOptions || !Array.isArray(answerOptions)) {
    console.warn('Invalid answerOptions provided to shuffleAnswers');
    return [];
  }

  const shuffled = [...answerOptions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
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

  return answerOptions.filter(option => option.is_correct === true);
};

/**
 * Validate if selected answers are correct
 * @param {Array} selectedOptions - Array of selected answer option objects
 * @param {Array} answerOptions - Array of all answer option objects
 * @param {boolean} allowPartialCredit - Whether to allow partial credit for multiple correct answers
 * @returns {Object} Validation result with score and details
 */
export const validateAnswer = (selectedOptions, answerOptions, allowPartialCredit = false) => {
  if (!selectedOptions || !answerOptions) {
    return { isCorrect: false, score: 0, details: 'Invalid input' };
  }

  const correctAnswers = getCorrectAnswers(answerOptions);
  const selectedCorrect = selectedOptions.filter(opt => opt.is_correct === true);
  const selectedIncorrect = selectedOptions.filter(opt => opt.is_correct !== true);

  // Single correct answer scenario
  if (correctAnswers.length === 1) {
    const isCorrect = selectedOptions.length === 1 && selectedOptions[0].is_correct === true;
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      details: {
        correctAnswers: correctAnswers.length,
        selectedCorrect: selectedCorrect.length,
        selectedIncorrect: selectedIncorrect.length
      }
    };
  }

  // Multiple correct answers scenario
  if (correctAnswers.length > 1) {
    if (allowPartialCredit) {
      const maxScore = correctAnswers.length;
      const positiveScore = Math.max(0, selectedCorrect.length - selectedIncorrect.length);
      const score = Math.min(positiveScore / maxScore, 1);
      
      return {
        isCorrect: score === 1,
        score,
        details: {
          correctAnswers: correctAnswers.length,
          selectedCorrect: selectedCorrect.length,
          selectedIncorrect: selectedIncorrect.length,
          partialCredit: true
        }
      };
    } else {
      const isCorrect = selectedCorrect.length === correctAnswers.length && selectedIncorrect.length === 0;
      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        details: {
          correctAnswers: correctAnswers.length,
          selectedCorrect: selectedCorrect.length,
          selectedIncorrect: selectedIncorrect.length
        }
      };
    }
  }

  return { isCorrect: false, score: 0, details: 'No correct answers found' };
};

/**
 * Process question data to handle both old and new formats
 * @param {Object} question - Question object from database
 * @returns {Object} Processed question with normalized format
 */
export const processQuestionData = (question) => {
  if (!question) return null;

  // New enhanced format
  if (question.answer_options?.answer_options) {
    return {
      ...question,
      answerOptions: question.answer_options.answer_options,
      shuffleAnswers: question.answer_options.shuffle_answers !== false, // Default true
      multipleCorrect: question.answer_options.multiple_correct === true, // Default false
      hasExplanations: question.answer_options.answer_options.some(opt => opt.explanation)
    };
  }

  // Legacy format with simple answer_options array
  if (question.answer_options && Array.isArray(question.answer_options)) {
    return {
      ...question,
      answerOptions: question.answer_options.map((option, index) => ({
        id: String.fromCharCode(97 + index),
        text: typeof option === 'string' ? option : option.text || option,
        is_correct: index === question.correct_answer,
        explanation: null
      })),
      shuffleAnswers: false, // Disable shuffling to prevent quiz reset issues
      multipleCorrect: false,
      hasExplanations: false
    };
  }

  // Very old format with separate options and correct_answer
  if (question.options && Array.isArray(question.options)) {
    return {
      ...question,
      answerOptions: question.options.map((option, index) => ({
        id: String.fromCharCode(97 + index),
        text: option,
        is_correct: index === question.correct_answer,
        explanation: null
      })),
      shuffleAnswers: false, // Disable shuffling to prevent quiz reset issues
      multipleCorrect: false,
      hasExplanations: false
    };
  }

  console.warn('Question format not recognized:', question);
  return null;
};

/**
 * Get explanation for a specific answer option (if available)
 * @param {Object} answerOption - Answer option object
 * @returns {string|null} Explanation text or null if not available
 */
export const getAnswerExplanation = (answerOption) => {
  if (!answerOption || typeof answerOption !== 'object') {
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

  return answerOptions.some(option => 
    option.explanation && 
    option.explanation.trim().length > 0
  );
};

/**
 * Get explanations for specific answer types
 * @param {Array} answerOptions - Array of answer option objects
 * @param {string} type - 'correct', 'incorrect', or 'all'
 * @returns {Array} Array of explanations
 */
export const getExplanationsByType = (answerOptions, type = 'all') => {
  if (!answerOptions || !Array.isArray(answerOptions)) {
    return [];
  }

  let filteredOptions = answerOptions;

  if (type === 'correct') {
    filteredOptions = answerOptions.filter(opt => opt.is_correct === true);
  } else if (type === 'incorrect') {
    filteredOptions = answerOptions.filter(opt => opt.is_correct !== true);
  }

  return filteredOptions
    .filter(opt => opt.explanation && opt.explanation.trim().length > 0)
    .map(opt => ({
      text: opt.text,
      explanation: opt.explanation,
      isCorrect: opt.is_correct
    }));
};

/**
 * Create a summary of answer validation with explanations
 * @param {Object} validationResult - Result from validateAnswer function
 * @param {Array} selectedOptions - Selected answer options
 * @param {Array} answerOptions - All answer options
 * @returns {Object} Summary with explanations
 */
export const createAnswerSummary = (validationResult, selectedOptions, answerOptions) => {
  const correctAnswers = getCorrectAnswers(answerOptions);
  const selectedCorrect = selectedOptions.filter(opt => opt.is_correct === true);
  const selectedIncorrect = selectedOptions.filter(opt => opt.is_correct !== true);

  return {
    ...validationResult,
    summary: {
      totalQuestions: answerOptions.length,
      correctAnswers: correctAnswers.length,
      selectedAnswers: selectedOptions.length,
      selectedCorrect: selectedCorrect.length,
      selectedIncorrect: selectedIncorrect.length
    },
    explanations: {
      correct: getExplanationsByType(answerOptions, 'correct'),
      incorrect: getExplanationsByType(answerOptions, 'incorrect'),
      hasExplanations: hasAnyExplanations(answerOptions)
    }
  };
};
