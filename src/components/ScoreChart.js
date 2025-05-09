// src/components/ScoreChart.js
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, useTheme } from "react-native-paper";

const ScoreChart = ({ scores, maxPossibleScore = 3 }) => {
	const theme = useTheme();
	const chartWidth = Dimensions.get("window").width - 64;

	// If no scores, show placeholder
	if (!scores || Object.keys(scores).length === 0) {
		return (
			<View style={[styles.container, { borderColor: theme.colors.disabled }]}>
				<Text style={styles.noDataText}>No quiz data available yet</Text>
			</View>
		);
	}

	// Convert scores object to array for rendering
	const scoreItems = Object.entries(scores).map(([quizId, score]) => ({
		id: quizId,
		score,
		percentage: (score / maxPossibleScore) * 100,
	}));

	return (
		<View style={[styles.container, { borderColor: theme.colors.primary }]}>
			{scoreItems.map((item, index) => (
				<View key={item.id} style={styles.barContainer}>
					<View style={styles.labelContainer}>
						<Text style={styles.label}>Quiz {index + 1}</Text>
						<Text style={styles.score}>
							{item.score}/{maxPossibleScore}
						</Text>
					</View>
					<View style={styles.barBackground}>
						<View
							style={[
								styles.bar,
								{
									width: `${item.percentage}%`,
									backgroundColor:
										item.percentage > 70
											? "#4CAF50"
											: item.percentage > 40
											? "#FF9800"
											: "#F44336",
								},
							]}
						/>
					</View>
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
		borderRadius: 8,
		borderWidth: 1,
		marginVertical: 8,
		minHeight: 120,
		justifyContent: "center",
	},
	barContainer: {
		marginBottom: 12,
	},
	labelContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	label: {
		fontSize: 12,
		fontWeight: "500",
	},
	score: {
		fontSize: 12,
		fontWeight: "bold",
	},
	barBackground: {
		height: 12,
		backgroundColor: "#e0e0e0",
		borderRadius: 6,
		overflow: "hidden",
	},
	bar: {
		height: "100%",
		borderRadius: 6,
	},
	noDataText: {
		textAlign: "center",
		opacity: 0.6,
		fontStyle: "italic",
	},
});

export default ScoreChart;
