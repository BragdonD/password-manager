const express = require("express");
const router = express.Router();
const authenticate = require('../../middleware/auth');

// Logout the user and destroy the session
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Something went wrong" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Successfully logged out" });
  });
};

router.post("/logout", authenticate, logout);

module.exports = router;