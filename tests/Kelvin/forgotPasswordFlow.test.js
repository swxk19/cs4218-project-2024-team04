import { test, expect } from '@playwright/test';

// test is expected to fail as there is no forgot password page
test('user resets the password', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.click('a[href="/login"]')

  await page.click('button:has-text("Forgot Password")');

  await page.fill('#email', 'john@example.com');
  await page.fill('#answer', 'blue');
  await page.fill('#newPassword', 'NewPassword123!');

  await page.click('button:has-text("Reset Password")');

  const toastLocator = page.locator('[role="status"]');
  await expect(toastLocator).toContainText('Password Reset Successfully');

  await expect(page).toHaveURL(/\/login$/);

  await page.fill('#exampleInputEmail1', 'john@example.com') 
  await page.fill('#exampleInputPassword1', 'NewPassword123!') 

  await page.click('button:has-text("Login")')
})
