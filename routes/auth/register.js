const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');

const registerValidation = [
    // Validate email, name and password fields
    body('email').isEmail().normalizeEmail(),
    body('name').isString().trim().notEmpty(),
    body('password').isLength({ min: 8 }),
];

const registerUser = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(500).send({ message: 'Internal server error' });
    }
};

router.post('/register', registerValidation, registerUser);

module.exports = router;