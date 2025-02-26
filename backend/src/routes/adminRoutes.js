//Import required libraries
const express = require('express');
const router = express.Router();
const { authenticateUser,authorizeAdmin } = require('../middlewares/authMiddleware');


// Admin protected route via middleware
// @Perri - Use this route for the admin dashboard.
router.get('/dashboard', authenticateUser, authorizeAdmin, (req, res) => {
    res.json({ message: "Welcome to the Admin Dashboard." });
});

module.exports = router;