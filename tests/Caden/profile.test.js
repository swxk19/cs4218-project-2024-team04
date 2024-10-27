import { test, expect } from '@playwright/test';
import dotenv from "dotenv";
import { hashPassword } from "../../helpers/authHelper.js";
import mongoose from 'mongoose';

dotenv.config({ path: '.env.test' });

const sampleUser = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: await hashPassword('examplePassword'),
    phone: '1234567890',
    address: '1 Computing Drive',
    answer: 'blue',
};

const updatedUser = {
    name: 'John Doe 2',
    password: 'newPassword',
    address: '2 Computing Drive',
}


test.beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URL);
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('users').insertOne(sampleUser);
});

test.afterEach(async () => {
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.close();
});

const loginAction = async (page, email, password) => {
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Enter Your Email ').fill(email);
    await page.getByPlaceholder('Enter Your Password').click();
    await page.getByPlaceholder('Enter Your Password').fill(password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
}

const navigateToDashboard = async (page, name) => {
    await page.getByRole('button', { name: name.toUpperCase() }).click();
    await page.getByText('DASHBOARD').click();
    await page.getByRole('heading', { name: 'Dashboard' });
}

test('should login the user, update profile details (including valid password), logout and login with new password, then check new details', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Login
    await page.getByRole('link', { name: 'Login' }).click();
    await loginAction(page, sampleUser.email, 'examplePassword')
    await navigateToDashboard(page, sampleUser.name);

    // Update profile including new valid password
    await page.click('text=Profile');
    await page.getByPlaceholder('Enter Your Name').fill(updatedUser.name);
    await page.getByPlaceholder('Enter Your Address').fill(updatedUser.address);
    await page.getByPlaceholder('Enter Your Password').fill(updatedUser.password);
    await page.getByRole('button', { name: 'UPDATE' }).click();
    await page.getByRole('button', { name: updatedUser.name.toUpperCase() }).click();

    // Logout
    await page.getByText('LOGOUT').click();

    // Login with new password
    await loginAction(page, sampleUser.email, updatedUser.password);
    await navigateToDashboard(page, updatedUser.name);

    // Check new details
    await expect(page.getByRole('heading', { name: updatedUser.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: sampleUser.email })).toBeVisible();
    await expect(page.getByRole('heading', { name: updatedUser.address })).toBeVisible();
});

test('should login the user, update profile details (including invalid password), receive an error, logout and login with new password but fail', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Login
    await page.getByRole('link', { name: 'Login' }).click();
    await loginAction(page, sampleUser.email, 'examplePassword')
    await navigateToDashboard(page, sampleUser.name);
    await page.click('text=Profile');

    // Update profile including invalid password
    await page.getByPlaceholder('Enter Your Password').fill('123');
    await page.getByRole('button', { name: 'UPDATE' }).click();

    // Expect error message to appear
    await expect(page.getByText('Password is required and 6 character long')).toBeVisible();

    // Logout
    await page.getByRole('button', { name: sampleUser.name.toUpperCase() }).click();
    await page.getByText('LOGOUT').click();

    // Login with new password but fail
    await loginAction(page, sampleUser.email, '123');
    await expect(page.getByText('Invalid Password')).toBeVisible();
});
