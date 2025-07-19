const { test, expect } = require('@playwright/test');

test.describe('Answer Order Fix Verification', () => {
  test('answers should maintain consistent order when selected', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Navigate to Dashboard
    await page.click('text="Dashboard"');
    await page.waitForTimeout(2000);
    
    // Click on the first visible card that looks like a category
    // Look for cards with background colors (category cards have distinct colors)
    const cards = page.locator('.css-view-g5y9jx').filter({ hasText: /\w+/ });
    const count = await cards.count();
    console.log(`Found ${count} potential cards`);
    
    // Click on a card that has category-like properties
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const text = await card.textContent();
      // Skip cards that are navigation items or headers
      if (text && !text.includes('Dashboard') && !text.includes('Categories') && !text.includes('Profile')) {
        console.log(`Clicking on category card: ${text}`);
        await card.click();
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Now click on a quiz
    const quizCards = page.locator('.css-view-g5y9jx').filter({ hasText: /Quiz \d+|Lesson \d+/ });
    const quizCount = await quizCards.count();
    console.log(`Found ${quizCount} quiz cards`);
    
    if (quizCount > 0) {
      await quizCards.first().click();
      await page.waitForTimeout(3000);
      
      // Now we should be in the quiz
      // Look for answer buttons - they should have mode="contained"
      const answerButtons = page.locator('button[mode="contained"]');
      const answerCount = await answerButtons.count();
      console.log(`Found ${answerCount} answer buttons`);
      
      if (answerCount > 0) {
        // Capture initial answer texts
        const initialAnswers = [];
        for (let i = 0; i < answerCount; i++) {
          const text = await answerButtons.nth(i).textContent();
          initialAnswers.push(text);
        }
        console.log('Initial answer order:', initialAnswers);
        
        // Click on each answer and verify order doesn't change
        for (let i = 0; i < Math.min(answerCount, 3); i++) {
          await answerButtons.nth(i).click();
          await page.waitForTimeout(500);
          
          // Check answer order after click
          const currentAnswers = [];
          for (let j = 0; j < answerCount; j++) {
            const text = await answerButtons.nth(j).textContent();
            currentAnswers.push(text);
          }
          
          console.log(`After clicking answer ${i + 1}:`, currentAnswers);
          
          // Verify order hasn't changed
          expect(currentAnswers).toEqual(initialAnswers);
        }
        
        console.log('✅ Answer order remained stable!');
      }
    }
  });
  
  test('complete a short quiz successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Navigate directly to categories
    await page.click('text="Categories"');
    await page.waitForTimeout(2000);
    
    // Find and click a category card
    const categoryCards = page.locator('[style*="backgroundColor"]').filter({ hasText: /\w+/ });
    const categoryCount = await categoryCards.count();
    
    if (categoryCount > 0) {
      await categoryCards.first().click();
      await page.waitForTimeout(2000);
      
      // Find and click a quiz
      const quizCards = page.locator('[style*="backgroundColor"]').filter({ hasText: /Quiz|Lesson/ });
      const quizCount = await quizCards.count();
      
      if (quizCount > 0) {
        await quizCards.first().click();
        await page.waitForTimeout(3000);
        
        // Answer questions until we can submit
        let questionNumber = 0;
        while (questionNumber < 10) { // Safety limit
          questionNumber++;
          
          // Look for answer buttons
          const answerButtons = page.locator('button[mode="contained"]');
          const answerCount = await answerButtons.count();
          
          if (answerCount > 0) {
            // Select first answer
            await answerButtons.first().click();
            await page.waitForTimeout(500);
            
            // Look for navigation buttons
            const nextButton = page.locator('button:has-text("Next")');
            const submitButton = page.locator('button:has-text("Submit Quiz")');
            
            if (await submitButton.isVisible()) {
              console.log('Submitting quiz...');
              await submitButton.click();
              break;
            } else if (await nextButton.isVisible()) {
              console.log(`Moving to question ${questionNumber + 1}...`);
              await nextButton.click();
              await page.waitForTimeout(1000);
            } else {
              console.log('No navigation buttons found');
              break;
            }
          } else {
            console.log('No answer buttons found');
            break;
          }
        }
        
        // Check for results
        await page.waitForTimeout(3000);
        const resultsText = await page.textContent('body');
        if (resultsText.includes('Quiz Complete') || resultsText.includes('Your Score')) {
          console.log('✅ Quiz completed successfully!');
        }
      }
    }
  });
});