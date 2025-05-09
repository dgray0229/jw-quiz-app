// src/screens/CategoriesScreen.js
import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
	Searchbar,
	ActivityIndicator,
	FAB,
	useTheme,
} from "react-native-paper";
import { useQuiz } from "../context/QuizContext";
import CategoryCard from "../components/CategoryCard";

const CategoriesScreen = ({ navigation }) => {
	const [searchQuery, setSearchQuery] = React.useState("");
	const { categories, loading } = useQuiz();
	const theme = useTheme();

	// Filter categories based on search query
	const filteredCategories = categories.filter((category) =>
		category.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleCategoryPress = (category) => {
		navigation.navigate("QuizList", {
			categoryId: category.id,
			categoryName: category.name,
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
			<Searchbar
				placeholder="Search categories"
				onChangeText={setSearchQuery}
				value={searchQuery}
				style={styles.searchBar}
			/>

			<FlatList
				data={filteredCategories}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<CategoryCard
						category={item}
						onPress={() => handleCategoryPress(item)}
					/>
				)}
				contentContainerStyle={styles.listContent}
			/>

			<FAB
				style={[styles.fab, { backgroundColor: theme.colors.primary }]}
				icon="plus"
				label="Create Quiz"
				onPress={() => navigation.navigate("CreateQuiz")}
			/>
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
	searchBar: {
		margin: 16,
		borderRadius: 12,
		elevation: 4,
	},
	listContent: {
		paddingBottom: 16,
	},
	fab: {
		position: "absolute",
		margin: 16,
		right: 0,
		bottom: 0,
	},
});

export default CategoriesScreen;
