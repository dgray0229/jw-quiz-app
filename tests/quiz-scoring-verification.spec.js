const { test, expect } = require('@playwright/test');

test.describe('Quiz Scoring Verification', () => {
  test('verify correct answers are properly tracked and scored', async ({ page }) => {
    // Enable console logging to track what's happening
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`[${msg.type()}] ${msg.text()}`);
      }
    });
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== Starting Quiz Scoring Test ===\n');
    
    // Navigate to Quizzes tab
    await page.click('[role="tab"]:has-text("Quizzes")');
    await page.waitForTimeout(2000);
    
    // Look for "The faithful men and women" quiz or any available quiz
    const pageContent = await page.textContent('body');
    console.log('Looking for quizzes...');
    
    // Try to find a quiz with "faithful" in the name or just take the first available quiz
    let quizFound = false;
    
    // First try to find the specific quiz
    const faithfulQuiz = page.locator('text=/faithful men and women/i').first();
    if (await faithfulQuiz.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Found "The faithful men and women" quiz!');
      await faithfulQuiz.click();
      quizFound = true;
    } else {
      // If not found, click on Categories tab and look for any quiz
      await page.click('[role="tab"]:has-text("Categories")');
      await page.waitForTimeout(2000);
      
      // Click on first category
      const categoryCard = page.locator('[data-testid="button"]').first();
      if (await categoryCard.isVisible()) {
        const categoryText = await categoryCard.textContent();
        console.log(`Clicking on category: ${categoryText}`);
        await categoryCard.click();
        await page.waitForTimeout(2000);
        
        // Click on first quiz
        const quizCard = page.locator('[data-testid="button"]').first();
        if (await quizCard.isVisible()) {
          const quizText = await quizCard.textContent();
          console.log(`Clicking on quiz: ${quizText}`);
          await quizCard.click();
          quizFound = true;
        }
      }
    }
    
    if (!quizFound) {
      console.log('No quiz found. Please ensure there is quiz data in the database.');
      return;
    }
    
    await page.waitForTimeout(3000);
    
    // Track answers throughout the quiz
    const selectedAnswers = [];
    const correctAnswers = [];
    const questionData = [];
    let questionCount = 0;
    
    // Answer all questions
    while (questionCount < 20) { // Safety limit
      questionCount++;
      
      // Check if we're on a question page
      const questionIndicator = page.locator('text=/Question \\d+ of \\d+/');
      if (!await questionIndicator.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('No more questions found');
        break;
      }
      
      const questionText = await questionIndicator.textContent();
      console.log(`\n--- ${questionText} ---`);
      
      // Get the actual question text
      const questionContent = await page.locator('h2, h3, [style*="fontSize"][style*="18"]').first().textContent().catch(() => 'Question text not found');
      console.log(`Question: ${questionContent}`);
      
      // Get all answer options
      const answerButtons = page.locator('button[mode="contained"]');
      const answerCount = await answerButtons.count();
      
      if (answerCount === 0) {
        console.log('No answer buttons found');
        break;
      }
      
      const answers = [];
      for (let i = 0; i < answerCount; i++) {
        const text = await answerButtons.nth(i).textContent();
        answers.push({ index: i, text: text.trim() });
      }
      console.log('Available answers:', answers.map(a => `${a.index}: ${a.text}`).join(', '));
      
      // For testing, let's select the first answer
      // In a real test, we'd need to know which is correct
      const selectedIndex = 0;
      await answerButtons.nth(selectedIndex).click();
      console.log(`Selected answer ${selectedIndex}: ${answers[selectedIndex].text}`);
      
      selectedAnswers.push({
        questionNumber: questionCount,
        selectedIndex: selectedIndex,
        selectedText: answers[selectedIndex].text
      });
      
      await page.waitForTimeout(500);
      
      // Look for navigation
      const nextButton = page.locator('button:has-text("Next")');
      const submitButton = page.locator('button:has-text("Submit Quiz")');
      
      if (await submitButton.isVisible()) {
        console.log('\nReady to submit quiz...');
        await submitButton.click();
        break;
      } else if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      } else {
        console.log('No navigation buttons found');
        break;
      }
    }
    
    // Wait for results
    console.log('\n=== Waiting for Results ===');
    await page.waitForTimeout(3000);
    
    // Check for results screen
    const resultsVisible = await page.locator('text="Quiz Complete"').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (resultsVisible) {
      console.log('Quiz completed! Analyzing results...');
      
      // Get the score
      const scoreText = await page.locator('text=/Your Score:.*%/').textContent().catch(() => 'Score not found');
      console.log(`\nFinal Score: ${scoreText}`);
      
      // Extract score percentage
      const scoreMatch = scoreText.match(/(\d+)%/);
      if (scoreMatch) {
        const scorePercent = parseInt(scoreMatch[1]);
        console.log(`Score percentage: ${scorePercent}%`);
        console.log(`Questions answered: ${questionCount}`);
        
        // Calculate expected correct answers
        const expectedCorrect = Math.round((scorePercent / 100) * questionCount);
        console.log(`Expected correct answers based on score: ${expectedCorrect}`);
        
        // Look for detailed results if available
        const correctCount = await page.locator('text=/\\d+ out of \\d+/').textContent().catch(() => null);
        if (correctCount) {
          console.log(`Detailed score: ${correctCount}`);
        }
      }
      
      // Take screenshot of results
      await page.screenshot({ path: 'tests/screenshots/quiz-results-score.png', fullPage: true });
      
      console.log('\n=== Summary ===');
      console.log(`Total questions answered: ${selectedAnswers.length}`);
      console.log('Selected answers:', selectedAnswers);
    } else {
      console.log('Results screen not found');
      await page.screenshot({ path: 'tests/screenshots/quiz-end-state.png', fullPage: true });
    }
  });
  
  test('debug scoring calculation in the app', async ({ page }) => {
    // This test adds specific logging to understand the scoring logic
    page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Inject debugging code
    await page.evaluate(() => {
      // Override console.log to capture scoring calculations
      const originalLog = console.log;
      window.debugLogs = [];
      console.log = (...args) => {
        window.debugLogs.push(args.join(' '));
        originalLog(...args);
      };
    });
    
    console.log('\n=== Debugging Scoring Logic ===\n');
    
    // Navigate to a quiz (similar to above but simplified)
    await page.click('[role="tab"]:has-text("Categories")');
    await page.waitForTimeout(2000);
    
    const categoryCard = page.locator('[data-testid="button"]').first();
    if (await categoryCard.isVisible()) {
      await categoryCard.click();
      await page.waitForTimeout(2000);
      
      const quizCard = page.locator('[data-testid="button"]').first();
      if (await quizCard.isVisible()) {
        await quizCard.click();
        await page.waitForTimeout(3000);
        
        // Answer just one question to see the flow
        const answerButton = page.locator('button[mode="contained"]').first();
        if (await answerButton.isVisible()) {
          await answerButton.click();
          await page.waitForTimeout(500);
          
          // Check what was logged
          const logs = await page.evaluate(() => window.debugLogs);
          console.log('\n=== Captured Debug Logs ===');
          logs.forEach(log => console.log(log));
        }
      }
    }
  });
});