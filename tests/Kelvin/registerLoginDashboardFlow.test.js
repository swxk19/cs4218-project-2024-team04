import { test, expect } from '@playwright/test'
import { populateDatabase } from '../../test-db-utils/populateDatabase.js'
import { cleanupDatabase } from '../../test-db-utils/cleanupDatabase.js'

test.beforeEach(async () => {
    await populateDatabase()
})

test.afterEach(async () => {
    await cleanupDatabase()
})

test('should register a new user, log in, and view dashboard', async ({ page }) => {
    const uniqueEmail = `john.doe.${Math.floor(Math.random() * 10000)}@example.com`

    await page.goto('http://localhost:3000/')
    await page.click('a[href="/register"]')

    await page.fill('#exampleInputName1', 'John Doe')
    await page.fill('#exampleInputEmail1', uniqueEmail)
    await page.fill('#exampleInputPassword1', 'Password123!')
    await page.fill('#exampleInputPhone1', '1234567890')
    await page.fill('#exampleInputaddress1', '123 Main St, Springfield')
    await page.fill('#exampleInputDOB1', '1990-01-01')
    await page.fill('#exampleInputanswer1', 'Football')

    await page.click('button:has-text("REGISTER")')

    // Wait for the registration toast message and check its content
    const registrationToastLocator = page.locator('div[role="status"]');
    await expect(registrationToastLocator).toHaveText('Register Successfully, please login');

    // Verify redirection to the login page
    await expect(page).toHaveURL(/\/login/)

    await page.fill('#exampleInputEmail1', uniqueEmail)
    await page.fill('#exampleInputPassword1', 'Password123!')

    await page.click('button:has-text("Login")')

    // Verify that the user is redirected to the homepage
    await expect(page).toHaveURL(/^\w+:\/\/[^\/]+\/$/)

    // Click on the user dropdown and navigate to the dashboard
    await page.click(`nav .nav-link.dropdown-toggle:has-text("John Doe")`)
    await page.click('a.dropdown-item:has-text("Dashboard")')

    // Verify that the user is on the dashboard page
    await expect(page).toHaveURL(/\/dashboard\/.*/)

    // Verify user details on the dashboard
    const nameLocator = page.locator('h3').nth(0)
    const emailLocator = page.locator('h3').nth(1)
    const addressLocator = page.locator('h3').nth(2)

    await expect(nameLocator).toHaveText('John Doe')
    await expect(emailLocator).toHaveText(uniqueEmail)
    await expect(addressLocator).toHaveText('123 Main St, Springfield')
})
