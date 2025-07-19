// src/components/EnhancedQuestionCard.js
// Enhanced question component with randomization and optional explanations

import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import {
	Text,
	Card,
	RadioButton,
	Checkbox,
	Button,
	Divider,
	useTheme,
	IconButton,
	Portal,
	Modal,
	Surface,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
	shuffleAnswers,
	validateAnswer,
	processQuestionData,
	hasAnyExplanations,
	createAnswerSummary,
	getAnswerExplanation,
} from "../utils/questionUtils";

const EnhancedQuestionCard = ({
	question,
	onAnswer,
	selectedAnswer, // External control of selected answer (for QuizScreen compatibility)
	showResults = false,
	allowMultiple = false,
	showExplanations = true,
}) => {
	const theme = useTheme();
	const [processedQuestion, setProcessedQuestion] = useState(null);
	const [shuffledOptions, setShuffledOptions] = useState([]);
	const [selectedAnswers, setSelectedAnswers] = useState([]);
	const [showExplanationModal, setShowExplanationModal] = useState(false);
	const [selectedExplanation, setSelectedExplanation] = useState(null);
	const [hasSubmitted, setHasSubmitted] = useState(false);

	// Process and setup question
	useEffect(() => {
		if (!question) return;

		const processed = processQuestionData(question);
		if (!processed) {
			console.error("Failed to process question:", question);
			return;
		}

		setProcessedQuestion(processed);

		// Shuffle answers if enabled - only shuffle when question changes
		// Use question.id as a key to ensure consistent shuffling for the same question
		const options = processed.shuffleAnswers
			? shuffleAnswers(processed.answerOptions, question.id)
			: processed.answerOptions;

		setShuffledOptions(options);
		setSelectedAnswers([]);
		setHasSubmitted(false);
	}, [question?.id, question?.question_text]); // Only re-shuffle when question actually changes

	// Handle external selectedAnswer prop (for QuizScreen compatibility)
	useEffect(() => {
		if (selectedAnswer !== undefined && processedQuestion && shuffledOptions.length > 0) {
			// QuizScreen passes index based on original order, not shuffled order
			if (
				typeof selectedAnswer === "number" &&
				selectedAnswer >= 0 &&
				selectedAnswer < processedQuestion.answerOptions.length
			) {
				// Find the option in the original order
				const originalOption = processedQuestion.answerOptions[selectedAnswer];
				// Then find it in the shuffled array
				const shuffledOption = shuffledOptions.find(opt => 
					opt.id === originalOption.id || opt.text === originalOption.text
				);
				if (shuffledOption) {
					setSelectedAnswers([shuffledOption]);
				}
			} else if (selectedAnswer === null || selectedAnswer === undefined) {
				// Clear selection
				setSelectedAnswers([]);
			}
		}
	}, [selectedAnswer, shuffledOptions, processedQuestion]);

	// Handle answer selection
	const handleAnswerSelect = (selectedOption) => {
		if (hasSubmitted && !showResults) return;

		let newSelectedAnswers;

		if (allowMultiple || processedQuestion?.multipleCorrect) {
			// Multiple selection mode
			setSelectedAnswers((prev) => {
				const isAlreadySelected = prev.some(
					(opt) => opt.id === selectedOption.id
				);
				if (isAlreadySelected) {
					newSelectedAnswers = prev.filter(
						(opt) => opt.id !== selectedOption.id
					);
				} else {
					newSelectedAnswers = [...prev, selectedOption];
				}

				// For multiple selection, pass the option object
				onAnswer && onAnswer(selectedOption);

				return newSelectedAnswers;
			});
		} else {
			// Single selection mode
			newSelectedAnswers = [selectedOption];
			setSelectedAnswers(newSelectedAnswers);

			// For single selection, pass the index based on original order for QuizScreen compatibility
			const originalIndex = processedQuestion.answerOptions.findIndex(
				(opt) => opt.id === selectedOption.id || opt.text === selectedOption.text
			);
			onAnswer && onAnswer(originalIndex);
		}
	};

	// Submit answer
	const handleSubmit = () => {
		if (selectedAnswers.length === 0) {
			Alert.alert(
				"No Answer Selected",
				"Please select an answer before submitting."
			);
			return;
		}

		const validationResult = validateAnswer(
			selectedAnswers,
			processedQuestion.answerOptions,
			true // Allow partial credit
		);

		const summary = createAnswerSummary(
			validationResult,
			selectedAnswers,
			processedQuestion.answerOptions
		);

		setHasSubmitted(true);
		onAnswer && onAnswer(selectedAnswers, summary);
	};

	// Show explanation modal
	const showExplanation = (option) => {
		const explanation = getAnswerExplanation(option);
		if (explanation) {
			setSelectedExplanation({
				text: option.text,
				explanation,
				isCorrect: option.is_correct,
			});
			setShowExplanationModal(true);
		}
	};

	if (!processedQuestion) {
		return (
			<Card style={styles.card}>
				<Card.Content>
					<Text>Loading question...</Text>
				</Card.Content>
			</Card>
		);
	}

	const questionHasExplanations = hasAnyExplanations(
		processedQuestion.answerOptions
	);

	return (
		<>
			<Card style={styles.card}>
				<Card.Content>
					{/* Question Text */}
					<Text style={styles.questionText}>
						{processedQuestion.question_text || processedQuestion.question}
					</Text>

					{/* Question Metadata */}
					{processedQuestion.multipleCorrect && (
						<View style={styles.metadataContainer}>
							<MaterialCommunityIcons
								name="checkbox-multiple-marked"
								size={16}
								color={theme.colors.primary}
							/>
							<Text style={styles.metadataText}>
								Multiple answers may be correct
							</Text>
						</View>
					)}

					{questionHasExplanations && showExplanations && (
						<View style={styles.metadataContainer}>
							<MaterialCommunityIcons
								name="information"
								size={16}
								color={theme.colors.accent}
							/>
							<Text style={styles.metadataText}>
								Tap answers for explanations
							</Text>
						</View>
					)}

					<Divider style={styles.divider} />

					{/* Answer Options */}
					{shuffledOptions.map((option, index) => {
						const isSelected = selectedAnswers.some(
							(ans) => ans.id === option.id
						);
						const hasExplanation = getAnswerExplanation(option) !== null;

						// Determine styling for results view
						let optionStyle = styles.optionContainer;
						let textStyle = styles.optionText;

						if (showResults || hasSubmitted) {
							if (option.is_correct) {
								optionStyle = [styles.optionContainer, styles.correctOption];
								textStyle = [styles.optionText, styles.correctText];
							} else if (isSelected && !option.is_correct) {
								optionStyle = [styles.optionContainer, styles.incorrectOption];
								textStyle = [styles.optionText, styles.incorrectText];
							}
						}

						return (
							<TouchableOpacity
								key={`${option.id}-${index}`}
								style={optionStyle}
								onPress={() => handleAnswerSelect(option)}
								disabled={hasSubmitted && !showResults}
							>
								<View style={styles.optionContent}>
									{/* Selection Indicator */}
									<View style={styles.selectionIndicator}>
										{processedQuestion.multipleCorrect || allowMultiple ? (
											<Checkbox
												status={isSelected ? "checked" : "unchecked"}
												onPress={() => handleAnswerSelect(option)}
												disabled={hasSubmitted && !showResults}
											/>
										) : (
											<RadioButton
												value={option.id}
												status={isSelected ? "checked" : "unchecked"}
												onPress={() => handleAnswerSelect(option)}
												disabled={hasSubmitted && !showResults}
											/>
										)}
									</View>

									{/* Answer Text */}
									<Text style={[textStyle, styles.answerText]}>
										{option.text}
									</Text>

									{/* Explanation Icon */}
									{hasExplanation && showExplanations && (
										<IconButton
											icon="information-outline"
											size={20}
											style={styles.explanationIcon}
											onPress={() => showExplanation(option)}
										/>
									)}

									{/* Result Indicators */}
									{(showResults || hasSubmitted) && (
										<View style={styles.resultIndicator}>
											{option.is_correct ? (
												<MaterialCommunityIcons
													name="check-circle"
													size={24}
													color={theme.colors.primary}
												/>
											) : isSelected ? (
												<MaterialCommunityIcons
													name="close-circle"
													size={24}
													color={theme.colors.error}
												/>
											) : null}
										</View>
									)}
								</View>
							</TouchableOpacity>
						);
					})}
				</Card.Content>

				{/* Submit Button */}
				{!hasSubmitted && !showResults && (
					<Card.Actions style={styles.actions}>
						<Button
							mode="contained"
							onPress={handleSubmit}
							disabled={selectedAnswers.length === 0}
						>
							Submit Answer
						</Button>
					</Card.Actions>
				)}
			</Card>

			{/* Explanation Modal */}
			<Portal>
				<Modal
					visible={showExplanationModal}
					onDismiss={() => setShowExplanationModal(false)}
					contentContainerStyle={styles.modalContainer}
				>
					<Surface style={styles.modalContent}>
						<Text style={styles.modalTitle}>Answer Explanation</Text>

						<View style={styles.modalAnswerContainer}>
							<Text style={styles.modalAnswer}>
								"{selectedExplanation?.text}"
							</Text>
							{selectedExplanation?.isCorrect ? (
								<MaterialCommunityIcons
									name="check-circle"
									size={24}
									color={theme.colors.primary}
								/>
							) : (
								<MaterialCommunityIcons
									name="close-circle"
									size={24}
									color={theme.colors.error}
								/>
							)}
						</View>

						<Text style={styles.modalExplanation}>
							{selectedExplanation?.explanation}
						</Text>

						<Button
							mode="contained"
							onPress={() => setShowExplanationModal(false)}
							style={styles.modalButton}
						>
							Close
						</Button>
					</Surface>
				</Modal>
			</Portal>
		</>
	);
};

const styles = StyleSheet.create({
	card: {
		margin: 16,
		elevation: 4,
		borderRadius: 12,
	},
	questionText: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 16,
		lineHeight: 24,
	},
	metadataContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	metadataText: {
		fontSize: 14,
		marginLeft: 8,
		opacity: 0.7,
	},
	divider: {
		marginVertical: 16,
	},
	optionContainer: {
		borderRadius: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	correctOption: {
		backgroundColor: "#e8f5e8",
		borderColor: "#4caf50",
	},
	incorrectOption: {
		backgroundColor: "#ffebee",
		borderColor: "#f44336",
	},
	optionContent: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
	},
	selectionIndicator: {
		marginRight: 12,
	},
	answerText: {
		flex: 1,
		fontSize: 16,
	},
	optionText: {
		color: "#333",
	},
	correctText: {
		color: "#2e7d32",
		fontWeight: "500",
	},
	incorrectText: {
		color: "#d32f2f",
		fontWeight: "500",
	},
	explanationIcon: {
		margin: 0,
	},
	resultIndicator: {
		marginLeft: 8,
	},
	actions: {
		justifyContent: "flex-end",
		padding: 16,
	},
	modalContainer: {
		padding: 20,
	},
	modalContent: {
		padding: 24,
		borderRadius: 12,
		elevation: 8,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
	},
	modalAnswerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
		padding: 12,
		backgroundColor: "#f5f5f5",
		borderRadius: 8,
	},
	modalAnswer: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
	},
	modalExplanation: {
		fontSize: 16,
		lineHeight: 22,
		marginBottom: 24,
	},
	modalButton: {
		alignSelf: "flex-end",
	},
});

export default EnhancedQuestionCard;
