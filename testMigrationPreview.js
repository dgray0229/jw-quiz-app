// Test the migration process on a single question
const { supabase } = require('./src/utils/supabaseClient');
const { migrateQuestionsToEnhancedFormat, validateEnhancedQuestion } = require('./src/utils/questionMigration');

async function testMigration() {
    try {
        console.log('🧪 Testing migration process...\n');
        
        // Get one question to test migration
        const { data: questions, error } = await supabase
            .from('questions')
            .select('*')
            .limit(1);
            
        if (error || !questions.length) {
            console.error('Error fetching test question:', error);
            return;
        }
        
        const testQuestion = questions[0];
        console.log('📋 Original Question:');
        console.log('ID:', testQuestion.id);
        console.log('Question Text:', testQuestion.question_text);
        console.log('Answer Options:', testQuestion.answer_options);
        console.log('Correct Answer:', testQuestion.correct_answer);
        
        // Test what the migration would produce
        if (Array.isArray(testQuestion.answer_options) && 
            typeof testQuestion.answer_options[0] === 'string') {
            
            const enhancedOptions = testQuestion.answer_options.map((option, index) => ({
                id: `option_${String.fromCharCode(97 + index)}`, // a, b, c, d
                text: option,
                is_correct: index === testQuestion.correct_answer,
                explanation: null
            }));
            
            console.log('\n🔄 Would migrate to:');
            console.log('Enhanced Answer Options:', JSON.stringify(enhancedOptions, null, 2));
            
            // Validate the enhanced format
            const isValid = validateEnhancedQuestion({
                ...testQuestion,
                answer_options: enhancedOptions
            });
            console.log('\n✅ Enhanced format valid:', isValid);
            
        } else {
            console.log('\n⚠️  Question already in enhanced format or invalid format');
        }
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testMigration();
