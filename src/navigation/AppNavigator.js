// src/navigation/AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import DashboardScreen from "../screens/DashboardScreen";
import LandingScreen from "../screens/LandingScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import QuizListScreen from "../screens/QuizListScreen";
import QuizScreen from "../screens/QuizScreen";
import ResultScreen from "../screens/ResultScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CreateQuizScreen from "../screens/CreateQuizScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main stack navigator for the quiz flow
const QuizStack = () => {
	const theme = useTheme();

	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: {
					backgroundColor: theme.colors.primary,
				},
				headerTintColor: "#fff",
				headerTitleStyle: {
					fontWeight: "bold",
				},
			}}
		>
			<Stack.Screen
				name="Categories"
				component={CategoriesScreen}
				options={{ title: "Quiz Categories" }}
			/>
			<Stack.Screen
				name="QuizList"
				component={QuizListScreen}
				options={({ route }) => ({
					title: `${route.params.categoryName} Quizzes`,
				})}
			/>
			<Stack.Screen
				name="Quiz"
				component={QuizScreen}
				options={({ route }) => ({ title: route.params.quizTitle })}
			/>
			<Stack.Screen
				name="Result"
				component={ResultScreen}
				options={{ title: "Quiz Results", headerLeft: null }}
			/>
			<Stack.Screen
				name="CreateQuiz"
				component={CreateQuizScreen}
				options={{ title: "Create New Quiz" }}
			/>
		</Stack.Navigator>
	);
};

// Bottom tab navigator
const AppNavigator = () => {
	const theme = useTheme();

	return (
		<NavigationContainer>
			<Tab.Navigator
				screenOptions={{
					tabBarActiveTintColor: theme.colors.primary,
					tabBarInactiveTintColor: "gray",
					headerShown: false,
				}}
			>
				<Tab.Screen
					name="Home"
					component={DashboardScreen}
					options={{
						tabBarLabel: "Dashboard",
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons
								name="view-dashboard"
								color={color}
								size={size}
							/>
						),
					}}
				/>
				<Tab.Screen
					name="Quizzes"
					component={QuizStack}
					options={{
						tabBarLabel: "Quizzes",
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons
								name="book-open-variant"
								color={color}
								size={size}
							/>
						),
					}}
				/>
				<Tab.Screen
					name="Profile"
					component={ProfileScreen}
					options={{
						tabBarLabel: "Profile",
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons
								name="account"
								color={color}
								size={size}
							/>
						),
					}}
				/>
			</Tab.Navigator>
		</NavigationContainer>
	);
};

export default AppNavigator;
