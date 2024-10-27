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

const sampleCategory = {
    name: "Electronics",
    slug: "electronics",
};

const sampleProduct = {
    name: 'Smartphone',
    slug: 'smartphone',
    description: 'A high-end smartphone',
    price: 10.98,
    quantity: 50,
    shipping: true,
};

const sampleOrder = {
    payment: {
        method: 'credit card',
        transactionId: 'txn_123456789',
        amount: 10.98,
        success: true
    },
    status: 'Processing',
    createdAt: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
};

test.beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_TEST_URL);
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('categories').deleteMany({});
    await mongoose.connection.db.collection('products').deleteMany({});
    await mongoose.connection.db.collection('orders').deleteMany({});

    const user = await mongoose.connection.db.collection('users').insertOne(sampleUser);
    const category = await mongoose.connection.db.collection('categories').insertOne(sampleCategory);
    const product = await mongoose.connection.db.collection('products').insertOne({...sampleProduct, category: category.insertedId});
    await mongoose.connection.db.collection('orders').insertOne({...sampleOrder, buyer: user.insertedId, products: [product.insertedId]});
});

test.afterEach(async () => {
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('categories').deleteMany({});
    await mongoose.connection.db.collection('products').deleteMany({});
    await mongoose.connection.db.collection('orders').deleteMany({});
    await mongoose.connection.close();
});

test('should login the user, navigate to orders, then check if order is correct', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Login
    await page.getByPlaceholder('Enter Your Email ').fill(sampleUser.email);
    await page.getByPlaceholder('Enter Your Password').click();
    await page.getByPlaceholder('Enter Your Password').fill('examplePassword');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: sampleUser.name.toUpperCase() }).click();

    // Navigate to orders
    await page.getByText('DASHBOARD').click();
    await page.getByRole('heading', { name: 'Dashboard' });
    await page.click('text=Orders');

    // Check order details
    const row = page.locator('table tr:has-text("1")');
    await expect(row.locator('td').nth(0)).toHaveText('1'); // #
    await expect(row.locator('td').nth(1)).toHaveText(sampleOrder.status); // Status
    await expect(row.locator('td').nth(2)).toHaveText(sampleUser.name); // Buyer name
    await expect(row.locator('td').nth(3)).toHaveText('a year ago'); // Date
    await expect(row.locator('td').nth(4)).toHaveText('Success'); // Payment status
    await expect(row.locator('td').nth(5)).toHaveText('1'); // Quantity
    await expect(page.getByText(sampleProduct.name, {exact: true})).toBeVisible(); // Product name
    await expect(page.getByText(sampleProduct.description, {exact: true})).toBeVisible(); // Product description
    await expect(page.getByText(sampleProduct.price, {exact: true})).toBeVisible(); // Product price
});
