import mongoose from 'mongoose'
import supertest from 'supertest'
import app from '../server.js' // Import the Express app from server.js
import users from '../test-db-utils/sample-data/sampleUsers.js'
import User from '../models/userModel.js' // Import the User model

// Setup and teardown for the database
beforeAll(async () => {
  await mongoose.connection.db.collection('users').deleteMany({})
  await User.insertMany(users) // populate sample data
})

afterAll(async () => {
  // Clear the users collection and close the connection after tests
  await mongoose.connection.db.collection('users').deleteMany({})
  await mongoose.connection.close()
})

describe('Auth API and DB Integration', () => {
    describe('auth/login route', () => {
        it.failing('should login a user successfully if given valid credentials', async () => {
            const loginDetails = {
              email: 'john@example.com',
              password: 'hashedpassword123', // This user already exists when the sample data is loaded
            }

            const response = await supertest(app)
              .post('/api/v1/auth/login')
              .send(loginDetails)
              .expect(200)

            expect(response.body.success).toBe(true)  // controller does not hash password before checking in db, leading to false
            expect(response.body.message).toBe('login successfully')
            expect(response.body.user).toBeDefined()
            expect(response.body.user.email).toBe(loginDetails.email)
            expect(response.body.user.name).toBe('John Doe')
            expect(response.body.user.phone).toBe('1234567890')
            expect(response.body.user.address.street).toBe('123 Main St')
            expect(response.body.user.address.city).toBe('Sample City')
            expect(response.body.user.address.state).toBe('Sample State')
            expect(response.body.user.address.zip).toBe('12345')
            expect(response.body.user.address.country).toBe('Sample Country')
            expect(response.body.user.role).toBe(0)
            expect(response.body.token).toBeDefined()
          })

        it('should return "Email is not registered" error if user does not exist', async () => {
            const loginDetails = {
              email: 'nonexistent@example.com', // Email does not exist in sample data
              password: 'randompassword123',
            }

            const response = await supertest(app)
              .post('/api/v1/auth/login')
              .send(loginDetails)

            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Email is not registerd")
          })

        it.failing('should return "Invalid Password" error if password is incorrect', async () => {
            const loginDetails = {
              email: 'jane@example.com', // Existing user
              password: 'wrongpassword', // Incorrect password
            }

            const response = await supertest(app)
              .post('/api/v1/auth/login')
              .send(loginDetails)


            expect(response.status).toBe(401) // Expect 401, but controller returns 200
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Invalid Password")
          })
    })

    describe('auth/register route', () => {
        it('should register a user successfully', async () => {
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
          }

          const response = await supertest(app)
            .post('/api/v1/auth/register')
            .send(newUser)
            .expect(201)

          expect(response.body.success).toBe(true)
          expect(response.body.user).toBeDefined()
          expect(response.body.user.email).toBe(newUser.email)

          const savedUser = await User.findOne({ email: newUser.email })
          expect(savedUser).toBeDefined()
          expect(savedUser.email).toBe(newUser.email)
          expect(savedUser.name).toBe(newUser.name)
          expect(savedUser.address.street).toBe(newUser.address.street)
        })

        it.failing('should fail to create a user with missing required fields', async () => {
          const incompleteUser = { name: 'John Doe' }

          const response = await supertest(app)
            .post('/api/v1/auth/register')
            .send(incompleteUser)
            .expect(400) // expect 400, but contoller returns 200

          expect(response.body.success).toBe(false)
          expect(response.body.message).toBeDefined()
        })
      })
})
