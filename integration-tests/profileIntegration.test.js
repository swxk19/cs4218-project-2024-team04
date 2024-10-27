import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../server.js';
import User from '../models/userModel.js';
import JWT from 'jsonwebtoken';
import {comparePassword} from "../helpers/authHelper.js";

// Create a sample user object to insert into database
const sampleUser = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'mockedHashedPassword',
    phone: '1234567890',
    address: '1 Computing Drive',
    answer: 'blue',
};

let userId;
let jwtToken;

beforeEach(async () => {
    // Delete all users in database
    await mongoose.connection.db.collection('users').deleteMany({});

    // Insert the sample user into the database
    const response = await User.create(sampleUser);
    userId = response._id;

    // Create a JWT token for the user
    jwtToken = await JWT.sign({ _id: response._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
});

afterAll(async () => {
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.close();
});


describe('Profile Update API Test', () => {
    it('should update a user successfully via API', async () => {

        // Create a new user object to update the user
        const newUser = {
            name: 'John Doe 2',
            password: 'newMockedUnhashedPassword',
            phone: '0123456789',
            address: '2 Computing Drive'
        };

        const response = await supertest(app)
            .put('/api/v1/auth/profile')
            .set('Authorization', jwtToken)
            .send(newUser)
            .expect(200);


        // Check the database to see if the user was updated
        const savedUser = await User.findOne({ _id: userId });


        // Assertions to check the user was saved correctly
        expect(response.body.success).toBe(true);
        expect(response.body.updatedUser).toBeDefined();
        expect(savedUser).toBeDefined();
        expect(savedUser.name).toBe(newUser.name);
        expect(savedUser.address).toBe(newUser.address);
        expect(savedUser.phone).toBe(newUser.phone);
        expect(await comparePassword(newUser.password, savedUser.password)).toBe(true);
    });

    it('should fail to update a user with if password is less than 6 characters', async () => {
        const invalidUser = {
            name: 'John Doe 2',
            password: '12345',
            phone: '0123456789',
            address: '2 Computing Drive'
        };

        const response = await supertest(app)
            .put('/api/v1/auth/profile')
            .set('Authorization', jwtToken)
            .send(invalidUser)
            .expect(200);

        // Assertions to check that an error message was returned
        expect(response.body.error).toBe("Password is required and 6 character long");

        // Check the database to see if the user was not updated
        const savedUser = await User.findOne({ _id: userId });

        expect(savedUser).toBeDefined();
        expect(savedUser.name).toBe(sampleUser.name);
        expect(savedUser.address).toBe(sampleUser.address);
        expect(savedUser.phone).toBe(sampleUser.phone);
        expect(savedUser.password).toBe(sampleUser.password);
    });
});
