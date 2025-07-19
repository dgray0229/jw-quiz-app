// src/screens/QuizScreen.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import {
	ProgressBar,
	Text,
	Button,
	IconButton,
	Portal,
	Dialog,
	Paragraph,
	useTheme,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuiz } from "../context/QuizContext";
import EnhancedQuestionCard from "../components/EnhancedQuestionCard";

const QuizScreen = ({ route, navigation }) => {
	const { categoryId, quizId } = route.params;
	const theme = useTheme();
	const { getQuizById } = useQuiz();

	// State
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [quiz, setQuiz] = useState(null);
	const [exitDialogVisible, setExitDialogVisible] = useState(false);

	// Load quiz data
	useEffect(() => {
		const quizData = getQuizById(categoryId, quizId);
		console.log("QuizScreen: loaded quiz data:", quizData);
		console.log("QuizScreen: quiz has questions:", quizData?.questions?.length);
		setQuiz(quizData);

		// Set up navigation options to confirm exit
		navigation.setOptions({
			headerLeft: () => (
				<IconButton
					icon="arrow-left"
					color="#fff"
					size={24}
					onPress={handleBackPress}
					style={{ marginLeft: 8 }}
				/>
			),
		});
	}, [categoryId, quizId]);

	// Handle back button press
	const handleBackPress = () => {
		// Show exit confirmation if answers have been selected
		if (Object.keys(selectedAnswers).length > 0) {
			setExitDialogVisible(true);
		} else {
			navigation.goBack();
		}
	};

	// Select answer for the current question
	const handleAnswerSelection = (answerData) => {
		// Handle both old format (index) and new format (option object)
		let answerIndex;

		if (typeof answerData === "number") {
			// Old format: direct index
			answerIndex = answerData;
		} else if (answerData && typeof answerData === "object") {
			// New format: option object - find the index in the original options
			const currentQuestion = quiz?.questions[currentQuestionIndex];
			if (currentQuestion?.answer_options) {
				// For enhanced format, find index by matching option text or id
				answerIndex = currentQuestion.answer_options.findIndex(
					(opt) =>
						(typeof opt === "object" && opt.id === answerData.id) ||
						opt === answerData.text ||
						opt === answerData
				);
			} else if (currentQuestion?.options) {
				// For old format, find index by matching text
				answerIndex = currentQuestion.options.findIndex(
					(opt) => opt === answerData.text
				);
			}

			if (answerIndex === -1) {
				console.warn("Could not find answer index for:", answerData);
				answerIndex = 0;
			}
		}

		console.log(
			`QuizScreen: Answer selected for question ${currentQuestionIndex}: ${answerIndex}`
		);

		// Update selected answers state
		setSelectedAnswers((prev) => {
			const newAnswers = {
				...prev,
				[currentQuestionIndex]: answerIndex,
			};
			console.log("Updated selected answers:", newAnswers);
			return newAnswers;
		});
	};

	// Move to the next question
	const handleNextQuestion = () => {
		if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
		}
	};

	// Move to the previous question
	const handlePrevQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
		}
	};

	// Submit the quiz
	const handleSubmitQuiz = () => {
		// Calculate score
		if (!quiz) return;

		let correctAnswers = 0;
		quiz.questions.forEach((question, index) => {
			console.log(`\nChecking question ${index + 1}:`);
			console.log(`Question: ${question.questionText}`);
			console.log(`Selected answer index: ${selectedAnswers[index]}`);
			
			// Since we're using processQuestionData, all questions should have normalized answerOptions
			const answerOptions = question.answerOptions;
			
			if (!answerOptions || !Array.isArray(answerOptions)) {
				console.error(`Question ${index + 1} has invalid answerOptions:`, answerOptions);
				return;
			}
			
			// All questions now have is_correct flags thanks to processQuestionData
			const selectedOption = answerOptions[selectedAnswers[index]];
			
			if (selectedOption && selectedOption.is_correct) {
				correctAnswers++;
				console.log(`✓ Correct! Selected: "${selectedOption.text}"`);
			} else {
				console.log(`✗ Incorrect. Selected: "${selectedOption?.text || 'none'}"`);
				// Log which was the correct answer
				const correctOption = answerOptions.find(opt => opt.is_correct);
				console.log(`  Correct answer was: "${correctOption?.text || 'not found'}"`);
			}
		});

		console.log(`\n=== Final Score: ${correctAnswers}/${quiz.questions.length} ===\n`);

		// Navigate to results screen
		navigation.navigate("Result", {
			score: correctAnswers,
			totalQuestions: quiz.questions.length,
			quizId: quiz.id,
			quizTitle: quiz.title,
			categoryId: categoryId,
			answers: selectedAnswers,
		});
	};

	// Handle exit confirmation
	const handleConfirmExit = () => {
		setExitDialogVisible(false);
		navigation.goBack();
	};

	// If quiz data is not loaded yet
	if (!quiz) {
		return (
			<View style={styles.loadingContainer}>
				<Text>Loading quiz...</Text>
			</View>
		);
	}

	// If quiz has no questions
	if (!quiz.questions || quiz.questions.length === 0) {
		return (
			<View style={styles.loadingContainer}>
				<Text>This quiz has no questions yet.</Text>
				<Button
					mode="contained"
					onPress={() => navigation.goBack()}
					style={{ marginTop: 16 }}
				>
					Go Back
				</Button>
			</View>
		);
	}

	// Current question - already processed by processQuestionData in QuizContext
	const currentQuestion = quiz.questions[currentQuestionIndex];
	
	if (!currentQuestion) {
		console.error("No question found at index:", currentQuestionIndex);
	} else {
		console.log("Current question:", {
			id: currentQuestion.id,
			questionText: currentQuestion.questionText,
			answerCount: currentQuestion.answerOptions?.length || 0,
			shuffleAnswers: currentQuestion.shuffleAnswers,
			hasExplanations: currentQuestion.hasExplanations
		});
	}
	const progress = (currentQuestionIndex + 1) / quiz.questions.length;
	const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

	// Debug the selected answers
	console.log("Current selected answers:", selectedAnswers);
	console.log("Current question index:", currentQuestionIndex);
	console.log(
		"Is question answered:",
		selectedAnswers[currentQuestionIndex] !== undefined
	);

	const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
	const allQuestionsAnswered = quiz.questions.every(
		(_, index) => selectedAnswers[index] !== undefined
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				{/* Progress information */}
				<View style={styles.progressContainer}>
					<Text style={styles.progressText}>
						Question {currentQuestionIndex + 1} of {quiz.questions.length}
					</Text>
					<ProgressBar
						progress={progress}
						color={theme.colors.primary}
						style={styles.progressBar}
					/>
				</View>

				{/* Question in a fixed height container */}
				<View style={styles.questionContainer}>
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
					>
						<EnhancedQuestionCard
							question={currentQuestion}
							onAnswer={handleAnswerSelection}
							selectedAnswer={selectedAnswers[currentQuestionIndex]}
							showResults={false}
							key={`question-${currentQuestionIndex}`} /* Add key to ensure re-render */
						/>
					</ScrollView>
				</View>

				{/* Navigation buttons - fixed at bottom with clear text and icons */}
				<View style={styles.buttonsContainer}>
					{/* Previous button */}
					<Button
						mode="outlined"
						onPress={handlePrevQuestion}
						disabled={currentQuestionIndex === 0}
						style={[styles.navigationButton, styles.prevButton]}
						icon="chevron-left"
						contentStyle={styles.buttonContentLeft}
						labelStyle={styles.buttonLabel}
					>
						Previous
					</Button>

					{isLastQuestion ? (
						/* Submit button */
						<Button
							mode="contained"
							onPress={handleSubmitQuiz}
							disabled={!allQuestionsAnswered}
							style={[styles.navigationButton, styles.nextButton]}
							icon="check-circle"
							contentStyle={styles.buttonContentRight}
							labelStyle={styles.buttonLabel}
						>
							Submit
						</Button>
					) : (
						/* Next button */
						<Button
							mode="contained"
							onPress={handleNextQuestion}
							disabled={!isAnswered}
							style={[styles.navigationButton, styles.nextButton]}
							icon="chevron-right"
							contentStyle={styles.buttonContentRight}
							labelStyle={styles.buttonLabel}
						>
							Next
						</Button>
					)}
				</View>
			</View>

			{/* Exit confirmation dialog */}
			<Portal>
				<Dialog
					visible={exitDialogVisible}
					onDismiss={() => setExitDialogVisible(false)}
				>
					<Dialog.Title>Exit Quiz?</Dialog.Title>
					<Dialog.Content>
						<Paragraph>
							Are you sure you want to exit? Your progress will be lost.
						</Paragraph>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setExitDialogVisible(false)}>Cancel</Button>
						<Button onPress={handleConfirmExit}>Exit</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	container: {
		flex: 1,
		padding: 16,
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	progressContainer: {
		marginBottom: 16,
	},
	progressText: {
		textAlign: "right",
		marginBottom: 8,
		fontWeight: "bold",
	},
	progressBar: {
		height: 8,
		borderRadius: 4,
	},
	questionContainer: {
		flex: 1,
		marginBottom: 16,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 16,
	},
	buttonsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 8,
		marginTop: "auto",
	},
	navigationButton: {
		flex: 1,
		borderRadius: 8,
		paddingVertical: 6,
		height: 52, // Taller buttons for better visibility
	},
	buttonContentLeft: {
		flexDirection: "row", // Icon on the left
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonContentRight: {
		flexDirection: "row-reverse", // Icon on the right
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonLabel: {
		fontSize: 16,
		fontWeight: "bold",
		letterSpacing: 0.5,
		marginHorizontal: 8, // Add some spacing between icon and text
	},
	prevButton: {
		marginRight: 8,
		borderWidth: 2,
	},
	nextButton: {
		marginLeft: 8,
	},
});

export default QuizScreen;
