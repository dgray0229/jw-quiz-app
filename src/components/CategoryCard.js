// src/components/CategoryCard.js
import React from "react";
import { StyleSheet } from "react-native";
import {
	Card,
	Title,
	Paragraph,
	IconButton,
	useTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const CategoryCard = ({ category, onPress }) => {
	const theme = useTheme();

	return (
		<Card style={styles.card} onPress={onPress}>
			<Card.Content style={styles.content}>
				<MaterialCommunityIcons
					name={category.icon}
					size={40}
					color={theme.colors.primary}
					style={styles.icon}
				/>
				<Title style={styles.title}>{category.name}</Title>
				<Paragraph numberOfLines={2} style={styles.description}>
					{category.description}
				</Paragraph>
				<Paragraph style={styles.quizCount}>
					{category.totalQuizzes}{" "}
					{category.totalQuizzes === 1 ? "Quiz" : "Quizzes"}
				</Paragraph>
			</Card.Content>
			<Card.Actions style={styles.actions}>
				<IconButton
					icon="chevron-right"
					size={24}
					color={theme.colors.primary}
					onPress={onPress}
				/>
			</Card.Actions>
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
	content: {
		paddingTop: 16,
		paddingBottom: 8,
	},
	icon: {
		marginBottom: 8,
	},
	title: {
		fontWeight: "bold",
	},
	description: {
		marginTop: 4,
		marginBottom: 8,
	},
	quizCount: {
		opacity: 0.7,
	},
	actions: {
		justifyContent: "flex-end",
	},
});

export default CategoryCard;
