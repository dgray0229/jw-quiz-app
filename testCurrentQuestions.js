// Test script to check current question format in database
const { supabase } = require('./src/utils/supabaseClient');

async function checkCurrentQuestions() {
    try {
        console.log('🔍 Checking current question format in database...');
        
        // Get a few sample questions
        const { data: questions, error } = await supabase
            .from('questions')
            .select('*')
            .limit(3);
            
        if (error) {
            console.error('Error fetching questions:', error);
            return;
        }
        
        console.log(`📊 Found ${questions.length} sample questions:`);
        questions.forEach((question, index) => {
            console.log(`\n--- Question ${index + 1} ---`);
            console.log('ID:', question.id);
            console.log('Question Text:', question.question_text);
            console.log('Options Type:', typeof question.options);
            console.log('Options:', question.options);
            console.log('Correct Answer:', question.correct_answer);
            console.log('Answer Options (new format):', question.answer_options);
            console.log('Has new format?', question.answer_options ? 'YES' : 'NO');
        });
        
    } catch (error) {
        console.error('Script error:', error);
    }
}

checkCurrentQuestions();
