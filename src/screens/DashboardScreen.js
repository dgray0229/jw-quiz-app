// src/screens/DashboardScreen.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
	Text,
	Card,
	Title,
	Paragraph,
	Button,
	Divider,
	useTheme,
	Avatar,
	FAB,
} from "react-native-paper";
import { useQuiz } from "../context/QuizContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ScoreChart from "../components/ScoreChart";
import { SafeAreaView } from "react-native-safe-area-context";

const DashboardScreen = ({ navigation }) => {
	const theme = useTheme();
	const { categories, quizzes, scores } = useQuiz();

	const [refreshing, setRefreshing] = useState(false);
	const [totalQuizzes, setTotalQuizzes] = useState(0);
	const [completedQuizzes, setCompletedQuizzes] = useState(0);
	const [recentActivity, setRecentActivity] = useState([]);

	// Function to calculate stats
	const calculateStats = () => {
		// Calculate total quizzes (now quizzes is a flat array)
		setTotalQuizzes(quizzes.length);

		// Calculate completed quizzes
		setCompletedQuizzes(Object.keys(scores).length);

		// Create recent activity list (just using dummy data for now)
		// In a real app, this would track timestamps of when quizzes were taken
		const recent = Object.entries(scores)
			.slice(0, 3)
			.map(([quizId, score]) => ({
				quizId,
				score,
				date: new Date().toLocaleDateString(), // Just using today's date for the mock
			}));
		setRecentActivity(recent);
	};

	// Calculate stats on mount and when scores/quizzes change
	useEffect(() => {
		calculateStats();
	}, [scores, quizzes]);

	// Handle refresh
	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		// In a real app, this would fetch fresh data from the server
		calculateStats();
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	// Find quiz by ID
	const findQuizById = (quizId) => {
		// With the new flat structure, we can directly find the quiz
		const foundQuiz = quizzes.find((q) => String(q.id) === String(quizId));
		return foundQuiz || { title: "Unknown Quiz" };
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<ScrollView
					style={styles.scrollView}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
				>
					{/* Welcome Card */}
					<Card style={styles.welcomeCard}>
						<Card.Content>
							<View style={styles.welcomeHeader}>
								<View>
									<Title style={styles.welcomeTitle}>Welcome Back!</Title>
									<Paragraph style={styles.welcomeSubtitle}>
										Ready for some new quizzes?
									</Paragraph>
								</View>
								<Avatar.Icon
									size={60}
									icon="brain"
									color="#fff"
									style={{ backgroundColor: theme.colors.primary }}
								/>
							</View>
						</Card.Content>
						<Card.Actions style={styles.cardActions}>
							<Button
								mode="contained"
								onPress={() => navigation.navigate("Quizzes")}
							>
								Take a Quiz
							</Button>
						</Card.Actions>
					</Card>

					{/* Stats Section */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Your Stats</Text>
						<View style={styles.statsRow}>
							<Card style={styles.statsCard}>
								<Card.Content style={styles.statsCardContent}>
									<MaterialCommunityIcons
										name="check-circle-outline"
										size={36}
										color={theme.colors.primary}
									/>
									<Title style={styles.statsNumber}>{completedQuizzes}</Title>
									<Text style={styles.statsLabel}>Quizzes Completed</Text>
								</Card.Content>
							</Card>

							<Card style={styles.statsCard}>
								<Card.Content style={styles.statsCardContent}>
									<MaterialCommunityIcons
										name="percent"
										size={36}
										color={theme.colors.accent}
									/>
									<Title style={styles.statsNumber}>
										{totalQuizzes
											? Math.round((completedQuizzes / totalQuizzes) * 100)
											: 0}
										%
									</Title>
									<Text style={styles.statsLabel}>Completion Rate</Text>
								</Card.Content>
							</Card>
						</View>
					</View>

					{/* Progress Chart */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Your Progress</Text>
						<ScoreChart scores={scores} />
					</View>

					{/* Recent Activity */}
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Recent Activity</Text>
						<Card style={styles.activityCard}>
							{recentActivity.length > 0 ? (
								recentActivity.map((activity, index) => (
									<React.Fragment key={activity.quizId || index}>
										<Card.Content style={styles.activityItem}>
											<View style={styles.activityDetails}>
												<Text style={styles.activityTitle}>
													{findQuizById(activity.quizId).title}
												</Text>
												<Text style={styles.activityDate}>{activity.date}</Text>
											</View>
											<View style={styles.activityScore}>
												<Text style={styles.scoreText}>
													Score:{" "}
													<Text style={styles.scoreValue}>
														{activity.score}
													</Text>
												</Text>
											</View>
										</Card.Content>
										{index < recentActivity.length - 1 && <Divider />}
									</React.Fragment>
								))
							) : (
								<Card.Content style={styles.emptyActivity}>
									<Text style={styles.emptyText}>No recent activity</Text>
								</Card.Content>
							)}
						</Card>
					</View>
				</ScrollView>

				{/* FAB for quick quiz start */}
				<FAB
					style={[styles.fab, { backgroundColor: theme.colors.primary }]}
					icon="play"
					label="Quick Quiz"
					onPress={() => navigation.navigate("Quizzes")}
				/>
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
	},
	scrollView: {
		flex: 1,
	},
	welcomeCard: {
		margin: 16,
		marginBottom: 8,
		borderRadius: 12,
		elevation: 4,
	},
	welcomeHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	welcomeTitle: {
		fontSize: 24,
		fontWeight: "bold",
	},
	welcomeSubtitle: {
		fontSize: 16,
		opacity: 0.7,
	},
	cardActions: {
		justifyContent: "flex-end",
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	section: {
		marginHorizontal: 16,
		marginTop: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
	},
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	statsCard: {
		flex: 1,
		marginHorizontal: 4,
		borderRadius: 12,
		elevation: 3,
	},
	statsCardContent: {
		alignItems: "center",
		paddingVertical: 16,
	},
	statsNumber: {
		fontSize: 28,
		fontWeight: "bold",
		marginVertical: 4,
	},
	statsLabel: {
		fontSize: 14,
		opacity: 0.7,
	},
	activityCard: {
		borderRadius: 12,
		elevation: 3,
		overflow: "hidden",
	},
	activityItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
	},
	activityDetails: {
		flex: 1,
	},
	activityTitle: {
		fontWeight: "500",
		fontSize: 16,
	},
	activityDate: {
		opacity: 0.6,
		fontSize: 14,
		marginTop: 4,
	},
	activityScore: {
		marginLeft: 16,
	},
	scoreText: {
		fontSize: 14,
	},
	scoreValue: {
		fontWeight: "bold",
		fontSize: 16,
	},
	emptyActivity: {
		paddingVertical: 24,
		alignItems: "center",
	},
	emptyText: {
		opacity: 0.6,
		fontStyle: "italic",
	},
	fab: {
		position: "absolute",
		margin: 16,
		right: 0,
		bottom: 0,
	},
});

export default DashboardScreen;
