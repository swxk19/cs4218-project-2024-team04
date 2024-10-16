import mongoose from 'mongoose';
import supertest from 'supertest';
import dotenv from 'dotenv';
import app from '../server.js'; // Import the Express app from server.js
import users from '../test-db-utils/sample-data/sampleUsers.js';
import User from '../models/userModel.js'; // Import the User model

dotenv.config({ path: '.env.test' }); // Load environment variables from .env.test

// Setup and teardown for the database
beforeAll(async () => {
  await mongoose.connection.db.collection('users').deleteMany({});
  await User.insertMany(users); // populate sample data
});

afterAll(async () => {
  // Clear the users collection and close the connection after tests
  await mongoose.connection.db.collection('users').deleteMany({});
  await mongoose.connection.close();
});

describe('User API Test', () => {
  it('should create and save a user successfully via API', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
      phone: '1234567890',
      address: {
        street: '123 Main St',
        city: 'New York',
        zip: '10001'
      },
      answer: 'blue',
    };

    const response = await supertest(app)
      .post('/api/v1/auth/register') // Adjust the endpoint to match your routes
      .send(newUser)
      .expect(201); // Expect HTTP status 201 (Created)

    // Assertions to check the user was saved correctly
    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(newUser.email);

    // Check the database to see if the user was created
    const savedUser = await User.findOne({ email: newUser.email });
    expect(savedUser).toBeDefined(); // Ensure the user exists in the database
    expect(savedUser.email).toBe(newUser.email); // Ensure the email matches
    expect(savedUser.name).toBe(newUser.name); // Ensure the name matches
    expect(savedUser.address.street).toBe(newUser.address.street);
  });

  it.failing('should fail to create a user with missing required fields via API', async () => {
    const incompleteUser = { name: 'John Doe' }; // Missing required fields

    const response = await supertest(app)
      .post('/api/v1/auth/register') // Adjust the endpoint to match your routes
      .send(incompleteUser)
      .expect(400); // Expect HTTP status 400 (Bad Request)

    // Assertions to check that an error message was returned
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBeDefined();
  });
});
