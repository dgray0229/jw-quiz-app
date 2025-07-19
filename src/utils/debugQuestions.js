// Debug utility to check question data
export const debugQuestions = (questions) => {
	console.log("=== DEBUGGING QUESTIONS ===");
	console.log(`Total questions: ${questions.length}`);
	
	questions.forEach((question, index) => {
		console.log(`\n--- Question ${index + 1} (ID: ${question.id}) ---`);
		console.log(`Question Text: ${question.question_text}`);
		console.log(`Answer Options Type: ${typeof question.answer_options}`);
		console.log(`Answer Options Value:`, question.answer_options);
		
		// Check if it's the problematic "[object Object]" string
		if (question.answer_options === "[object Object]") {
			console.error("⚠️  FOUND PROBLEMATIC DATA: answer_options is '[object Object]'");
		}
		
		// Try to parse if it's a string
		if (typeof question.answer_options === 'string') {
			try {
				const parsed = JSON.parse(question.answer_options);
				console.log("✅ Successfully parsed:", parsed);
			} catch (error) {
				console.error("❌ Failed to parse:", error.message);
				console.error("Raw string value:", question.answer_options);
			}
		}
		
		console.log(`Correct Answer: ${question.correct_answer} (type: ${typeof question.correct_answer})`);
	});
	
	console.log("\n=== END DEBUG ===\n");
};

// Function to fix problematic questions
export const fixProblematicQuestions = (questions) => {
	return questions.map(question => {
		// If answer_options is "[object Object]", provide default options
		if (question.answer_options === "[object Object]" || 
			question.answer_options === "undefined" ||
			question.answer_options === "null") {
			console.warn(`Fixing problematic answer_options for question ${question.id}`);
			return {
				...question,
				answer_options: JSON.stringify(["Option A", "Option B", "Option C", "Option D"])
			};
		}
		return question;
	});
};