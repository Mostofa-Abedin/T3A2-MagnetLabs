const User = require('../models/User');

// Controller: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller: Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = new User({ name, email, role, password }); // Password hashing is being handled in model
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller: Register a new user
const registerUser = async (req, res) => {
    try {
      const { name, email, role, password } = req.body;
  
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
  
      // Create a new user (Password hashing handled in the User model)
      const user = new User({ name, email, role, password });
      await user.save();
  
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };








// Export controllers
module.exports = { getAllUsers, createUser, registerUser };
