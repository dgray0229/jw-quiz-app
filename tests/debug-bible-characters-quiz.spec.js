const { test, expect } = require('@playwright/test');

test('debug Bible Characters quiz scoring issue', async ({ page }) => {
  // Enable all console logging
  page.on('console', msg => {
    console.log(`[Browser ${msg.type()}] ${msg.text()}`);
  });
  
  // Navigate to the app
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('\n=== Debugging Bible Characters Quiz ===\n');
  
  // Navigate to Categories
  const categoriesTab = page.locator('[role="tab"]').filter({ hasText: 'Categories' });
  await categoriesTab.click();
  await page.waitForTimeout(2000);
  
  // Take screenshot of categories
  await page.screenshot({ path: 'tests/screenshots/categories-page.png', fullPage: true });
  
  // Look for Bible Characters category
  const bibleCharactersCard = page.locator('text="Bible Characters"').first();
  const hasBibleCharacters = await bibleCharactersCard.isVisible().catch(() => false);
  
  if (!hasBibleCharacters) {
    console.log('Bible Characters category not found, trying first available category...');
    // Click on first category card (avoiding the search bar)
    const categoryCards = page.locator('[style*="backgroundColor"]').filter({ hasText: /\w+/ });
    await categoryCards.first().click();
  } else {
    console.log('Found Bible Characters category!');
    await bibleCharactersCard.click();
  }
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tests/screenshots/quiz-list.png', fullPage: true });
  
  // Click on first quiz
  const quizCards = page.locator('[style*="backgroundColor"]').filter({ hasText: /Quiz|Lesson/ });
  const firstQuiz = quizCards.first();
  const quizText = await firstQuiz.textContent();
  console.log(`Clicking on quiz: ${quizText}`);
  await firstQuiz.click();
  
  await page.waitForTimeout(3000);
  
  // Answer all questions in the quiz
  let questionCount = 0;
  const maxQuestions = 10;
  
  while (questionCount < maxQuestions) {
    // Check if we're on a question
    const questionIndicator = page.locator('text=/Question \\d+ of \\d+/');
    if (!await questionIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('No more questions');
      break;
    }
    
    questionCount++;
    const questionText = await questionIndicator.textContent();
    console.log(`\n--- ${questionText} ---`);
    
    // Get the question content
    const questionContent = await page.locator('h2, h3, [style*="fontSize"][style*="18"]').first().textContent();
    console.log(`Question: ${questionContent}`);
    
    // Take screenshot of the question
    await page.screenshot({ 
      path: `tests/screenshots/question-${questionCount}.png`, 
      fullPage: true 
    });
    
    // Get all answer options
    const answerButtons = page.locator('button[mode="contained"]');
    const answerCount = await answerButtons.count();
    
    // Log all answers
    const answers = [];
    for (let i = 0; i < answerCount; i++) {
      const text = await answerButtons.nth(i).textContent();
      answers.push({ index: i, text: text.trim() });
    }
    console.log('Available answers:', answers);
    
    // For known questions, select the correct answer
    let selectedIndex = 0;
    
    // Bible Characters specific answers
    if (questionContent.includes('Daniel') || questionContent.includes('lions')) {
      selectedIndex = answers.findIndex(a => a.text.includes('Daniel'));
    } else if (questionContent.includes('Rahab') || questionContent.includes('spies')) {
      selectedIndex = answers.findIndex(a => a.text.includes('Rahab'));
    } else if (questionContent.includes('Hannah') || questionContent.includes('Samuel')) {
      selectedIndex = answers.findIndex(a => a.text.includes('Hannah'));
    } else if (questionContent.includes('Timothy') || questionContent.includes('grandmother')) {
      selectedIndex = answers.findIndex(a => a.text.includes('Lois'));
    } else if (questionContent.includes('Esther') || questionContent.includes('queen')) {
      selectedIndex = answers.findIndex(a => a.text.includes('Esther'));
    }
    
    // If we found a match, use it, otherwise use first answer
    if (selectedIndex === -1) selectedIndex = 0;
    
    console.log(`Selecting answer ${selectedIndex}: "${answers[selectedIndex].text}"`);
    await answerButtons.nth(selectedIndex).click();
    
    await page.waitForTimeout(1000);
    
    // Navigate to next question or submit
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
  
  // Wait for results
  console.log('\n=== Waiting for Results ===');
  await page.waitForTimeout(5000);
  
  // Take screenshot of results
  await page.screenshot({ path: 'tests/screenshots/quiz-results.png', fullPage: true });
  
  // Check the score
  const scoreText = await page.locator('text=/Your Score:.*%/').textContent().catch(() => 'Score not found');
  console.log(`\nFinal Score Display: ${scoreText}`);
  
  // Check what the results page shows for each answer
  const resultCards = page.locator('text="Correct answer!"');
  const correctCount = await resultCards.count();
  console.log(`Results page shows ${correctCount} correct answers`);
  
  const incorrectCards = page.locator('text="Incorrect answer"');
  const incorrectCount = await incorrectCards.count();
  console.log(`Results page shows ${incorrectCount} incorrect answers`);
  
  // Scroll through results to capture all answers
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tests/screenshots/quiz-results-full.png', fullPage: true });
  
  console.log('\n=== Analysis ===');
  console.log('If the score shows 0% but all answers show as "Correct answer!", then:');
  console.log('1. The scoring calculation is using one logic');
  console.log('2. The display is using different logic');
  console.log('3. There may be a data format mismatch between categories');
});