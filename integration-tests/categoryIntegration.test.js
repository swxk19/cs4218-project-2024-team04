import mongoose from 'mongoose'
import supertest from 'supertest'
import app from '../server.js'
import User from '../models/userModel.js'
import Category from '../models/categoryModel.js'
import { getSampleUsers } from '../test-db-utils/sample-data/sampleUsers.js'
import categories from '../test-db-utils/sample-data/sampleCategories.js'

describe('Categories CRUD API and DB Integration', () => {
    let adminToken
    let regularUserToken

    // Setup and teardown for the database
    beforeAll(async () => {
        // populate sample data
        await User.deleteMany({})
        const [users, passwordMap] = await getSampleUsers()
        await User.insertMany(users)
        await Category.deleteMany({})
        await Category.insertMany(categories)

        // Login as admin to get JWT token
        const adminLogin = await supertest(app).post('/api/v1/auth/login').send({
            email: 'admin@admin.com',
            password: passwordMap['admin@admin.com'],
        })
        adminToken = adminLogin.body.token

        // Login as regular user to get JWT token
        const userLogin = await supertest(app).post('/api/v1/auth/login').send({
            email: 'john@example.com',
            password: passwordMap['john@example.com'],
        })
        regularUserToken = userLogin.body.token
    })

    afterAll(async () => {
        // Clear the collections and close the connection after tests
        await User.deleteMany({})
        await Category.deleteMany({})
        await mongoose.connection.close()
    })

    describe('POST /api/v1/category/create-category', () => {
        it('should create a new category successfully when admin authenticated', async () => {
            const newCategory = { name: 'NewCategory' }

            const response = await supertest(app)
                .post('/api/v1/category/create-category')
                .set('Authorization', adminToken)
                .set('Content-Type', 'application/json')
                .send(newCategory)
                .expect(201)

            // Check response structure
            expect(response.body.success).toBe(true)
            expect(response.body.message).toBe('new category created')
            expect(response.body.category).toBeDefined()
            expect(response.body.category.name).toBe(newCategory.name)
            expect(response.body.category.slug).toBe(newCategory.name.toLowerCase())
            expect(response.body.category._id).toBeDefined()
            expect(response.body.category.__v).toBeDefined()

            // Verify in database
            const savedCategory = await Category.findById(response.body.category._id)
            expect(savedCategory).toBeDefined()
            expect(savedCategory.name).toBe(newCategory.name)
            expect(savedCategory.slug).toBe(newCategory.name.toLowerCase())
        })

        // Backend returns "200 OK" instead of "409 Conflict", sucess == true
        // instead of false, and misspelled message "Category Already Exisits".
        it.failing('should return "409 Conflict" for duplicate category name', async () => {
            const duplicateCategory = { name: 'Electronics' }

            const response = await supertest(app)
                .post('/api/v1/category/create-category')
                .set('Authorization', adminToken)
                .set('Content-Type', 'application/json')
                .send(duplicateCategory)
                .expect(409) // Expect "409 Conflict" is used for duplicates

            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe('Category Already Exists')
        })

        it('should handle category name with spaces correctly', async () => {
            const categoryWithSpaces = { name: 'New Test   Category' }

            const response = await supertest(app)
                .post('/api/v1/category/create-category')
                .set('Authorization', adminToken)
                .set('Content-Type', 'application/json')
                .send(categoryWithSpaces)
                .expect(201)

            expect(response.body.success).toBe(true)
            expect(response.body.category.name).toBe(categoryWithSpaces.name)
            expect(response.body.category.slug).toBe(
                categoryWithSpaces.name.toLowerCase().replace(/\s+/g, '-')
            )
        })

        // Backend returns "401 Unauthorized" instead which is suppose to be for
        // requests lacking valid authentication credentials rather than for
        // having no permissions.
        it.failing(
            'should return "409 Forbidden" when non-admin user attempts to create category',
            async () => {
                const newCategory = { name: 'New Category' }

                await supertest(app)
                    .post('/api/v1/category/create-category')
                    .set('Authorization', regularUserToken)
                    .set('Content-Type', 'application/json')
                    .send(newCategory)
                    .expect(403)
            }
        )

        // Backend returns "401 Unauthorized" instead which is suppose to be for
        // requests lacking valid authentication credentials rather than for
        // invalid requests.
        it.failing('should return "400 Bad Request" when category name is missing', async () => {
            const invalidCategory = { name: '' }

            const response = await supertest(app)
                .post('/api/v1/category/create-category')
                .set('Authorization', adminToken)
                .set('Content-Type', 'application/json')
                .send(invalidCategory)
                .expect(400)

            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe('Name is required')
        })
    })
})
