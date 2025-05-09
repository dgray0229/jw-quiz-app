// src/screens/LandingScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

const LandingScreen = ({ navigation }) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome to Quiz App</Text>
			<Text style={styles.subtitle}>Test your knowledge with fun quizzes!</Text>

			<Button
				mode="contained"
				style={styles.button}
				onPress={() => navigation.navigate("Quizzes")}
			>
				Start Quizzing
			</Button>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#f5f5f5",
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 16,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 18,
		marginBottom: 48,
		textAlign: "center",
		opacity: 0.7,
	},
	button: {
		paddingHorizontal: 24,
		paddingVertical: 8,
		borderRadius: 8,
	},
});

export default LandingScreen;
