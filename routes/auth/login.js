const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../../models/User");

const registerValidation = [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
];

const LogInUser = async (req, res) => {
    // Validate input using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Find user in database
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password is correct
    const passwordMatches = await user.authenticate(req.body.password);
    if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    req.session.user = {
        ...user
    }

    delete req.session.user.password;
    res.status(200).json({ message: "Success on login "})
}

router.post("/login", registerValidation, LogInUser);

module.exports = router;