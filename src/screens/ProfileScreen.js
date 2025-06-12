import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { migrateToEnhancedQuestionFormat } from "../utils/questionMigration";

const ProfileScreen = () => {
	const theme = useTheme();
	const { categories, quizzes, scores, refreshData } = useQuiz();
	const [dialogVisible, setDialogVisible] = useState(false);
	const [migrationDialogVisible, setMigrationDialogVisible] = useState(false);
	const [totalScore, setTotalScore] = useState(0);
	const [quizzesTaken, setQuizzesTaken] = useState(0);
	const [migrating, setMigrating] = useState(false);

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

	// Clear all scores from Supabase for this device
	const handleClearScores = async () => {
		try {
			// Get deviceId from context (QuizContext)
			const deviceId = localStorage.getItem("quiz_device_id");
			if (deviceId) {
				const { error } = await import("../utils/supabaseClient").then(
					({ supabase }) =>
						supabase.from("device_scores").delete().eq("device_id", deviceId)
				);
				if (error) {
					console.error("Error clearing scores from Supabase:", error);
				}
			}
		} catch (e) {
			console.error("Error clearing scores:", e);
		}
		setDialogVisible(false);
		// Optionally, trigger a refresh in context (if needed)
		// This will be picked up by context on next load
		// window.location.reload(); // or trigger a context refresh if available
	};

	// Handle question migration to enhanced format
	const handleQuestionMigration = async () => {
		setMigrating(true);
		try {
			console.log("🔄 Starting question migration...");
			const result = await migrateToEnhancedQuestionFormat();

			if (result.success) {
				Alert.alert(
					"Migration Successful! 🎉",
					`Enhanced question format migration completed:\n\n` +
						`• Migrated: ${result.migratedCount} questions\n` +
						`• Skipped: ${result.skippedCount} questions\n` +
						`• Total: ${result.totalCount} questions\n\n` +
						`Questions can now be randomized with optional explanations!`,
					[{ text: "Great!", onPress: () => setMigrationDialogVisible(false) }]
				);

				// Refresh data to get updated questions
				if (refreshData) {
					await refreshData();
				}
			} else {
				Alert.alert(
					"Migration Failed ❌",
					`Migration encountered an error:\n\n${result.error}\n\nPlease check console for details.`,
					[{ text: "OK", onPress: () => setMigrationDialogVisible(false) }]
				);
			}
		} catch (error) {
			console.error("Migration error:", error);
			Alert.alert(
				"Migration Error ❌",
				`An unexpected error occurred:\n\n${error.message}`,
				[{ text: "OK", onPress: () => setMigrationDialogVisible(false) }]
			);
		} finally {
			setMigrating(false);
		}
	};

	// Find quiz name by ID using quizzes from context
	const findQuizNameById = (quizId) => {
		const quiz = quizzes.find((q) => q.id === quizId);
		return quiz ? quiz.title : "Unknown Quiz";
	};

	// Get the quiz category by quiz ID using categories from context
	const getQuizCategoryById = (quizId) => {
		const quiz = quizzes.find((q) => q.id === quizId);
		if (!quiz) return "Unknown Category";
		const category = categories.find((c) => c.id === quiz.category_id);
		return category ? category.name : "Unknown Category";
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
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
							left={(props) => (
								<List.Icon {...props} icon="controller-classic" />
							)}
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

					<Button
						mode="contained"
						onPress={() => setMigrationDialogVisible(true)}
						style={[styles.actionButton, { marginTop: 12 }]}
						icon="upgrade"
						buttonColor={theme.colors.secondary}
					>
						Upgrade Questions Format
					</Button>
				</View>

				{/* Confirmation dialogs */}
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

					<Dialog
						visible={migrationDialogVisible}
						onDismiss={() => setMigrationDialogVisible(false)}
					>
						<Dialog.Title>Upgrade Question Format? 🚀</Dialog.Title>
						<Dialog.Content>
							<Paragraph style={{ marginBottom: 16 }}>
								This will upgrade your questions to the enhanced format with:
							</Paragraph>
							<Text style={{ marginLeft: 16, marginBottom: 8 }}>
								• ✅ Randomizable answer options
							</Text>
							<Text style={{ marginLeft: 16, marginBottom: 8 }}>
								• 📝 Optional answer explanations
							</Text>
							<Text style={{ marginLeft: 16, marginBottom: 8 }}>
								• 🎯 Multiple correct answers support
							</Text>
							<Text style={{ marginLeft: 16, marginBottom: 16 }}>
								• 🔄 Better quiz experience
							</Text>
							<Paragraph style={{ fontStyle: "italic", opacity: 0.8 }}>
								This is safe and reversible. Existing questions will be
								preserved.
							</Paragraph>
						</Dialog.Content>
						<Dialog.Actions>
							<Button onPress={() => setMigrationDialogVisible(false)}>
								Cancel
							</Button>
							<Button
								onPress={handleQuestionMigration}
								loading={migrating}
								disabled={migrating}
							>
								{migrating ? "Upgrading..." : "Upgrade"}
							</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>
			</ScrollView>
		</SafeAreaView>
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
