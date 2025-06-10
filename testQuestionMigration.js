// testQuestionMigration.js
// Test script for the enhanced question migration

import { 
  migrateToEnhancedQuestionFormat,
  testMigrationOnSingleQuestion,
  rollbackQuestionMigration 
} from './src/utils/questionMigration.js';

async function testMigration() {
  console.log('🧪 TESTING ENHANCED QUESTION MIGRATION\n');
  
  try {
    console.log('📋 Step 1: Testing migration...');
    const result = await migrateToEnhancedQuestionFormat();
    
    if (result.success) {
      console.log('✅ Migration successful!');
      console.log(`   📊 Results:`);
      console.log(`   - Migrated: ${result.migratedCount} questions`);
      console.log(`   - Skipped: ${result.skippedCount} questions`);
      console.log(`   - Total: ${result.totalCount} questions`);
    } else {
      console.log('❌ Migration failed:', result.error);
    }

    console.log('\n🔍 Step 2: Testing individual question format...');
    // You can replace this with an actual question ID from your database
    const testResult = await testMigrationOnSingleQuestion('bb7ada1a-bda4-419e-9a61-488c5b6345d9');
    
    if (testResult.success) {
      console.log('✅ Individual test successful');
    } else {
      console.log('❌ Individual test failed:', testResult.error);
    }

    console.log('\n🎉 Migration testing completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Check your Supabase questions table');
    console.log('2. Verify the new answer_options structure');
    console.log('3. Test the enhanced question component in your app');
    console.log('4. Add explanations to questions as needed');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Uncomment to test rollback functionality
// async function testRollback() {
//   console.log('⚠️  TESTING MIGRATION ROLLBACK\n');
//   const result = await rollbackQuestionMigration();
//   if (result.success) {
//     console.log(`✅ Rollback successful: ${result.rolledBackCount} questions`);
//   } else {
//     console.log('❌ Rollback failed:', result.error);
//   }
// }

// Run the test
testMigration();
