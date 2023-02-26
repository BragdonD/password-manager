const express = require('express');
const router = express.Router();
const register = require('./auth/register');
const login = require('./auth/login');

router.use('/', register);
router.use('/', login);

module.exports = router;