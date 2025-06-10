// simpleMigration.js - Execute migration using direct Supabase calls
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctccusvakqrsqbzpmvch.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y2N1c3Zha3Fyc3FienBtdmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0OTQ5NjksImV4cCI6MjA0NjA3MDk2OX0.qYFNOojj3nDBpM2LVIXhYkPSfR6q8S0w8UQlqQQBfx4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate answer ID
function generateAnswerId(index) {
  return String.fromCharCode(97 + index); // 'a', 'b', 'c', etc.
}

async function migrateQuestions() {
  console.log('🚀 Starting question format migration...');
  
  try {
    // Fetch all questions
    console.log('📡 Attempting to fetch questions...');
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('*');
      
    if (fetchError) {
      console.error('❌ Error fetching questions:', fetchError);
      console.error('❌ Full error details:', JSON.stringify(fetchError, null, 2));
      return;
    }
    
    console.log(`📋 Found ${questions.length} questions to process`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    const errors = [];
    
    for (const question of questions) {
      try {
        // Check if already in new format
        if (question.answer_options && !question.options) {
          console.log(`⏭️  Skipping question ${question.id} - already in new format`);
          skippedCount++;
          continue;
        }
        
        // Parse existing options
        let options;
        if (question.options) {
          options = typeof question.options === 'string' 
            ? JSON.parse(question.options) 
            : question.options;
        } else if (question.answer_options) {
          options = typeof question.answer_options === 'string' 
            ? JSON.parse(question.answer_options) 
            : question.answer_options;
        } else {
          console.log(`⚠️  Question ${question.id} has no options to migrate`);
          continue;
        }
        
        if (!Array.isArray(options)) {
          console.log(`⚠️  Question ${question.id} options are not an array:`, options);
          continue;
        }
        
        // Create enhanced answer options
        const enhancedAnswerOptions = options.map((option, index) => ({
          id: generateAnswerId(index),
          text: option,
          is_correct: index === question.correct_answer,
          explanation: null // Can be added later
        }));
        
        // Update the question
        const { error: updateError } = await supabase
          .from('questions')
          .update({
            answer_options: enhancedAnswerOptions,
            options: null, // Remove old options field
            // Keep correct_answer for backward compatibility during transition
          })
          .eq('id', question.id);
          
        if (updateError) {
          console.error(`❌ Error updating question ${question.id}:`, updateError);
          errors.push(`Question ${question.id}: ${updateError.message}`);
        } else {
          console.log(`✅ Migrated question ${question.id}`);
          migratedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing question ${question.id}:`, error);
        errors.push(`Question ${question.id}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`📊 Migrated: ${migratedCount} questions`);
    console.log(`⏭️  Skipped: ${skippedCount} questions`);
    console.log(`❌ Errors: ${errors.length} questions`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Error details:');
      errors.forEach(error => console.log('   -', error));
    }
    
    // Show sample of migrated questions
    const { data: sampleQuestions } = await supabase
      .from('questions')
      .select('*')
      .limit(3);
      
    console.log('\n📋 Sample migrated questions:');
    sampleQuestions?.forEach(q => {
      console.log(`\n📝 Question: ${q.question_text?.substring(0, 50)}...`);
      if (q.answer_options) {
        try {
          const options = typeof q.answer_options === 'string' 
            ? JSON.parse(q.answer_options) 
            : q.answer_options;
          console.log('📋 Answer Options:');
          options.forEach(opt => {
            console.log(`   ${opt.id}: ${opt.text} ${opt.is_correct ? '✅' : '❌'}`);
          });
        } catch (e) {
          console.log('📋 Answer Options (raw):', q.answer_options);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

migrateQuestions().then(() => {
  console.log('\n🏁 Migration script completed');
  process.exit(0);
});
