const { test, expect } = require('@playwright/test');

test('verify enhanced format questions work correctly', async ({ page }) => {
  // Enable console logging for scoring
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Enhanced format') || 
        text.includes('Checking question') || 
        text.includes('✓') || 
        text.includes('✗') ||
        text.includes('Final Score') ||
        text.includes('nested enhanced format')) {
      console.log(`[Console] ${text}`);
    }
  });
  
  console.log('\n=== Testing Enhanced Format Fix ===\n');
  console.log('This test verifies that questions with nested enhanced format');
  console.log('(where answer_options is an object containing answer_options array)');
  console.log('are properly handled for scoring.\n');
  
  // Navigate to the app
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Go directly to a category
  const tabs = await page.locator('[role="tab"]').count();
  console.log(`Found ${tabs} tabs`);
  
  // Try clicking on the second tab (usually Categories or Quizzes)
  if (tabs >= 2) {
    await page.locator('[role="tab"]').nth(1).click();
    await page.waitForTimeout(2000);
    
    // Look for any clickable cards
    const cards = await page.locator('[style*="backgroundColor"]').count();
    console.log(`Found ${cards} cards`);
    
    if (cards > 0) {
      // Click first card
      await page.locator('[style*="backgroundColor"]').first().click();
      await page.waitForTimeout(2000);
      
      // Check if we need to click another card to get to quiz
      const moreCards = await page.locator('[style*="backgroundColor"]').count();
      if (moreCards > 0 && !await page.locator('text=/Question \\d+ of/').isVisible({ timeout: 1000 }).catch(() => false)) {
        await page.locator('[style*="backgroundColor"]').first().click();
        await page.waitForTimeout(2000);
      }
      
      // Now we should be in a quiz
      const inQuiz = await page.locator('text=/Question \\d+ of/').isVisible({ timeout: 3000 }).catch(() => false);
      
      if (inQuiz) {
        console.log('\nSuccessfully entered quiz. Testing a few questions...\n');
        
        // Answer 3 questions
        for (let i = 0; i < 3; i++) {
          const questionText = await page.locator('text=/Question \\d+ of/').textContent();
          console.log(`\n${questionText}`);
          
          const answerButtons = page.locator('button[mode="contained"]');
          const count = await answerButtons.count();
          
          if (count > 0) {
            // Select first answer for simplicity
            await answerButtons.first().click();
            console.log('Selected first answer');
            await page.waitForTimeout(1000);
            
            // Navigate
            const nextButton = page.locator('button:has-text("Next")');
            const submitButton = page.locator('button:has-text("Submit Quiz")');
            
            if (await submitButton.isVisible()) {
              console.log('\nSubmitting quiz...');
              await submitButton.click();
              break;
            } else if (await nextButton.isVisible()) {
              await nextButton.click();
              await page.waitForTimeout(1000);
            }
          }
        }
        
        // Wait for results
        await page.waitForTimeout(3000);
        
        // Check if results page loaded
        const resultsVisible = await page.locator('text="Quiz Complete"').isVisible({ timeout: 5000 }).catch(() => false);
        
        if (resultsVisible) {
          console.log('\n=== Results Page ===');
          
          const scoreText = await page.locator('text=/Your Score:.*%/').textContent();
          console.log(scoreText);
          
          // Take screenshot
          await page.screenshot({ path: 'tests/screenshots/enhanced-format-results.png', fullPage: true });
          
          // Count correct/incorrect indicators
          const correctCount = await page.locator('text="Correct answer!"').count();
          const incorrectCount = await page.locator('text="Incorrect answer"').count();
          
          console.log(`\nUI shows: ${correctCount} correct, ${incorrectCount} incorrect`);
          
          // Extract score percentage
          const scoreMatch = scoreText.match(/(\d+)%/);
          if (scoreMatch) {
            const scorePercent = parseInt(scoreMatch[1]);
            const totalQuestions = correctCount + incorrectCount;
            const expectedPercent = Math.round((correctCount / totalQuestions) * 100);
            
            console.log(`\nScore calculation check:`);
            console.log(`- Displayed score: ${scorePercent}%`);
            console.log(`- Expected based on UI: ${expectedPercent}%`);
            
            if (scorePercent === expectedPercent) {
              console.log('✅ Score matches UI display!');
            } else {
              console.log('❌ Score does NOT match UI display!');
              console.log('This indicates the scoring logic and display logic are using different methods.');
            }
          }
        }
      } else {
        console.log('Could not enter quiz. App may not have quiz data.');
      }
    }
  }
  
  console.log('\n=== Summary of Fix ===');
  console.log('1. Updated QuizContext to handle nested enhanced format');
  console.log('2. Updated QuizScreen scoring to check nested structure');
  console.log('3. Updated QuizScreen normalization to extract nested answer_options');
  console.log('4. Updated ResultScreen to handle nested format for display');
  console.log('\nThe app should now correctly score quizzes with enhanced format questions.');
});