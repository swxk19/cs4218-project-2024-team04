import { test, expect } from '@playwright/test'
import { populateDatabase } from '../../test-db-utils/populateDatabase.js'
import { cleanupDatabase } from '../../test-db-utils/cleanupDatabase.js'

test.beforeEach(async () => {
    await populateDatabase()
})

test.afterEach(async () => {
    await cleanupDatabase()
})

test('log in via cart page, view cart, then log out', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await page.click('a[href="/cart"]')

    // Verify the URL is for the cart page
    await expect(page).toHaveURL(/\/cart/)

    // Click on "Please Login to checkout" button
    await page.click('button:has-text("Plase Login to checkout")')

    // Verify that the URL is the login page
    await expect(page).toHaveURL(/\/login/)

    // Fill in login details
    await page.fill('#exampleInputEmail1', 'jane@example.com') 
    await page.fill('#exampleInputPassword1', 'hashedpassword456') 

    // Submit the login form
    await page.click('button:has-text("Login")')

    // Check for success toast message
    const toastLocator = page.locator('[role="status"]')
    await expect(toastLocator).toContainText('login successfully')

    // Verify redirection back to the cart page
    await expect(page).toHaveURL(/\/cart/)

    await expect(page.locator('h1')).toContainText('Hello  Jane Smith')

    await page.click(`nav .nav-link.dropdown-toggle:has-text("Jane Smith")`)
    await page.click('a.dropdown-item:has-text("Logout")')
    await expect(page).toHaveURL(/\/login/)
})
