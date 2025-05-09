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
		setSelectedAnswers((prev) => ({
			...prev,
			[currentQuestionIndex]: answerIndex,
		}));
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
			if (selectedAnswers[index] === question.correctAnswer) {
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

	// Current question
	const currentQuestion = quiz.questions[currentQuestionIndex];
	const progress = (currentQuestionIndex + 1) / quiz.questions.length;
	const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
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

				{/* Question */}
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
				>
					<QuestionCard
						question={currentQuestion}
						onAnswerSelected={handleAnswerSelection}
						selectedAnswer={selectedAnswers[currentQuestionIndex]}
						showCorrectAnswer={false}
					/>
				</ScrollView>

				{/* Navigation buttons */}
				<View style={styles.buttonsContainer}>
					<Button
						mode="outlined"
						onPress={handlePrevQuestion}
						disabled={currentQuestionIndex === 0}
						style={[styles.navigationButton, styles.prevButton]}
					>
						Previous
					</Button>

					{isLastQuestion ? (
						<Button
							mode="contained"
							onPress={handleSubmitQuiz}
							disabled={!allQuestionsAnswered}
							style={[styles.navigationButton, styles.nextButton]}
						>
							Submit
						</Button>
					) : (
						<Button
							mode="contained"
							onPress={handleNextQuestion}
							disabled={!isAnswered}
							style={[styles.navigationButton, styles.nextButton]}
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
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 24,
	},
	buttonsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 16,
	},
	navigationButton: {
		flex: 1,
		borderRadius: 8,
	},
	prevButton: {
		marginRight: 8,
	},
	nextButton: {
		marginLeft: 8,
	},
});

export default QuizScreen;
