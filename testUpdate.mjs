// Test update permissions and migration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aoeniduyezvpjomlauqg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZW5pZHV5ZXp2cGpvbWxhdXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDEwNjgsImV4cCI6MjA2MjM3NzA2OH0.J_e9BfoPaOFpus9tw8buFH8G7EM1x2dDFxgzVVScJqI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  try {
    console.log('Testing update on one question...');
    
    // Get one question first
    const { data: question, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', 'bb7ada1a-bda4-419e-9a61-488c5b6345d9')
      .single();
      
    if (fetchError) {
      console.error('Error fetching question:', fetchError);
      return;
    }
    
    console.log('Original question:', question);
    
    // Create enhanced format
    const enhancedOptions = question.answer_options.map((optionText, index) => ({
      id: String.fromCharCode(97 + index), // 'a', 'b', 'c', 'd'
      text: optionText,
      is_correct: index === question.correct_answer,
      explanation: null
    }));
    
    console.log('Enhanced options:', JSON.stringify(enhancedOptions, null, 2));
    
    // Try to update
    const { data, error: updateError } = await supabase
      .from('questions')
      .update({
        answer_options: enhancedOptions
      })
      .eq('id', question.id)
      .select();
      
    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('Update successful:', data);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

testUpdate();
