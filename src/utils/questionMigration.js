// src/utils/questionMigration.js
// Utility to migrate questions to the new randomization-safe format with optional explanations

import { supabase } from './supabaseClient';

/**
 * Enhanced question structure:
 * {
 *   "answer_options": [
 *     {
 *       "id": "a",
 *       "text": "London", 
 *       "is_correct": false,
 *       "explanation": "London is the capital of the UK" // OPTIONAL
 *     },
 *     {
 *       "id": "b", 
 *       "text": "Paris",
 *       "is_correct": true,
 *       "explanation": "Paris has been France's capital since 987 AD" // OPTIONAL
 *     }
 *   ],
 *   "shuffle_answers": true,
 *   "multiple_correct": false
 * }
 */

// Generate unique IDs for answer options
const generateAnswerId = (index) => {
  return String.fromCharCode(97 + index); // 'a', 'b', 'c', 'd', etc.
};

export const migrateToEnhancedQuestionFormat = async () => {
  console.log('🔄 Starting enhanced question format migration...');
  
  try {
    // Get all existing questions
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('*');

    if (fetchError) throw fetchError;

    console.log(`📋 Found ${questions.length} questions to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    // Migrate each question
    for (const question of questions) {
      // Check if already migrated (has answer_options as new format)
      if (question.answer_options && Array.isArray(question.answer_options) && 
          question.answer_options[0]?.id && question.answer_options[0]?.text) {
        console.log(`⏭️  Question already migrated: ${question.question_text?.substring(0, 50)}...`);
        skippedCount++;
        continue;
      }

      // Migrate from old format (options array + correct_answer index)
      if (question.answer_options && Array.isArray(question.answer_options) && 
          question.correct_answer !== null && question.correct_answer !== undefined) {
        
        const enhancedAnswerOptions = question.answer_options.map((option, index) => ({
          id: generateAnswerId(index),
          text: option,
          is_correct: index === question.correct_answer,
          explanation: null // Start with null, can be added later
        }));

        const enhancedQuestionData = {
          answer_options: enhancedAnswerOptions,
          shuffle_answers: true, // Enable shuffling by default
          multiple_correct: false // Single correct answer by default
        };

        const { error: updateError } = await supabase
          .from('questions')
          .update({ 
            answer_options: enhancedQuestionData,
            // Remove old columns if they exist
            options: null,
            correct_answer: null
          })
          .eq('id', question.id);

        if (updateError) {
          console.error(`❌ Failed to migrate question ${question.id}:`, updateError);
        } else {
          console.log(`✅ Migrated: ${question.question_text?.substring(0, 50)}...`);
          migratedCount++;
        }
      }
      // Handle old format with 'options' column (string array)
      else if (question.options && Array.isArray(question.options) && 
               question.correct_answer !== null && question.correct_answer !== undefined) {
        
        const enhancedAnswerOptions = question.options.map((option, index) => ({
          id: generateAnswerId(index),
          text: option,
          is_correct: index === question.correct_answer,
          explanation: null
        }));

        const enhancedQuestionData = {
          answer_options: enhancedAnswerOptions,
          shuffle_answers: true,
          multiple_correct: false
        };

        const { error: updateError } = await supabase
          .from('questions')
          .update({ 
            answer_options: enhancedQuestionData
          })
          .eq('id', question.id);

        if (updateError) {
          console.error(`❌ Failed to migrate question ${question.id}:`, updateError);
        } else {
          console.log(`✅ Migrated: ${question.question_text?.substring(0, 50)}...`);
          migratedCount++;
        }
      } else {
        console.log(`⚠️  Skipping question (unsupported format): ${question.question_text?.substring(0, 50)}...`);
        skippedCount++;
      }
    }

    console.log(`🎉 Migration completed!`);
    console.log(`   ✅ Migrated: ${migratedCount} questions`);
    console.log(`   ⏭️  Skipped: ${skippedCount} questions`);
    
    return { 
      success: true, 
      migratedCount, 
      skippedCount, 
      totalCount: questions.length 
    };

  } catch (error) {
    console.error('💥 Migration failed:', error);
    return { success: false, error: error.message };
  }
};

// Test migration on a single question (for testing)
export const testMigrationOnSingleQuestion = async (questionId) => {
  console.log(`🧪 Testing migration on question: ${questionId}`);
  
  try {
    const { data: question, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) throw error;

    console.log('Before migration:', JSON.stringify(question, null, 2));

    // Perform migration logic
    if (question.options && question.correct_answer !== null) {
      const enhancedAnswerOptions = question.options.map((option, index) => ({
        id: generateAnswerId(index),
        text: option,
        is_correct: index === question.correct_answer,
        explanation: null
      }));

      const enhancedQuestionData = {
        answer_options: enhancedAnswerOptions,
        shuffle_answers: true,
        multiple_correct: false
      };

      console.log('After migration would be:', JSON.stringify(enhancedQuestionData, null, 2));
    }

    return { success: true };
  } catch (error) {
    console.error('Test migration failed:', error);
    return { success: false, error: error.message };
  }
};

// Rollback migration (restore old format)
export const rollbackQuestionMigration = async () => {
  console.log('⚠️  Starting migration rollback...');
  
  try {
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('*');

    if (fetchError) throw fetchError;

    let rolledBackCount = 0;

    for (const question of questions) {
      if (question.answer_options?.answer_options) {
        const answerOptions = question.answer_options.answer_options;
        
        // Extract old format
        const options = answerOptions.map(opt => opt.text);
        const correctAnswerIndex = answerOptions.findIndex(opt => opt.is_correct);

        const { error: updateError } = await supabase
          .from('questions')
          .update({
            options: options,
            correct_answer: correctAnswerIndex,
            answer_options: answerOptions // Keep as simple array
          })
          .eq('id', question.id);

        if (!updateError) {
          rolledBackCount++;
        }
      }
    }

    console.log(`✅ Rollback completed: ${rolledBackCount} questions`);
    return { success: true, rolledBackCount };

  } catch (error) {
    console.error('💥 Rollback failed:', error);
    return { success: false, error: error.message };
  }
};
