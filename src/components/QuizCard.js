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

	// Always default questions to an array to prevent .length crash
	const questions = quiz && Array.isArray(quiz.questions) ? quiz.questions : [];

	// Log to help debug
	console.log(
		`QuizCard: quiz ${quiz?.id} has ${questions?.length} questions:`,
		quiz?.questions?.map((q) => ({
			id: q.id,
			text: q.questionText || q.question_text,
		}))
	);

	// Get user's best score for this quiz
	const bestScore = quiz ? getScoreForQuiz(quiz.id) : 0;
	const totalQuestions = questions.length;
	const scorePercentage = totalQuestions > 0 ? bestScore / totalQuestions : 0;

	if (!quiz) {
		return (
			<Card style={styles.card}>
				<Card.Content>
					<Title style={styles.title}>Loading...</Title>
					<Paragraph style={styles.description}>
						Loading quiz details...
					</Paragraph>
					<Text style={styles.questionsCount}>0 Questions</Text>
				</Card.Content>
			</Card>
		);
	}

	// Always enable the quiz card, even if there are no questions yet
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
	disabledCard: {
		opacity: 0.5,
	},
});

export default QuizCard;
