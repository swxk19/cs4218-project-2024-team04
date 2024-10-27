import { test, expect } from '@playwright/test'
import { populateDatabase } from '../../test-db-utils/populateDatabase.js'
import { cleanupDatabase } from '../../test-db-utils/cleanupDatabase.js'

test.beforeEach(async () => {
    await populateDatabase()
})

test.afterEach(async () => {
    await cleanupDatabase()
})

test('create new category as admin user', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await page.click('a[href="/login"]')
    await page.locator('input[type="email"]').fill('admin@admin.com')
    await page.locator('input[type="password"]').fill('admin')
    await page.click('button:has-text("Login")')

    await expect(page).toHaveURL('/')
    await page.getByText('Admin User').click()
    await page.getByText('Dashboard').click()
    await expect(page).toHaveURL('/dashboard/admin')

    await page.getByText('Create Category').click()
    await expect(page).toHaveURL('/dashboard/admin/create-category')

    // Wait for existing categories to load
    await page.getByRole('cell', { name: 'Books' }).waitFor({ state: 'visible' })

    const newCategoryName = 'NewCategory'
    await page.getByPlaceholder('Enter new category').fill(newCategoryName)
    await page.getByText('Submit').click()

    const specificToast = page
        .locator('[role="status"]')
        .filter({ hasText: `${newCategoryName} is created` })
    await expect(specificToast).toBeVisible()
    await expect(page.getByRole('cell', { name: newCategoryName })).toBeVisible()
})
