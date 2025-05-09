// src/components/ErrorBoundary.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		// You can also log the error to an error reporting service
		console.error("ErrorBoundary caught an error", error, errorInfo);
		this.setState({
			error: error,
			errorInfo: errorInfo,
		});
	}

	resetError = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
	};

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return (
				<View style={styles.container}>
					<Text style={styles.title}>Something went wrong!</Text>
					<Text style={styles.message}>
						{this.state.error && this.state.error.toString()}
					</Text>
					<TouchableOpacity style={styles.button} onPress={this.resetError}>
						<Text style={styles.buttonText}>Try Again</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return this.props.children;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#f8f9fa",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
		color: "#dc3545",
	},
	message: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 24,
		color: "#343a40",
	},
	button: {
		backgroundColor: "#007bff",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	buttonText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default ErrorBoundary;
