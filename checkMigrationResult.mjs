// Verify migration and check one specific question
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aoeniduyezvpjomlauqg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZW5pZHV5ZXp2cGpvbWxhdXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDEwNjgsImV4cCI6MjA2MjM3NzA2OH0.J_e9BfoPaOFpus9tw8buFH8G7EM1x2dDFxgzVVScJqI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMigration() {
  try {
    console.log('Checking migration results...');
    
    // Get one specific question
    const { data: question, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', 'bb7ada1a-bda4-419e-9a61-488c5b6345d9')
      .single();
      
    if (error) {
      console.error('Error fetching question:', error);
      return;
    }
    
    console.log('Question data:');
    console.log('- ID:', question.id);
    console.log('- Text:', question.question_text);
    console.log('- Answer Options:', JSON.stringify(question.answer_options, null, 2));
    console.log('- Correct Answer:', question.correct_answer);
    
    // Check the structure
    if (Array.isArray(question.answer_options) && question.answer_options.length > 0) {
      const firstOption = question.answer_options[0];
      console.log('\nFirst option analysis:');
      console.log('- Type:', typeof firstOption);
      console.log('- Has id?', firstOption.hasOwnProperty && firstOption.hasOwnProperty('id'));
      console.log('- Has text?', firstOption.hasOwnProperty && firstOption.hasOwnProperty('text'));
      console.log('- Has is_correct?', firstOption.hasOwnProperty && firstOption.hasOwnProperty('is_correct'));
      
      if (typeof firstOption === 'object') {
        console.log('- Keys:', Object.keys(firstOption));
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkMigration();
