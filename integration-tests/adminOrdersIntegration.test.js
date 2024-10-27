import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../server.js';
import {getSampleUsers} from "../test-db-utils/sample-data/sampleUsers.js";
import orders from "../test-db-utils/sample-data/sampleOrders.js";
import products from "../test-db-utils/sample-data/sampleProducts.js";
import categories from "../test-db-utils/sample-data/sampleCategories.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import JWT from "jsonwebtoken";

let jwtToken;
let testOrderId;

const [users] = await getSampleUsers();

const sampleUser1 = users[0];
const sampleUser2 = users[1];

const sampleOrder1 = orders[0];
const sampleOrder2 = orders[1];

const sampleProduct1 = products[0];
const sampleProduct2 = products[1];

const sampleCategory1 = categories[0];
const sampleCategory2 = categories[1];

beforeEach(async () => {
    // Clear the database and populate it with sample users and orders
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('orders').deleteMany({});
    await mongoose.connection.db.collection('products').deleteMany({});
    await mongoose.connection.db.collection('categories').deleteMany({});

    const category1 = await Category.create(sampleCategory1);
    const adminUser = await User.create(sampleUser1);
    const product1 = await Product.create({...sampleProduct1, category: category1._id});
    await Order.create({...sampleOrder1, buyer: adminUser._id, products: [product1._id], createdAt: new Date('2024-01-01')});

    const category2 = await Category.create(sampleCategory2);
    const normalUser = await User.create(sampleUser2);
    const product2 = await Product.create({...sampleProduct2, category: category2._id});
    const order2 = await Order.create({...sampleOrder2, buyer: normalUser._id, products: [product2._id], createdAt: new Date('2023-01-01')});
    testOrderId = order2._id

    // Create a JWT token for the user
    jwtToken = await JWT.sign({ _id: adminUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
});

afterAll(async () => {
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('orders').deleteMany({});
    await mongoose.connection.db.collection('products').deleteMany({});
    await mongoose.connection.db.collection('categories').deleteMany({});
    await mongoose.connection.close();
});

describe('Admin Orders API Test', () => {
    it('should get all user orders successfully via API', async () => {

        // Get all orders using admin token
        const response = await supertest(app)
            .get('/api/v1/auth/all-orders')
            .set('Authorization', jwtToken)
            .expect(200);

        // Check the response to ensure 2 orders are returned
        expect(response.body).toHaveLength(2);

        // Check the response to ensure the correct data is returned in order
        expect(response.body[0].products).toHaveLength(1);
        expect(response.body[0].products[0].name).toBe(sampleProduct1.name);
        expect(response.body[0].products[0].description).toBe(sampleProduct1.description);
        expect(response.body[0].products[0].price).toBe(sampleProduct1.price);
        expect(response.body[0].buyer.name).toBe(sampleUser1.name);
        expect(response.body[0].status).toBe(sampleOrder1.status);
        expect(response.body[0].payment.success).toBe(sampleOrder1.payment.success);

        expect(response.body[1].products).toHaveLength(1);
        expect(response.body[1].products[0].name).toBe(sampleProduct2.name);
        expect(response.body[1].products[0].description).toBe(sampleProduct2.description);
        expect(response.body[1].products[0].price).toBe(sampleProduct2.price);
        expect(response.body[1].buyer.name).toBe(sampleUser2.name);
        expect(response.body[1].status).toBe(sampleOrder2.status);
        expect(response.body[1].payment.success).toBe(sampleOrder2.payment.success);
    });

    it('should update order status successfully via API', async () => {

        // Update the order status to 'Delivered'
        await supertest(app)
            .put(`/api/v1/auth/order-status/${testOrderId}`)
            .set('Authorization', jwtToken)
            .send({ status: 'Delivered' })
            .expect(200);

        // Check the database to see if the order status was updated
        const updatedOrder = await Order.findById(testOrderId);
        expect(updatedOrder.status).toBe('Delivered');
    });
});
