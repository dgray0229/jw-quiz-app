import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
	Text,
	Card,
	Title,
	Paragraph,
	Button,
	useTheme,
} from "react-native-paper";
import { useQuiz } from "../context/QuizContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const HomeScreen = ({ navigation }) => {
	const theme = useTheme();
	const { categories, scores } = useQuiz();

	// Calculate total quizzes completed
	const completedQuizzes = Object.keys(scores).length;

	// Get featured categories (just the first 2 for the homepage)
	const featuredCategories = categories.slice(0, 2);

	return (
		<ScrollView style={styles.container}>
			<Card style={styles.welcomeCard}>
				<Card.Content>
					<Title style={styles.welcomeTitle}>Welcome to Quiz App!</Title>
					<Paragraph style={styles.welcomeParagraph}>
						Test your knowledge with our collection of quizzes across various
						categories.
					</Paragraph>
				</Card.Content>
			</Card>

			<View style={styles.statsContainer}>
				<Card style={styles.statsCard}>
					<Card.Content style={styles.statsContent}>
						<MaterialCommunityIcons
							name="checkbox-marked-circle-outline"
							size={36}
							color={theme.colors.accent}
						/>
						<Title style={styles.statsNumber}>{completedQuizzes}</Title>
						<Paragraph>Quizzes Completed</Paragraph>
					</Card.Content>
				</Card>

				<Card style={styles.statsCard}>
					<Card.Content style={styles.statsContent}>
						<MaterialCommunityIcons
							name="book-open-variant"
							size={36}
							color={theme.colors.primary}
						/>
						<Title style={styles.statsNumber}>{categories.length}</Title>
						<Paragraph>Categories</Paragraph>
					</Card.Content>
				</Card>
			</View>

			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>Featured Categories</Text>
			</View>

			{featuredCategories.map((category) => (
				<Card
					key={category.id}
					style={styles.featuredCard}
					onPress={() =>
						navigation.navigate("Quizzes", {
							screen: "QuizList",
							params: { categoryId: category.id, categoryName: category.name },
						})
					}
				>
					<Card.Cover
						source={{
							uri: `https://picsum.photos/seed/${category.name}/400/200`,
						}}
						style={styles.cardCover}
					/>
					<Card.Content>
						<Title>{category.name}</Title>
						<Paragraph numberOfLines={2}>{category.description}</Paragraph>
					</Card.Content>
				</Card>
			))}

			<Button
				mode="contained"
				style={styles.browseButton}
				onPress={() => navigation.navigate("Quizzes")}
			>
				Browse All Categories
			</Button>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	welcomeCard: {
		margin: 16,
		borderRadius: 12,
		elevation: 4,
	},
	welcomeTitle: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
	},
	welcomeParagraph: {
		textAlign: "center",
		marginTop: 8,
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginHorizontal: 16,
		marginBottom: 16,
	},
	statsCard: {
		flex: 1,
		marginHorizontal: 4,
		borderRadius: 12,
		elevation: 3,
	},
	statsContent: {
		alignItems: "center",
		padding: 8,
	},
	statsNumber: {
		fontSize: 26,
		fontWeight: "bold",
		marginVertical: 4,
	},
	sectionHeader: {
		paddingHorizontal: 16,
		marginBottom: 8,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	featuredCard: {
		margin: 16,
		marginTop: 8,
		borderRadius: 12,
		elevation: 4,
	},
	cardCover: {
		height: 150,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
	},
	browseButton: {
		margin: 16,
		marginTop: 8,
		paddingVertical: 8,
		borderRadius: 12,
	},
});

export default HomeScreen;
