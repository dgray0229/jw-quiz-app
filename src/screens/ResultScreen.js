// src/screens/ResultScreen.js
import React, { useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
	Text,
	Card,
	Button,
	Divider,
	Title,
	Paragraph,
	useTheme,
} from "react-native-paper";
import { useQuiz } from "../context/QuizContext";
import QuestionCard from "../components/QuestionCard";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ResultScreen = ({ route, navigation }) => {
	const { score, totalQuestions, quizId, quizTitle, categoryId, answers } =
		route.params;

	const theme = useTheme();
	const { getQuizById, updateScore } = useQuiz();
	const quiz = getQuizById(categoryId, quizId);

	// Calculate percentage
	const percentage = Math.round((score / totalQuestions) * 100);

	// Update user's best score
	useEffect(() => {
		const saveScore = async () => {
			await updateScore(quizId, score);
		};
		saveScore();
	}, []);

	// Get feedback based on score percentage
	const getFeedback = () => {
		if (percentage >= 90) return "Outstanding! You're a quiz master!";
		if (percentage >= 70) return "Great job! You know your stuff!";
		if (percentage >= 50) return "Good effort! Keep learning!";
		return "Keep practicing! You'll improve next time!";
	};

	// Get appropriate icon based on score
	const getResultIcon = () => {
		if (percentage >= 90) return "trophy";
		if (percentage >= 70) return "check-circle";
		if (percentage >= 50) return "thumb-up";
		return "book-open-page-variant";
	};

	// Get appropriate color based on score
	const getResultColor = () => {
		if (percentage >= 90) return "#FFD700"; // Gold
		if (percentage >= 70) return "#4CAF50"; // Green
		if (percentage >= 50) return "#2196F3"; // Blue
		return "#FF9800"; // Orange
	};

	return (
		<View style={styles.container}>
			<ScrollView>
				{/* Results summary */}
				<Card style={styles.summaryCard}>
					<Card.Content style={styles.summaryContent}>
						<MaterialCommunityIcons
							name={getResultIcon()}
							size={64}
							color={getResultColor()}
							style={styles.resultIcon}
						/>

						<Title style={styles.quizTitle}>{quizTitle}</Title>

						<View style={styles.scoreContainer}>
							<Text style={styles.scoreText}>
								<Text style={styles.scoreValue}>{score}</Text>/{totalQuestions}
							</Text>
							<Text style={styles.percentageText}>{percentage}%</Text>
						</View>

						<Paragraph style={styles.feedbackText}>{getFeedback()}</Paragraph>
					</Card.Content>
				</Card>

				<Divider style={styles.divider} />

				<Title style={styles.reviewTitle}>Review Your Answers</Title>

				{/* Display each question with correct/wrong answers */}
				{quiz.questions.map((question, index) => (
					<View key={index} style={styles.questionReview}>
						<QuestionCard
							question={question}
							selectedAnswer={answers[index]}
							showCorrectAnswer={true}
							onAnswerSelected={() => {}}
						/>

						<View style={styles.answerResultContainer}>
							{answers[index] === question.correctAnswer ? (
								<View style={styles.answerResult}>
									<MaterialCommunityIcons
										name="check-circle"
										size={20}
										color="#4CAF50"
									/>
									<Text style={[styles.answerResultText, { color: "#4CAF50" }]}>
										Correct answer!
									</Text>
								</View>
							) : (
								<View style={styles.answerResult}>
									<MaterialCommunityIcons
										name="close-circle"
										size={20}
										color="#F44336"
									/>
									<Text style={[styles.answerResultText, { color: "#F44336" }]}>
										Incorrect answer
									</Text>
								</View>
							)}
						</View>
					</View>
				))}

				{/* Navigation buttons */}
				<View style={styles.buttonsContainer}>
					<Button
						mode="outlined"
						onPress={() =>
							navigation.navigate("QuizList", {
								categoryId,
								categoryName: "Quiz Category", // This would come from context or params
							})
						}
						style={styles.button}
					>
						More Quizzes
					</Button>

					<Button
						mode="contained"
						onPress={() => navigation.navigate("Home")}
						style={styles.button}
					>
						Home
					</Button>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		padding: 16,
	},
	summaryCard: {
		borderRadius: 12,
		elevation: 4,
	},
	summaryContent: {
		alignItems: "center",
		padding: 16,
	},
	resultIcon: {
		marginBottom: 16,
	},
	quizTitle: {
		fontSize: 22,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 12,
	},
	scoreContainer: {
		alignItems: "center",
		marginVertical: 16,
	},
	scoreText: {
		fontSize: 20,
		fontWeight: "500",
	},
	scoreValue: {
		fontSize: 28,
		fontWeight: "bold",
	},
	percentageText: {
		fontSize: 24,
		fontWeight: "bold",
		marginTop: 8,
	},
	feedbackText: {
		fontSize: 16,
		textAlign: "center",
	},
	divider: {
		marginVertical: 24,
		height: 1,
	},
	reviewTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
	},
	questionReview: {
		marginBottom: 24,
	},
	answerResultContainer: {
		marginTop: -8,
		paddingHorizontal: 16,
	},
	answerResult: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
	},
	answerResultText: {
		marginLeft: 8,
		fontSize: 16,
		fontWeight: "500",
	},
	buttonsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginVertical: 24,
	},
	button: {
		flex: 1,
		marginHorizontal: 8,
		borderRadius: 8,
	},
});

export default ResultScreen;
