const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser');
if (process.env.NODE_ENV!== 'production') {
    require('dotenv').config({ path: `.env.dev`, override: true });
}


const router = require("./login");
const User = require("../../models/User");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  }));
app.use("/", router);

describe("POST /login", () => {

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URL_TEST || 'mongodb://localhost/testdb', { useNewUrlParser: true });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await User.create({
            email: "validemail@example.com",
            name: "Valid User",
            password: "correctpassword",
        });
    });

    it("should return 400 if email is invalid", async () => {
        const res = await request(app)
            .post("/login")
            .send({ email: "invalidemail", password: "password" });

        expect(res.statusCode).toEqual(400);
    });

    it("should return 400 if password is too short", async () => {
        const res = await request(app)
            .post("/login")
            .send({ email: "validemail@example.com", password: "12345" });

        expect(res.statusCode).toEqual(400);
    });

    it("should return 401 if user is not found", async () => {
        await User.deleteMany({});
        const res = await request(app)
            .post("/login")
            .send({ email: "nonexistent@example.com", password: "password" });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual("Invalid email or password");
    });

    it("should return 401 if password is incorrect", async () => {
        const res = await request(app)
            .post("/login")
            .send({ email: "validemail@example.com", password: "incorrectpassword" });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual("Invalid email or password");
    });

    it("should return 200 if login is successful", async () => {
        const res = await request(app)
            .post("/login")
            .send({ email: "validemail@example.com", password: "correctpassword" });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual("Success on login");
    });
});