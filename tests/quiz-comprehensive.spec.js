const { test, expect } = require('@playwright/test');

test.describe('Comprehensive Quiz Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('quiz answer order remains stable during selection', async ({ page }) => {
    // Navigate to a quiz
    await page.click('text="Dashboard"');
    await page.waitForTimeout(1000);
    
    // Click on first category
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(1000);
    
    // Click on first quiz
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(2000);
    
    // Wait for question to load
    await page.waitForSelector('text="Question 1 of"');
    
    // Test answer stability across multiple questions
    for (let questionNum = 1; questionNum <= 3; questionNum++) {
      console.log(`Testing question ${questionNum}`);
      
      // Capture initial answer options
      const initialAnswers = await page.locator('[role="button"][mode="contained"]').allTextContents();
      console.log(`Question ${questionNum} - Initial answers:`, initialAnswers);
      
      // Select different answers and verify order doesn't change
      for (let answerIndex = 0; answerIndex < Math.min(initialAnswers.length, 2); answerIndex++) {
        // Click on answer
        await page.locator('[role="button"][mode="contained"]').nth(answerIndex).click();
        await page.waitForTimeout(300);
        
        // Verify order hasn't changed
        const currentAnswers = await page.locator('[role="button"][mode="contained"]').allTextContents();
        expect(currentAnswers).toEqual(initialAnswers);
        console.log(`  After selecting answer ${answerIndex + 1}: Order stable ✓`);
      }
      
      // Move to next question if not last
      const nextButton = await page.locator('text="Next"');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      } else {
        break;
      }
    }
  });

  test('complete quiz with score calculation', async ({ page }) => {
    // Navigate to a quiz
    await page.click('text="Dashboard"');
    await page.waitForTimeout(1000);
    
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(1000);
    
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(2000);
    
    let questionCount = 0;
    const answersSelected = [];
    
    // Answer all questions
    while (true) {
      questionCount++;
      
      // Get question text
      const questionText = await page.locator('text=/Question \\d+ of/').textContent();
      console.log(questionText);
      
      // Get all answers
      const answers = await page.locator('[role="button"][mode="contained"]').allTextContents();
      
      // Select first answer
      const selectedIndex = 0;
      await page.locator('[role="button"][mode="contained"]').nth(selectedIndex).click();
      answersSelected.push({
        question: questionCount,
        selectedIndex: selectedIndex,
        answerText: answers[selectedIndex]
      });
      
      await page.waitForTimeout(500);
      
      // Check for navigation buttons
      const nextButton = page.locator('text="Next"');
      const submitButton = page.locator('text="Submit Quiz"');
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        break;
      } else if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Wait for results
    await page.waitForSelector('text="Quiz Complete!"', { timeout: 10000 });
    
    // Verify score display
    const scoreElement = await page.locator('text=/Your Score:.*%/');
    expect(await scoreElement.isVisible()).toBeTruthy();
    
    const scoreText = await scoreElement.textContent();
    console.log('Final score:', scoreText);
    console.log('Total questions answered:', questionCount);
    console.log('Answers selected:', answersSelected);
    
    // Verify score is a valid percentage
    const scoreMatch = scoreText.match(/(\d+)%/);
    expect(scoreMatch).toBeTruthy();
    const scorePercent = parseInt(scoreMatch[1]);
    expect(scorePercent).toBeGreaterThanOrEqual(0);
    expect(scorePercent).toBeLessThanOrEqual(100);
  });

  test('navigation preserves answer selections', async ({ page }) => {
    // Navigate to a quiz
    await page.click('text="Dashboard"');
    await page.waitForTimeout(1000);
    
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(1000);
    
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(2000);
    
    // Answer first question
    const firstQuestionAnswers = await page.locator('[role="button"][mode="contained"]').allTextContents();
    await page.locator('[role="button"][mode="contained"]').nth(1).click(); // Select second answer
    await page.waitForTimeout(500);
    
    // Go to next question
    await page.click('text="Next"');
    await page.waitForTimeout(1000);
    
    // Answer second question
    const secondQuestionAnswers = await page.locator('[role="button"][mode="contained"]').allTextContents();
    await page.locator('[role="button"][mode="contained"]').nth(2).click(); // Select third answer
    await page.waitForTimeout(500);
    
    // Go back to first question
    await page.click('text="Previous"');
    await page.waitForTimeout(1000);
    
    // Verify first question still shows same answers in same order
    const firstQuestionAnswersAfterNav = await page.locator('[role="button"][mode="contained"]').allTextContents();
    expect(firstQuestionAnswersAfterNav).toEqual(firstQuestionAnswers);
    
    // TODO: Check if the correct answer is still selected (would need to check button styles)
    
    // Go forward again
    await page.click('text="Next"');
    await page.waitForTimeout(1000);
    
    // Verify second question still shows same answers
    const secondQuestionAnswersAfterNav = await page.locator('[role="button"][mode="contained"]').allTextContents();
    expect(secondQuestionAnswersAfterNav).toEqual(secondQuestionAnswers);
  });

  test('exit confirmation dialog works correctly', async ({ page }) => {
    // Navigate to a quiz
    await page.click('text="Dashboard"');
    await page.waitForTimeout(1000);
    
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(1000);
    
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(2000);
    
    // Try to exit without answering - should not show dialog
    await page.locator('[aria-label*="arrow-left"]').click();
    await page.waitForTimeout(500);
    
    // Should be back at quiz list
    expect(await page.locator('text="Select a Quiz"').isVisible()).toBeTruthy();
    
    // Go back into quiz
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(2000);
    
    // Answer a question
    await page.locator('[role="button"][mode="contained"]').first().click();
    await page.waitForTimeout(500);
    
    // Try to exit - should show dialog
    await page.locator('[aria-label*="arrow-left"]').click();
    await page.waitForTimeout(500);
    
    // Check for exit dialog
    const dialogVisible = await page.locator('text="Exit Quiz?"').isVisible();
    expect(dialogVisible).toBeTruthy();
    
    // Cancel exit
    await page.click('text="Continue Quiz"');
    await page.waitForTimeout(500);
    
    // Should still be in quiz
    expect(await page.locator('text="Question 1 of"').isVisible()).toBeTruthy();
    
    // Try to exit again and confirm
    await page.locator('[aria-label*="arrow-left"]').click();
    await page.waitForTimeout(500);
    await page.click('text="Exit"');
    await page.waitForTimeout(1000);
    
    // Should be back at quiz list
    expect(await page.locator('text="Select a Quiz"').isVisible()).toBeTruthy();
  });

  test('submit button appears only when all questions answered', async ({ page }) => {
    // Navigate to a quiz
    await page.click('text="Dashboard"');
    await page.waitForTimeout(1000);
    
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(1000);
    
    await page.locator('[role="button"]').first().click();
    await page.waitForTimeout(2000);
    
    // Initially, submit button should not be visible
    let submitButton = page.locator('text="Submit Quiz"');
    expect(await submitButton.isVisible()).toBeFalsy();
    
    // Answer questions until we see either Submit or no more Next
    let hasMoreQuestions = true;
    while (hasMoreQuestions) {
      // Answer current question
      await page.locator('[role="button"][mode="contained"]').first().click();
      await page.waitForTimeout(500);
      
      const nextButton = page.locator('text="Next"');
      submitButton = page.locator('text="Submit Quiz"');
      
      if (await submitButton.isVisible()) {
        // We've answered all questions
        hasMoreQuestions = false;
      } else if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      } else {
        hasMoreQuestions = false;
      }
    }
    
    // Submit button should now be visible
    expect(await submitButton.isVisible()).toBeTruthy();
  });
});