import { test, expect } from '@playwright/test'
import { populateDatabase } from '../../test-db-utils/populateDatabase.js'
import { cleanupDatabase } from '../../test-db-utils/cleanupDatabase.js'

test.beforeEach(async () => {
    await populateDatabase()
})

test.afterEach(async () => {
    await cleanupDatabase()
})

test('should log in an existing user successfully and view dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await page.click('a[href="/login"]')
    await page.fill('#exampleInputEmail1', 'john@example.com')
    await page.fill('#exampleInputPassword1', 'hashedpassword123')

    await page.click('button:has-text("Login")')

    const toastLocator = page.locator('[role="status"]');
    await expect(toastLocator).toContainText('login successfully');

    await expect(page).toHaveURL(/^\w+:\/\/[^\/]+\/$/)
    await page.click(`nav .nav-link.dropdown-toggle:has-text("John Doe")`)
    await page.click('a.dropdown-item:has-text("Dashboard")')
    await expect(page).toHaveURL(/\/dashboard\/.*/)

    const nameLocator = page.locator('h3').nth(0)
    const emailLocator = page.locator('h3').nth(1)
    const addressLocator = page.locator('h3').nth(2)

    await expect(nameLocator).toHaveText('John Doe')
    await expect(emailLocator).toHaveText('john@example.com')
    await expect(addressLocator).toHaveText('123 Main St, Sample City, Sample State, 12345, Sample Country')
})
