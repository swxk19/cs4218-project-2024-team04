// tests/register.test.cjs
import { test, expect } from '@playwright/test'
import { populateDatabase } from '../../test-db-utils/populateDatabase.js'
import { cleanupDatabase } from '../../test-db-utils/cleanupDatabase.js'

test.beforeEach(async () => {
  await populateDatabase()
})

test.afterEach(async () => {
  await cleanupDatabase()
})

test('should register a new user successfully and redirect to login page', async ({ page }) => {
  const uniqueEmail = `john.doe.${Math.floor(Math.random() * 10000)}@example.com`

  // Navigate to the homepage first
  await page.goto('http://localhost:3000/')

  // Click the registration link (update the selector as needed)
  await page.click('a[href="/register"]') // Use the href attribute to find the registration link

  // Fill out the registration form
  await page.fill('#exampleInputName1', 'John Doe')
  await page.fill('#exampleInputEmail1', uniqueEmail)
  await page.fill('#exampleInputPassword1', 'Password123!')
  await page.fill('#exampleInputPhone1', '1234567890')
  await page.fill('#exampleInputaddress1', '123 Main St, Springfield')
  await page.fill('#exampleInputDOB1', '1990-01-01')
  await page.fill('#exampleInputanswer1', 'Football')

  // Submit the registration form
  await page.click('button:has-text("REGISTER")')

  // Check for success toast message
  const toastLocator = page.locator('[role="status"]')
  await expect(toastLocator).toContainText('Register Successfully, please login')

  // Verify redirection to the login page
  await expect(page).toHaveURL(/\/login/)

  // Verify the login form title
  await expect(page.locator('h4.title')).toHaveText('LOGIN FORM')
})
