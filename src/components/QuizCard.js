// src/components/QuizCard.js
import React from "react";
import { StyleSheet } from "react-native";
import {
	Card,
	Title,
	Paragraph,
	ProgressBar,
	Text,
	useTheme,
} from "react-native-paper";
import { useQuiz } from "../context/QuizContext";

const QuizCard = ({ quiz, categoryId, onPress }) => {
	const theme = useTheme();
	const { getScoreForQuiz } = useQuiz();

	// Get user's best score for this quiz
	const bestScore = getScoreForQuiz(quiz.id);
	const totalQuestions = quiz.questions.length;
	const scorePercentage = totalQuestions > 0 ? bestScore / totalQuestions : 0;

	return (
		<Card style={styles.card} onPress={onPress}>
			<Card.Content>
				<Title style={styles.title}>{quiz.title}</Title>
				<Paragraph numberOfLines={2} style={styles.description}>
					{quiz.description}
				</Paragraph>
				<Text style={styles.questionsCount}>
					{totalQuestions} {totalQuestions === 1 ? "Question" : "Questions"}
				</Text>

				{bestScore > 0 && (
					<React.Fragment>
						<Text style={styles.scoreText}>
							Best Score: {bestScore}/{totalQuestions}
						</Text>
						<ProgressBar
							progress={scorePercentage}
							color={theme.colors.accent}
							style={styles.progressBar}
						/>
					</React.Fragment>
				)}
			</Card.Content>
		</Card>
	);
};

const styles = StyleSheet.create({
	card: {
		marginVertical: 8,
		marginHorizontal: 16,
		elevation: 3,
		borderRadius: 12,
	},
	title: {
		fontWeight: "bold",
	},
	description: {
		marginTop: 4,
		marginBottom: 8,
	},
	questionsCount: {
		opacity: 0.7,
		marginBottom: 8,
	},
	scoreText: {
		marginTop: 8,
		fontWeight: "500",
	},
	progressBar: {
		marginTop: 8,
		height: 8,
		borderRadius: 4,
	},
});

export default QuizCard;
