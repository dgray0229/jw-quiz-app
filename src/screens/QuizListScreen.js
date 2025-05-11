// src/screens/QuizListScreen.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, ActivityIndicator, Banner } from "react-native-paper";
import { useQuiz } from "../context/QuizContext";
import QuizCard from "../components/QuizCard";

const QuizListScreen = ({ route, navigation }) => {
	const { categoryId, categoryName } = route.params;
	const { getQuizzesForCategory, loading } = useQuiz();
	const [quizzes, setQuizzes] = useState([]);
	const [bannerVisible, setBannerVisible] = useState(false);

	useEffect(() => {
		if (!loading) {
			const categoryQuizzes = getQuizzesForCategory(categoryId) || [];
			setQuizzes(Array.isArray(categoryQuizzes) ? categoryQuizzes : []);
			setBannerVisible(categoryQuizzes.length === 0);
		}
	}, [categoryId, loading, getQuizzesForCategory]);

	const handleQuizPress = (quiz) => {
		navigation.navigate("Quiz", {
			categoryId,
			quizId: quiz.id,
			quizTitle: quiz.title,
		});
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Banner
				visible={bannerVisible}
				actions={[
					{
						label: "Go Back",
						onPress: () => navigation.goBack(),
					},
				]}
				icon="information"
			>
				No quizzes available for this category yet.
			</Banner>

			{quizzes.length > 0 ? (
				<FlatList
					data={quizzes}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<QuizCard
							quiz={item}
							categoryId={categoryId}
							onPress={() => handleQuizPress(item)}
						/>
					)}
					contentContainerStyle={styles.listContent}
				/>
			) : (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>
						No quizzes available for this category yet.
					</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	listContent: {
		paddingVertical: 8,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	emptyText: {
		fontSize: 16,
		textAlign: "center",
		opacity: 0.6,
	},
});

export default QuizListScreen;
