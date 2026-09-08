import { test, expect } from '@playwright/test';

test.describe('Session Intelligence Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('demo selection screen loads', async ({ page }) => {
    await expect(page.getByText('Choose your experience')).toBeVisible();
    await expect(page.getByText('Control Mode')).toBeVisible();
    await expect(page.getByText('Session Intelligence')).toBeVisible();
  });

  test('control mode session flow', async ({ page }) => {
    // Start control mode
    await page.click('button:has-text("Start Control Demo")');
    
    // Wait for home page
    await expect(page.getByText('Control Mode')).toBeVisible();
    
    // Search for football
    await page.fill('input[aria-label="Search content"]', 'football tonight');
    await page.press('input[aria-label="Search content"]', 'Enter');
    
    // View multiple items
    const cards = page.locator('.card');
    const firstCard = cards.first();
    await firstCard.click();
    
    // Go back
    await page.click('button:has-text("Back to discovery")');
    
    // View another item
    const secondCard = cards.nth(1);
    await secondCard.click();
    
    // Verify no session insight appears (control mode)
    await expect(page.locator('.session-insight')).not.toBeVisible();
  });

  test('intelligent mode session flow', async ({ page }) => {
    // Start intelligent mode
    await page.click('button:has-text("Start Intelligent Demo")');
    
    // Wait for home page
    await expect(page.getByText('Personal workspace')).toBeVisible();
    
    // Search for football
    await page.fill('input[aria-label="Search content"]', 'football tonight');
    await page.press('input[aria-label="Search content"]', 'Enter');
    
    // View multiple items
    const cards = page.locator('.card');
    const firstCard = cards.first();
    await firstCard.click();
    
    // Go back
    await page.click('button:has-text("Back to discovery")');
    
    // View another item
    const secondCard = cards.nth(1);
    await secondCard.click();
    
    // Go back again
    await page.click('button:has-text("Back to discovery")');
    
    // Verify session insight appears after multiple views
    await expect(page.locator('.session-insight')).toBeVisible();
    await expect(page.getByText('Session Insight')).toBeVisible();
    
    // Click explore from session insight
    await page.click('button:has-text("Explore relevant content")');
    
    // Complete an action
    await page.click('button:has-text("Save as a useful next step")');
    
    // Verify action completed
    await expect(page.getByText('Action completed')).toBeVisible();
  });

  test('analytics dashboard loads', async ({ page }) => {
    // Start intelligent mode
    await page.click('button:has-text("Start Intelligent Demo")');
    
    // Navigate to analytics
    await page.click('button:has-text("Session analytics")');
    
    // Verify analytics elements
    await expect(page.getByText('Measure what matters')).toBeVisible();
    await expect(page.getByText('Total sessions')).toBeVisible();
    await expect(page.getByText('Conversion rate')).toBeVisible();
    await expect(page.getByText('CONTROL VS SESSION INTELLIGENCE')).toBeVisible();
  });

  test('content detail view', async ({ page }) => {
    // Start intelligent mode
    await page.click('button:has-text("Start Intelligent Demo")');
    
    // Click first content card
    const firstCard = page.locator('.card').first();
    await firstCard.click();
    
    // Verify detail view
    await expect(page.locator('.detail')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Save as a useful next step')).toBeVisible();
    
    // Go back
    await page.click('button:has-text("Back to discovery")');
    
    // Verify back on discovery page
    await expect(page.locator('.grid')).toBeVisible();
  });

  test('category filtering', async ({ page }) => {
    // Start intelligent mode
    await page.click('button:has-text("Start Intelligent Demo")');
    
    // Click Football filter
    await page.click('button:has-text("Football")');
    
    // Verify filter is active
    const activeFilter = page.locator('button.active');
    await expect(activeFilter).toHaveText('Football');
  });

  test('search functionality', async ({ page }) => {
    // Start intelligent mode
    await page.click('button:has-text("Start Intelligent Demo")');
    
    // Search for basketball
    await page.fill('input[aria-label="Search content"]', 'basketball');
    await page.press('input[aria-label="Search content"]', 'Enter');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    // Verify search worked (check if any cards are visible)
    const cards = page.locator('.card');
    await expect(cards.first()).toBeVisible();
  });
});
