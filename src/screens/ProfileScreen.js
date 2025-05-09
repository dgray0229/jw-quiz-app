// filepath: /Users/devingray/Projects/jw-quiz-app/src/screens/ProfileScreen.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
	Avatar,
	Text,
	Card,
	Title,
	Paragraph,
	List,
	Button,
	Divider,
	useTheme,
	Portal,
	Dialog,
} from "react-native-paper";
import { useQuiz } from "../context/QuizContext";
import { clearAllScores } from "../utils/storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ProfileScreen = () => {
	const theme = useTheme();
	const { categories, quizzes, scores } = useQuiz();
	const [dialogVisible, setDialogVisible] = useState(false);
	const [totalScore, setTotalScore] = useState(0);
	const [quizzesTaken, setQuizzesTaken] = useState(0);

	// Sample user data (would come from authentication in the future)
	const user = {
		name: "Quiz User",
		email: "user@example.com",
		avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
	};

	useEffect(() => {
		// Calculate total score and quizzes taken
		const scoreValues = Object.values(scores);
		setTotalScore(scoreValues.reduce((a, b) => a + b, 0));
		setQuizzesTaken(scoreValues.length);
	}, [scores]);

	// Clear all scores
	const handleClearScores = async () => {
		await clearAllScores();
		setDialogVisible(false);
		// In a real app, we would refresh the context data here
		// This is simplified for the demo
	};

	// Find quiz name by ID
	const findQuizNameById = (quizId) => {
		// For dummy data, just return a placeholder
		return quizId ? `Quiz ${quizId}` : "Unknown Quiz";
	};

	// Get the quiz category by quiz ID
	const getQuizCategoryById = (quizId) => {
		// For dummy data, just return a placeholder
		return "Quiz Category";
	};

	return (
		<ScrollView style={styles.container}>
			{/* User info card */}
			<Card style={styles.userCard}>
				<Card.Content style={styles.userCardContent}>
					<Avatar.Image source={{ uri: user.avatar }} size={80} />
					<View style={styles.userInfo}>
						<Title>{user.name}</Title>
						<Paragraph>{user.email}</Paragraph>
					</View>
				</Card.Content>
			</Card>

			{/* Stats cards */}
			<View style={styles.statsContainer}>
				<Card style={styles.statsCard}>
					<Card.Content style={styles.statsCardContent}>
						<MaterialCommunityIcons
							name="brain"
							size={32}
							color={theme.colors.primary}
						/>
						<Title style={styles.statsNumber}>{totalScore}</Title>
						<Paragraph>Total Points</Paragraph>
					</Card.Content>
				</Card>

				<Card style={styles.statsCard}>
					<Card.Content style={styles.statsCardContent}>
						<MaterialCommunityIcons
							name="clipboard-list"
							size={32}
							color={theme.colors.accent}
						/>
						<Title style={styles.statsNumber}>{quizzesTaken}</Title>
						<Paragraph>Quizzes Taken</Paragraph>
					</Card.Content>
				</Card>
			</View>

			{/* Quiz history */}
			<Card style={styles.historyCard}>
				<Card.Title
					title="Quiz History"
					left={(props) => (
						<MaterialCommunityIcons {...props} name="history" size={24} />
					)}
				/>
				<Divider />
				<Card.Content>
					{Object.entries(scores).length > 0 ? (
						Object.entries(scores).map(([quizId, score], index) => (
							<List.Item
								key={index}
								title={findQuizNameById(quizId)}
								description={`Score: ${score}`}
								left={(props) => <List.Icon {...props} icon="star" />}
							/>
						))
					) : (
						<View style={styles.emptyHistoryContainer}>
							<Text style={styles.emptyHistoryText}>No quiz history yet</Text>
						</View>
					)}
				</Card.Content>
			</Card>

			{/* Coming soon section */}
			<Card style={styles.comingSoonCard}>
				<Card.Title title="Coming Soon" />
				<Divider />
				<Card.Content>
					<List.Item
						title="User Login & Registration"
						description="Create an account and save your progress"
						left={(props) => <List.Icon {...props} icon="account" />}
					/>
					<List.Item
						title="Global Leaderboard"
						description="Compete with other users"
						left={(props) => <List.Icon {...props} icon="podium" />}
					/>
					<List.Item
						title="New Game Modes"
						description="'Heads Up' and 'Jeopardy' style quizzes"
						left={(props) => <List.Icon {...props} icon="controller-classic" />}
					/>
				</Card.Content>
			</Card>

			{/* Actions */}
			<View style={styles.actionsContainer}>
				<Button
					mode="outlined"
					onPress={() => setDialogVisible(true)}
					style={styles.actionButton}
				>
					Reset Quiz History
				</Button>
			</View>

			{/* Confirmation dialog */}
			<Portal>
				<Dialog
					visible={dialogVisible}
					onDismiss={() => setDialogVisible(false)}
				>
					<Dialog.Title>Reset Quiz History?</Dialog.Title>
					<Dialog.Content>
						<Paragraph>
							This will clear all your quiz scores and history. This action
							cannot be undone.
						</Paragraph>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setDialogVisible(false)}>Cancel</Button>
						<Button onPress={handleClearScores}>Reset</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	userCard: {
		margin: 16,
		borderRadius: 12,
		elevation: 4,
	},
	userCardContent: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
	},
	userInfo: {
		marginLeft: 16,
	},
	statsContainer: {
		flexDirection: "row",
		marginHorizontal: 12,
		marginBottom: 16,
	},
	statsCard: {
		flex: 1,
		marginHorizontal: 4,
		borderRadius: 12,
		elevation: 3,
	},
	statsCardContent: {
		alignItems: "center",
		padding: 16,
	},
	statsNumber: {
		fontSize: 24,
		fontWeight: "bold",
		marginVertical: 8,
	},
	historyCard: {
		margin: 16,
		marginTop: 0,
		borderRadius: 12,
		elevation: 4,
	},
	emptyHistoryContainer: {
		padding: 24,
		alignItems: "center",
	},
	emptyHistoryText: {
		opacity: 0.6,
	},
	comingSoonCard: {
		margin: 16,
		marginTop: 0,
		borderRadius: 12,
		elevation: 4,
	},
	actionsContainer: {
		padding: 16,
	},
	actionButton: {
		borderRadius: 8,
	},
});

export default ProfileScreen;
