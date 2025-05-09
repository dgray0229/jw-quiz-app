import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./src/navigation/AppNavigator";
import { QuizProvider } from "./src/context/QuizContext";
import { theme } from "./src/utils/theme";
import ErrorBoundary from "./src/components/ErrorBoundary";

export default function App() {
	return (
		<SafeAreaProvider>
			<PaperProvider theme={theme}>
				<ErrorBoundary>
					<QuizProvider>
						<AppNavigator />
						<StatusBar style="auto" />
					</QuizProvider>
				</ErrorBoundary>
			</PaperProvider>
		</SafeAreaProvider>
	);
}
