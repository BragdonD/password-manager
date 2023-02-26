const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const User = require('../../models/User');

const registerRouter = require('./register').router;

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', registerRouter);


describe('POST /register', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URL_TEST || 'mongodb://localhost/testdb', { useNewUrlParser: true });
    });

    // Remove all users from the database after each test
    afterEach(async () => {
        await User.deleteMany();
    });

    // Close database connection after running all tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('returns 201 and creates a new user when given valid data', async () => {
        // Mock a valid user registration request
        const validUserData = {
            email: 'johndoe@example.com',
            name: 'John Doe',
            password: 'password123',
        };

        // Send the mock request to the app using Supertest
        const response = await request(app)
            .post('/register')
            .send(validUserData);

        console.log(response.body);


        // Expect the response to have a 201 status code and the user data in the body
        expect(response.status).toBe(201);
        expect(response.body.email).toBe(validUserData.email);
        expect(response.body.name).not.toBe(validUserData.name);
        expect(response.body.password).not.toBe(validUserData.password);

        // Check that the user was actually created in the database
        const createdUser = await User.findOne({ email: validUserData.email });
        expect(createdUser.email).toBe(validUserData.email);
        expect(createdUser.name).toBe(validUserData.name);
        expect(createdUser.password).not.toBe(validUserData.password);
    });

    test('returns 400 and validation errors when given invalid data', async () => {
        // Mock an invalid user registration request
        const invalidUserData = {
            email: 'not-an-email',
            name: '',
            password: 'short',
        };

        // Send the mock request to the app using Supertest
        const response = await request(app)
            .post('/register')
            .send(invalidUserData);

        // Expect the response to have a 400 status code and validation errors in the body
        expect(response.status).toBe(400);
        expect(response.body.errors).toHaveLength(3);
        expect(response.body.errors[0].param).toBe('email');
        expect(response.body.errors[1].param).toBe('name');
        expect(response.body.errors[2].param).toBe('password');
    });

    test('returns 400 and error message when given an already registered email', async () => {
        // Mock a user registration request with an email that already exists
        const existingUser = new User({
            email: 'existinguser@example.com',
            name: 'Existing User',
            password: 'password123',
        });
        await existingUser.save();

        const duplicateEmailData = {
            email: existingUser.email,
            name: 'New User',
            password: 'password456',
        };

        // Send the mock request to the app using Supertest
        const response = await request(app)
            .post('/register')
            .send(duplicateEmailData);

        // Expect the response to have a 400 status code and an error message in the body
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email already registered');
    });
});