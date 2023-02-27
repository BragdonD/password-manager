const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require('cookie-parser');
if (process.env.NODE_ENV!== 'production') {
    require('dotenv').config({ path: `.env.dev`, override: true });
}

const logout = require("./logout");
const login = require("./login");
const User = require("../../models/User");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Set up session middleware
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
}));

app.use("/", login);
app.use("/", logout);

describe("GET /logout", () => {
    // Connect to MongoDB using Mongoose
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URL_TEST || 'mongodb://localhost/testdb', { useNewUrlParser: true });
    });

    // Disconnect from MongoDB after tests are done
    afterAll(async () => {
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await User.create({
            email: "validemail@example.com",
            name: "Valid User",
            password: "correctpassword",
        });
    });

    test("responds with 200 and success message when user is logged out", async () => {
        // Log in a user by setting a session property
        const agent = request.agent(app);
        await agent
                .post("/login")
                .send({ email: "validemail@example.com", password: "correctpassword" });

        // Make a request to the "/logout" endpoint
        const response = await agent.post("/logout");

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Successfully logged out" });
    });
});

