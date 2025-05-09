// src/data/dummyData.js
// Dummy data for the quiz app

// Quiz categories
export const categories = [
	{
		id: "1",
		name: "Science",
		icon: "atom",
		description: "Test your knowledge of scientific concepts and discoveries",
		totalQuizzes: 3,
	},
	{
		id: "2",
		name: "History",
		icon: "book",
		description: "Journey through the important events of the past",
		totalQuizzes: 4,
	},
	{
		id: "3",
		name: "Geography",
		icon: "earth",
		description: "Explore the world and its diverse features",
		totalQuizzes: 2,
	},
	{
		id: "4",
		name: "Entertainment",
		icon: "movie",
		description: "Questions about movies, music, and pop culture",
		totalQuizzes: 5,
	},
	{
		id: "5",
		name: "Sports",
		icon: "football",
		description: "Test your knowledge of various sports and athletes",
		totalQuizzes: 3,
	},
];

// Quiz questions by category
export const quizzes = {
	1: [
		{
			id: "s1",
			title: "Basic Physics",
			description: "Test your knowledge of fundamental physics concepts",
			questions: [
				{
					id: "q1-s1",
					questionText: "What is the formula for force?",
					answerOptions: ["F = ma", "E = mc²", "F = mv", "P = mv"],
					correctAnswer: 0,
				},
				{
					id: "q2-s1",
					questionText: "Which particle has a positive charge?",
					answerOptions: ["Electron", "Proton", "Neutron", "Photon"],
					correctAnswer: 1,
				},
				{
					id: "q3-s1",
					questionText: "What is the SI unit of energy?",
					answerOptions: ["Newton", "Watt", "Joule", "Pascal"],
					correctAnswer: 2,
				},
			],
		},
		{
			id: "s2",
			title: "Chemistry Basics",
			description: "Test your knowledge of fundamental chemistry concepts",
			questions: [
				{
					id: "q1-s2",
					questionText: "What is the chemical symbol for gold?",
					answerOptions: ["Go", "Gd", "Au", "Ag"],
					correctAnswer: 2,
				},
				{
					id: "q2-s2",
					questionText: "Which element has the atomic number 1?",
					answerOptions: ["Helium", "Hydrogen", "Oxygen", "Carbon"],
					correctAnswer: 1,
				},
				{
					id: "q3-s2",
					questionText: "What is the pH of a neutral solution?",
					answerOptions: ["0", "7", "14", "10"],
					correctAnswer: 1,
				},
			],
		},
	],
	2: [
		{
			id: "h1",
			title: "Ancient History",
			description: "Test your knowledge of ancient civilizations",
			questions: [
				{
					id: "q1-h1",
					questionText: "Which civilization built the pyramids at Giza?",
					answerOptions: ["Romans", "Greeks", "Egyptians", "Persians"],
					correctAnswer: 2,
				},
				{
					id: "q2-h1",
					questionText: "Who was the first Emperor of Rome?",
					answerOptions: ["Julius Caesar", "Augustus", "Nero", "Constantine"],
					correctAnswer: 1,
				},
				{
					id: "q3-h1",
					questionText: "Which ancient wonder was located in Alexandria?",
					answerOptions: [
						"Hanging Gardens",
						"Colossus",
						"Lighthouse",
						"Temple of Artemis",
					],
					correctAnswer: 2,
				},
			],
		},
	],
};

// User's best scores (simulating local storage data)
export const userScores = {
	s1: 2, // 2 out of 3 correct
	h1: 3, // 3 out of 3 correct
	s2: 1, // 1 out of 3 correct
};
