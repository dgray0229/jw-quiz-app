import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Button, Text, useTheme } from "react-native-paper";

const QuestionCard = ({
	question,
	onAnswerSelected,
	selectedAnswer,
	showCorrectAnswer,
}) => {
	const theme = useTheme();

	// Determine button color based on selected answer and whether to show correct answer
	const getButtonColor = (index) => {
		if (!showCorrectAnswer) {
			// During quiz - only highlight selected answer
			return selectedAnswer === index
				? theme.colors.primary
				: theme.colors.surface;
		} else {
			// When showing results
			if (index === question.correctAnswer) {
				// Correct answer
				return "#4CAF50"; // Green
			} else if (
				selectedAnswer === index &&
				selectedAnswer !== question.correctAnswer
			) {
				// Wrong answer selected by user
				return "#F44336"; // Red
			} else {
				// Other options
				return theme.colors.surface;
			}
		}
	};

	const getButtonTextColor = (index) => {
		const isSelected = selectedAnswer === index;
		const isCorrect = showCorrectAnswer && index === question.correctAnswer;

		if (isSelected || isCorrect) {
			return "#fff";
		}

		return theme.colors.text;
	};

	return (
		<Card style={styles.card}>
			<Card.Content>
				<Title style={styles.question}>{question?.questionText || ""}</Title>

				<View style={styles.optionsContainer}>
					{(question && Array.isArray(question.answerOptions)
						? question.answerOptions
						: []
					).map((option, index) => (
						<Button
							key={index}
							mode="contained"
							onPress={() => onAnswerSelected(index)}
							disabled={showCorrectAnswer}
							style={[
								styles.optionButton,
								{ backgroundColor: getButtonColor(index) },
							]}
							labelStyle={{
								color: getButtonTextColor(index),
								fontWeight: "bold",
							}}
						>
							{option}
						</Button>
					))}
				</View>
			</Card.Content>
		</Card>
	);
};

const styles = StyleSheet.create({
	card: {
		marginVertical: 8,
		marginHorizontal: 16,
		elevation: 4,
		borderRadius: 12,
	},
	question: {
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 16,
	},
	optionsContainer: {
		marginTop: 8,
	},
	optionButton: {
		marginBottom: 12,
		paddingVertical: 8,
		borderRadius: 8,
		elevation: 2,
	},
});

export default QuestionCard;
