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
import EnhancedQuestionCard from "../components/EnhancedQuestionCard";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";

const ResultScreen = ({ route, navigation }) => {
	const { score, totalQuestions, quizId, quizTitle, categoryId, answers } =
		route.params;

	const theme = useTheme();
	const { getQuizById, updateScore } = useQuiz();
	const quiz = getQuizById(categoryId, quizId);

	// Make sure we have a quiz before proceeding
	useEffect(() => {
		if (!quiz) {
			console.error(`Quiz with id ${quizId} not found`);
			// Provide a default structure to avoid errors
			// and allow going back to previous screens
			navigation.setParams({
				shouldShowErrorMessage: true,
			});
		}
	}, [quiz, quizId, navigation]);

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
		<SafeAreaView style={styles.safeArea}>
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
									<Text style={styles.scoreValue}>{score}</Text>/
									{totalQuestions}
								</Text>
								<Text style={styles.percentageText}>{percentage}%</Text>
							</View>

							<Paragraph style={styles.feedbackText}>{getFeedback()}</Paragraph>
						</Card.Content>
					</Card>

					<Divider style={styles.divider} />

					{route.params.shouldShowErrorMessage ? (
						<Card style={[styles.summaryCard, { marginTop: 20 }]}>
							<Card.Content>
								<Title style={{ color: "#F44336" }}>
									Oops, something went wrong
								</Title>
								<Paragraph>
									We couldn't load the quiz details. Your score has been saved.
								</Paragraph>
							</Card.Content>
						</Card>
					) : (
						<View>
							<Title style={styles.reviewTitle}>Review Your Answers</Title>

							{/* Display each question with correct/wrong answers */}
							{quiz &&
								quiz.questions &&
								quiz.questions.map((question, index) => (
									<View key={index} style={styles.questionReview}>
										<EnhancedQuestionCard
											question={question}
											selectedAnswer={answers[index]}
											showResults={true}
											onAnswer={() => {}}
										/>

										<View style={styles.answerResultContainer}>
											{(() => {
												// Since all questions are processed through processQuestionData,
												// they all have normalized answerOptions with is_correct flags
												const answerOptions = question.answerOptions;
												
												if (!answerOptions || !Array.isArray(answerOptions)) {
													console.error('Invalid answerOptions in ResultScreen:', answerOptions);
													return null;
												}
												
												const selectedOption = answerOptions[answers[index]];
												const isCorrect = selectedOption && selectedOption.is_correct;
												
												return isCorrect ? (
													<View style={styles.answerResult}>
														<MaterialCommunityIcons
															name="check-circle"
															size={20}
															color="#4CAF50"
														/>
														<Text
															style={[
																styles.answerResultText,
																{ color: "#4CAF50" },
															]}
														>
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
														<Text
															style={[
																styles.answerResultText,
																{ color: "#F44336" },
															]}
														>
															Incorrect answer
														</Text>
													</View>
												);
											})()}
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
						</View>
					)}
				</ScrollView>
			</View>
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
