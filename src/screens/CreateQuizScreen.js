// src/screens/CreateQuizScreen.js
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
	TextInput,
	Button,
	Card,
	Title,
	FAB,
	List,
	IconButton,
	Dialog,
	Portal,
	Paragraph,
	RadioButton,
	Text,
	useTheme,
} from "react-native-paper";
import { useQuiz } from "../context/QuizContext";

const CreateQuizScreen = ({ navigation }) => {
	const theme = useTheme();
	const { categories } = useQuiz();

	// Quiz state
	const [quizTitle, setQuizTitle] = useState("");
	const [quizDescription, setQuizDescription] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");

	// Questions state
	const [questions, setQuestions] = useState([]);
	const [currentQuestion, setCurrentQuestion] = useState({
		questionText: "",
		answerOptions: ["", "", "", ""],
		correctAnswer: 0,
	});

	// Dialog state
	const [categoryDialogVisible, setCategoryDialogVisible] = useState(false);
	const [questionDialogVisible, setQuestionDialogVisible] = useState(false);
	const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);

	// Add or update question
	const handleSaveQuestion = () => {
		// Validate question
		if (!currentQuestion.questionText.trim()) {
			Alert.alert("Error", "Please enter a question");
			return;
		}

		// Check if all answer options are filled
		const emptyOptions = currentQuestion.answerOptions.filter(
			(opt) => !opt.trim()
		).length;
		if (emptyOptions > 0) {
			Alert.alert("Error", "Please fill in all answer options");
			return;
		}

		if (editingQuestionIndex >= 0) {
			// Update existing question
			const updatedQuestions = [...questions];
			updatedQuestions[editingQuestionIndex] = { ...currentQuestion };
			setQuestions(updatedQuestions);
		} else {
			// Add new question
			setQuestions([...questions, { ...currentQuestion }]);
		}

		// Reset and close dialog
		setCurrentQuestion({
			questionText: "",
			answerOptions: ["", "", "", ""],
			correctAnswer: 0,
		});
		setQuestionDialogVisible(false);
		setEditingQuestionIndex(-1);
	};

	// Edit existing question
	const handleEditQuestion = (index) => {
		setCurrentQuestion({ ...questions[index] });
		setEditingQuestionIndex(index);
		setQuestionDialogVisible(true);
	};

	// Delete question
	const handleDeleteQuestion = (index) => {
		Alert.alert(
			"Delete Question",
			"Are you sure you want to delete this question?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					onPress: () => {
						const updatedQuestions = [...questions];
						updatedQuestions.splice(index, 1);
						setQuestions(updatedQuestions);
					},
					style: "destructive",
				},
			]
		);
	};

	// Save the entire quiz
	const handleSaveQuiz = () => {
		// Validate quiz
		if (!quizTitle.trim()) {
			Alert.alert("Error", "Please enter a quiz title");
			return;
		}

		if (!selectedCategory) {
			Alert.alert("Error", "Please select a category");
			return;
		}

		if (questions.length < 1) {
			Alert.alert("Error", "Please add at least one question");
			return;
		}

		// In a real app, we would save to a database here
		// For the demo version, we'll just show a success message
		Alert.alert(
			"Success",
			"Your quiz has been created! (In a real app, this would be saved to a database)",
			[
				{
					text: "OK",
					onPress: () => {
						// Reset form and navigate back
						navigation.goBack();
					},
				},
			]
		);
	};

	// Update answer option text
	const updateAnswerOption = (index, text) => {
		const updatedOptions = [...currentQuestion.answerOptions];
		updatedOptions[index] = text;
		setCurrentQuestion({ ...currentQuestion, answerOptions: updatedOptions });
	};

	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<Card style={styles.card}>
					<Card.Content>
						<Title style={styles.cardTitle}>Create a New Quiz</Title>

						{/* Quiz Title */}
						<TextInput
							label="Quiz Title"
							value={quizTitle}
							onChangeText={setQuizTitle}
							style={styles.input}
							mode="outlined"
						/>

						{/* Quiz Description */}
						<TextInput
							label="Quiz Description"
							value={quizDescription}
							onChangeText={setQuizDescription}
							style={styles.input}
							mode="outlined"
							multiline
							numberOfLines={2}
						/>

						{/* Category Selection */}
						<Button
							mode="outlined"
							onPress={() => setCategoryDialogVisible(true)}
							style={styles.categoryButton}
						>
							{selectedCategory
								? `Category: ${
										categories.find((c) => c.id === selectedCategory)?.name
								  }`
								: "Select a Category"}
						</Button>

						{/* Questions Section */}
						<View style={styles.questionsSection}>
							<Title style={styles.questionsTitle}>
								Questions ({questions.length})
							</Title>

							{questions.length === 0 ? (
								<Paragraph style={styles.noQuestionsText}>
									No questions added yet. Use the + button to add questions.
								</Paragraph>
							) : (
								questions.map((question, index) => (
									<Card key={index} style={styles.questionCard}>
										<Card.Content>
											<Paragraph style={styles.questionNumber}>
												Question {index + 1}
											</Paragraph>
											<Text style={styles.questionText}>
												{question.questionText}
											</Text>

											{/* Display answer options */}
											<View style={styles.optionsList}>
												{question.answerOptions.map((option, optIndex) => (
													<View
														key={optIndex}
														style={[
															styles.optionItem,
															optIndex === question.correctAnswer &&
																styles.correctOption,
														]}
													>
														<Text style={styles.optionText}>{option}</Text>
														{optIndex === question.correctAnswer && (
															<Text style={styles.correctLabel}>(Correct)</Text>
														)}
													</View>
												))}
											</View>
										</Card.Content>

										<Card.Actions>
											<Button
												onPress={() => handleEditQuestion(index)}
												icon="pencil"
											>
												Edit
											</Button>
											<Button
												onPress={() => handleDeleteQuestion(index)}
												icon="delete"
												color="#F44336"
											>
												Delete
											</Button>
										</Card.Actions>
									</Card>
								))
							)}
						</View>
					</Card.Content>
				</Card>

				{/* Save Quiz Button */}
				<Button
					mode="contained"
					onPress={handleSaveQuiz}
					style={styles.saveButton}
					disabled={
						questions.length === 0 || !quizTitle.trim() || !selectedCategory
					}
				>
					Save Quiz
				</Button>
			</ScrollView>

			{/* Add Question FAB */}
			<FAB
				style={[styles.fab, { backgroundColor: theme.colors.primary }]}
				icon="plus"
				onPress={() => {
					setEditingQuestionIndex(-1);
					setCurrentQuestion({
						questionText: "",
						answerOptions: ["", "", "", ""],
						correctAnswer: 0,
					});
					setQuestionDialogVisible(true);
				}}
			/>

			{/* Category Selection Dialog */}
			<Portal>
				<Dialog
					visible={categoryDialogVisible}
					onDismiss={() => setCategoryDialogVisible(false)}
					style={styles.dialog}
				>
					<Dialog.Title>Select a Category</Dialog.Title>
					<Dialog.Content>
						<ScrollView style={styles.categoryList}>
							{categories.map((category) => (
								<List.Item
									key={category.id}
									title={category.name}
									description={category.description}
									left={(props) => (
										<List.Icon
											{...props}
											icon={
												selectedCategory === category.id
													? "check-circle"
													: category.icon
											}
											color={
												selectedCategory === category.id
													? theme.colors.primary
													: undefined
											}
										/>
									)}
									onPress={() => {
										setSelectedCategory(category.id);
										setCategoryDialogVisible(false);
									}}
									style={
										selectedCategory === category.id
											? styles.selectedCategory
											: null
									}
								/>
							))}
						</ScrollView>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setCategoryDialogVisible(false)}>
							Cancel
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>

			{/* Add/Edit Question Dialog */}
			<Portal>
				<Dialog
					visible={questionDialogVisible}
					onDismiss={() => setQuestionDialogVisible(false)}
					style={styles.dialog}
				>
					<Dialog.Title>
						{editingQuestionIndex >= 0 ? "Edit Question" : "Add Question"}
					</Dialog.Title>
					<Dialog.Content>
						<TextInput
							label="Question"
							value={currentQuestion.questionText}
							onChangeText={(text) =>
								setCurrentQuestion({ ...currentQuestion, questionText: text })
							}
							style={styles.questionInput}
							mode="outlined"
							multiline
						/>

						<Title style={styles.optionsTitle}>Answer Options</Title>
						{currentQuestion.answerOptions.map((option, index) => (
							<View key={index} style={styles.optionRow}>
								<RadioButton
									value={index.toString()}
									status={
										currentQuestion.correctAnswer === index
											? "checked"
											: "unchecked"
									}
									onPress={() =>
										setCurrentQuestion({
											...currentQuestion,
											correctAnswer: index,
										})
									}
									color={theme.colors.primary}
								/>
								<TextInput
									label={`Option ${index + 1}`}
									value={option}
									onChangeText={(text) => updateAnswerOption(index, text)}
									style={styles.optionInput}
									mode="outlined"
								/>
							</View>
						))}
						<Text style={styles.correctAnswerHint}>
							Select the radio button for the correct answer
						</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setQuestionDialogVisible(false)}>
							Cancel
						</Button>
						<Button onPress={handleSaveQuestion} mode="contained">
							Save
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	scrollView: {
		flex: 1,
	},
	card: {
		margin: 16,
		borderRadius: 12,
		elevation: 4,
	},
	cardTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 16,
	},
	input: {
		marginBottom: 16,
		backgroundColor: "#fff",
	},
	categoryButton: {
		marginVertical: 8,
	},
	questionsSection: {
		marginTop: 16,
	},
	questionsTitle: {
		fontSize: 20,
		marginBottom: 8,
	},
	noQuestionsText: {
		fontStyle: "italic",
		opacity: 0.6,
		textAlign: "center",
		marginVertical: 16,
	},
	questionCard: {
		marginVertical: 8,
		borderRadius: 8,
	},
	questionNumber: {
		fontWeight: "500",
		marginBottom: 4,
	},
	questionText: {
		fontSize: 16,
		marginBottom: 8,
	},
	optionsList: {
		marginTop: 8,
	},
	optionItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 4,
		paddingHorizontal: 8,
		marginVertical: 2,
		borderRadius: 4,
	},
	correctOption: {
		backgroundColor: "rgba(76, 175, 80, 0.1)",
	},
	optionText: {
		flex: 1,
	},
	correctLabel: {
		color: "#4CAF50",
		fontWeight: "500",
		fontSize: 12,
		marginLeft: 8,
	},
	fab: {
		position: "absolute",
		margin: 16,
		right: 0,
		bottom: 0,
	},
	saveButton: {
		margin: 16,
		marginTop: 0,
		paddingVertical: 8,
	},
	dialog: {
		maxHeight: "80%",
	},
	categoryList: {
		maxHeight: 300,
	},
	selectedCategory: {
		backgroundColor: "rgba(98, 0, 238, 0.1)",
	},
	questionInput: {
		marginBottom: 16,
		backgroundColor: "#fff",
	},
	optionsTitle: {
		fontSize: 16,
		marginBottom: 8,
	},
	optionRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 4,
	},
	optionInput: {
		flex: 1,
		marginLeft: 8,
		backgroundColor: "#fff",
	},
	correctAnswerHint: {
		fontSize: 12,
		fontStyle: "italic",
		marginTop: 8,
		opacity: 0.7,
	},
});

export default CreateQuizScreen;
