// src/utils/theme.js
import { DefaultTheme } from "react-native-paper";

// Custom theme for React Native Paper
export const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: "#6200ee",
		accent: "#03dac4",
		background: "#f5f5f5",
		surface: "#ffffff",
		text: "#000000",
		error: "#B00020",
		disabled: "#9e9e9e",
		placeholder: "#9e9e9e",
		backdrop: "rgba(0, 0, 0, 0.5)",
		notification: "#f50057",
	},
	roundness: 12,
	animation: {
		scale: 1.0,
	},
};
