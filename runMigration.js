// runMigration.js - Execute the question format migration
const { supabase } = require('./src/utils/supabaseClient');
const { migrateQuestionsToEnhancedFormat, rollbackEnhancedFormat } = require('./src/utils/questionMigration');

async function runMigration() {
  console.log('🚀 Starting question format migration...');
  
  try {
    // First, let's see what we have
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .limit(5);
      
    if (fetchError) {
      console.error('❌ Error fetching questions:', fetchError);
      return;
    }
    
    console.log('📋 Current questions sample:', questions.map(q => ({
      id: q.id,
      question_text: q.question_text?.substring(0, 50) + '...',
      hasAnswerOptions: !!q.answer_options,
      hasOptions: !!q.options,
      correctAnswer: q.correct_answer
    })));
    
    // Run the migration
    const result = await migrateQuestionsToEnhancedFormat();
    
    if (result.success) {
      console.log('✅ Migration completed successfully!');
      console.log(`📊 Migrated ${result.migratedCount} questions`);
      console.log(`⏭️  Skipped ${result.skippedCount} questions (already in new format)`);
      
      if (result.errors && result.errors.length > 0) {
        console.log('⚠️  Errors during migration:');
        result.errors.forEach(error => console.log('   -', error));
      }
      
      // Show a sample of migrated questions
      const { data: updatedQuestions } = await supabase
        .from('questions')
        .select('*')
        .limit(3);
        
      console.log('\n📋 Sample migrated questions:');
      updatedQuestions?.forEach(q => {
        console.log(`\nQuestion: ${q.question_text?.substring(0, 50)}...`);
        if (q.answer_options) {
          try {
            const options = typeof q.answer_options === 'string' 
              ? JSON.parse(q.answer_options) 
              : q.answer_options;
            console.log('Answer Options:', options.map(opt => `${opt.id}: ${opt.text} (${opt.is_correct ? 'CORRECT' : 'wrong'})`));
          } catch (e) {
            console.log('Answer Options (raw):', q.answer_options);
          }
        }
      });
      
    } else {
      console.error('❌ Migration failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  process.exit(0);
}

runMigration();
