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

	// Debug question structure
	console.log("QuestionCard received question:", question);
	console.log(
		"QuestionCard answerOptions:",
		question?.answerOptions || question?.answer_options
	);
	console.log(
		"QuestionCard correctAnswer:",
		question?.correctAnswer || question?.correct_answer
	);

	// Determine button color based on selected answer and whether to show correct answer
	const getButtonColor = (index) => {
		// Get the correct answer, handling different formats
		const correctAnswer =
			typeof question?.correctAnswer === "number"
				? question.correctAnswer
				: typeof question?.correct_answer === "number"
				? question.correct_answer
				: parseInt(question?.correct_answer || "0", 10);

		if (!showCorrectAnswer) {
			// During quiz - only highlight selected answer
			return selectedAnswer === index
				? theme.colors.primary
				: theme.colors.surface;
		} else {
			// When showing results
			if (index === correctAnswer) {
				// Correct answer
				return "#4CAF50"; // Green
			} else if (selectedAnswer === index && selectedAnswer !== correctAnswer) {
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
		// Get the correct answer, handling different formats
		const correctAnswer =
			typeof question?.correctAnswer === "number"
				? question.correctAnswer
				: typeof question?.correct_answer === "number"
				? question.correct_answer
				: parseInt(question?.correct_answer || "0", 10);

		const isCorrect = showCorrectAnswer && index === correctAnswer;

		if (isSelected || isCorrect) {
			return "#fff";
		}

		return theme.colors.text;
	};

	return (
		<Card style={styles.card}>
			<Card.Content>
				<Title style={styles.question}>
					{question?.questionText || question?.question_text || ""}
				</Title>

				<View style={styles.optionsContainer}>
					{(question && Array.isArray(question.answerOptions)
						? question.answerOptions
						: question && Array.isArray(question.answer_options)
						? question.answer_options
						: question && typeof question.answer_options === "string"
						? JSON.parse(question.answer_options || '[""]')
						: []
					).map((option, index) => (
						<Button
							key={index}
							mode="contained"
							onPress={() => {
								console.log(`Answer selected: ${index}`);
								onAnswerSelected(index);
							}}
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
		marginHorizontal: 0,
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
		paddingBottom: 8,
	},
	optionButton: {
		marginBottom: 12,
		paddingVertical: 8,
		borderRadius: 8,
		elevation: 2,
	},
});

export default QuestionCard;
