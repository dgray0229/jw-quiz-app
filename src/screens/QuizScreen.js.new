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
import { MaterialIcons } from '@expo/vector-icons';
import { useQuiz } from "../context/QuizContext";
import QuestionCard from "../components/QuestionCard";

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
	const handleAnswerSelection = (answerIndex) => {
		console.log(`QuizScreen: Answer selected for question ${currentQuestionIndex}: ${answerIndex}`);
		
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
			// Get correct answer considering different formats
			const correctAnswer =
				typeof question.correctAnswer === "number"
					? question.correctAnswer
					: typeof question.correct_answer === "number"
					? question.correct_answer
					: parseInt(question.correct_answer || "0", 10);

			if (selectedAnswers[index] === correctAnswer) {
				correctAnswers++;
			}
		});

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

	// Current question - ensure it has the proper format for our components
	let currentQuestion = quiz.questions[currentQuestionIndex];
	
	// Make sure the current question has the right format
	if (currentQuestion) {
		// Normalize the question data to have consistent properties
		currentQuestion = {
			...currentQuestion,
			// Ensure questionText exists
			questionText:
				currentQuestion.questionText || currentQuestion.question_text || "",

			// Ensure answerOptions is an array
			answerOptions: Array.isArray(currentQuestion.answerOptions)
				? currentQuestion.answerOptions
				: Array.isArray(currentQuestion.answer_options)
				? currentQuestion.answer_options
				: typeof currentQuestion.answer_options === "string"
				? JSON.parse(currentQuestion.answer_options || '[""]')
				: [],

			// Ensure correctAnswer is a number
			correctAnswer:
				typeof currentQuestion.correctAnswer === "number"
					? currentQuestion.correctAnswer
					: typeof currentQuestion.correct_answer === "number"
					? currentQuestion.correct_answer
					: parseInt(currentQuestion.correct_answer || "0", 10),
		};

		console.log("Normalized current question:", currentQuestion);
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
						<QuestionCard
							question={currentQuestion}
							onAnswerSelected={handleAnswerSelection}
							selectedAnswer={selectedAnswers[currentQuestionIndex]}
							showCorrectAnswer={false}
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
		flexDirection: 'row', // Icon on the left
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonContentRight: {
		flexDirection: 'row-reverse', // Icon on the right
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonLabel: {
		fontSize: 16,
		fontWeight: 'bold',
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
