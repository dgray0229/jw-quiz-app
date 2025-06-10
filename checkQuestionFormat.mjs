// Simple ES module to check current question format
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aoeniduyezvpjomlauqg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZW5pZHV5ZXp2cGpvbWxhdXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDEwNjgsImV4cCI6MjA2MjM3NzA2OH0.J_e9BfoPaOFpus9tw8buFH8G7EM1x2dDFxgzVVScJqI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuestionFormat() {
  try {
    console.log('Checking current question format...');
    
    // Get a sample question
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .limit(3);
      
    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }
    
    console.log('Sample questions:');
    questions.forEach((q, index) => {
      console.log(`\nQuestion ${index + 1}:`);
      console.log('- ID:', q.id);
      console.log('- Text:', q.question_text);
      console.log('- Options:', JSON.stringify(q.answer_options, null, 2));
      console.log('- Correct Answer:', q.correct_answer);
      console.log('- Type of options:', typeof q.answer_options);
      
      if (typeof q.answer_options === 'string') {
        try {
          const parsed = JSON.parse(q.answer_options);
          console.log('- Parsed options:', parsed);
          console.log('- Is array:', Array.isArray(parsed));
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('- First option type:', typeof parsed[0]);
            console.log('- First option:', parsed[0]);
          }
        } catch (e) {
          console.log('- Failed to parse as JSON');
        }
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkQuestionFormat();
