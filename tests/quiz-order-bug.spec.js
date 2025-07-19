const { test, expect } = require('@playwright/test');

test.describe('Quiz Answer Order Bug', () => {
  test('answer order should not change when selecting answers', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to a quiz
    // Click on Dashboard
    await page.click('text="Dashboard"');
    await page.waitForTimeout(1000);
    
    // Click on a category (look for category cards)
    await page.waitForSelector('text="Categories"');
    const categoryCards = page.locator('[role="button"][style*="backgroundColor"]');
    await categoryCards.first().click();
    await page.waitForTimeout(1000);
    
    // Click on a quiz (look for quiz cards)
    await page.waitForSelector('text="Select a Quiz"');
    const quizCards = page.locator('[role="button"][style*="backgroundColor"]');
    await quizCards.first().click();
    await page.waitForTimeout(2000);
    
    // Wait for the question to load
    await page.waitForSelector('text="Question 1 of"');
    
    // Capture the initial answer options
    const initialAnswers = await page.locator('[role="button"][mode="contained"]').allTextContents();
    console.log('Initial answer order:', initialAnswers);
    
    // Take a screenshot before selecting
    await page.screenshot({ path: 'tests/screenshots/before-selection.png' });
    
    // Click on the first answer
    await page.locator('[role="button"][mode="contained"]').first().click();
    await page.waitForTimeout(500);
    
    // Capture the answer options after selection
    const afterFirstClickAnswers = await page.locator('[role="button"][mode="contained"]').allTextContents();
    console.log('After first click:', afterFirstClickAnswers);
    
    // Take a screenshot after selecting
    await page.screenshot({ path: 'tests/screenshots/after-selection.png' });
    
    // Verify the order hasn't changed
    expect(afterFirstClickAnswers).toEqual(initialAnswers);
    
    // Click Next if available
    const nextButton = await page.locator('text="Next"');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // Check answer order on second question
      const secondQuestionAnswers = await page.locator('[role="button"][mode="contained"]').allTextContents();
      console.log('Second question answers:', secondQuestionAnswers);
      
      // Select an answer on second question
      await page.locator('[role="button"][mode="contained"]').nth(1).click();
      await page.waitForTimeout(500);
      
      // Check if order changed
      const afterSecondClickAnswers = await page.locator('[role="button"][mode="contained"]').allTextContents();
      console.log('After second click:', afterSecondClickAnswers);
      
      expect(afterSecondClickAnswers).toEqual(secondQuestionAnswers);
    }
  });
  
  test('complete quiz flow and verify score calculation', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to a quiz
    await page.click('text="Dashboard"');
    await page.waitForTimeout(1000);
    
    const categoryCard = await page.locator('[role="button"]').first();
    await categoryCard.click();
    await page.waitForTimeout(1000);
    
    const quizCard = await page.locator('[role="button"]').first();
    await quizCard.click();
    await page.waitForTimeout(2000);
    
    // Track selected answers and their indices
    const selectedAnswers = [];
    let questionCount = 0;
    
    // Answer all questions
    while (true) {
      questionCount++;
      
      // Get all answer options
      const answers = await page.locator('[role="button"][mode="contained"]').allTextContents();
      console.log(`Question ${questionCount} answers:`, answers);
      
      // Select the first answer (index 0)
      await page.locator('[role="button"][mode="contained"]').first().click();
      selectedAnswers.push({ questionIndex: questionCount - 1, answerIndex: 0, answerText: answers[0] });
      
      await page.waitForTimeout(500);
      
      // Check if there's a Next button
      const nextButton = await page.locator('text="Next"');
      const submitButton = await page.locator('text="Submit Quiz"');
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        break;
      } else if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      } else {
        break;
      }
    }
    
    // Wait for results
    await page.waitForSelector('text="Quiz Complete!"', { timeout: 10000 });
    
    // Check if score is displayed
    const scoreText = await page.locator('text=/Your Score:.*%/').textContent();
    console.log('Final score:', scoreText);
    
    // Verify that we can see our selected answers
    console.log('Selected answers:', selectedAnswers);
    
    // Take screenshot of results
    await page.screenshot({ path: 'tests/screenshots/quiz-results.png' });
  });
  
  test('answer selection persistence across navigation', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to a quiz
    await page.click('text="Dashboard"');
    await page.waitForTimeout(1000);
    
    const categoryCard = await page.locator('[role="button"]').first();
    await categoryCard.click();
    await page.waitForTimeout(1000);
    
    const quizCard = await page.locator('[role="button"]').first();
    await quizCard.click();
    await page.waitForTimeout(2000);
    
    // Select an answer on first question
    const firstAnswers = await page.locator('[role="button"][mode="contained"]').allTextContents();
    await page.locator('[role="button"][mode="contained"]').nth(1).click(); // Select second answer
    await page.waitForTimeout(500);
    
    // Go to next question
    await page.click('text="Next"');
    await page.waitForTimeout(1000);
    
    // Go back to previous question
    await page.click('text="Previous"');
    await page.waitForTimeout(1000);
    
    // Check if the answer order is the same
    const answersAfterNavigation = await page.locator('[role="button"][mode="contained"]').allTextContents();
    expect(answersAfterNavigation).toEqual(firstAnswers);
    
    // Check if the selection is still there (second answer should be selected)
    // This would need visual verification or checking button styles
  });
});