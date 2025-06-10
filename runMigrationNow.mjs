// Migration to enhance question format
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aoeniduyezvpjomlauqg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZW5pZHV5ZXp2cGpvbWxhdXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDEwNjgsImV4cCI6MjA2MjM3NzA2OH0.J_e9BfoPaOFpus9tw8buFH8G7EM1x2dDFxgzVVScJqI';

const supabase = createClient(supabaseUrl, supabaseKey);

function generateAnswerId(index) {
  return String.fromCharCode(97 + index); // 'a', 'b', 'c', 'd'
}

async function migrateQuestions() {
  try {
    console.log('Starting question format migration...');
    
    // Get all questions
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('*');
      
    if (fetchError) {
      console.error('Error fetching questions:', fetchError);
      return;
    }
    
    console.log(`Found ${questions.length} questions to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const question of questions) {
      // Check if already migrated (has answer_options with objects)
      const options = question.answer_options;
      if (Array.isArray(options) && options.length > 0 && 
          typeof options[0] === 'object' && options[0].hasOwnProperty('is_correct')) {
        console.log(`Question ${question.id} already migrated`);
        skipped++;
        continue;
      }
      
      // Convert to enhanced format
      const enhancedOptions = options.map((optionText, index) => ({
        id: generateAnswerId(index),
        text: optionText,
        is_correct: index === question.correct_answer,
        explanation: null // Can be added later
      }));
      
      // Update the question
      const { error: updateError } = await supabase
        .from('questions')
        .update({
          answer_options: enhancedOptions
        })
        .eq('id', question.id);
        
      if (updateError) {
        console.error(`Error updating question ${question.id}:`, updateError);
      } else {
        console.log(`✓ Migrated question ${question.id}: ${question.question_text.substring(0, 50)}...`);
        migrated++;
      }
    }
    
    console.log(`\nMigration complete:`);
    console.log(`- Migrated: ${migrated} questions`);
    console.log(`- Skipped: ${skipped} questions`);
    
  } catch (error) {
    console.error('Migration error:', error);
  }
  
  process.exit(0);
}

migrateQuestions();
