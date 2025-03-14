import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


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
/* v8 ignore start */
const createUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = new User({ name, email, role, password }); // Password hashing handled in model
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
/* v8 ignore stop */

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
    // Added token to user who registers, expiresIn should probably be something different
    const token = jwt.sign(
      { userID: user._id, role: user.role }, // Included user role in JWT token
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
  );
    res.status(201).json({ token, message: 'User registered successfully', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller: Change password (I think Separate route needed? )
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const userID = req.user.userID;
    const user = await User.findOne({ _id: userID });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Wrong password.",
      });
    }

    user.password = newPassword;
    // Updates password in db
    await user.save();

    res.status(201).json({ message: 'User password changed successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  
// Extract user ID from the request parameters
  const { id } = req.params; 
  const updates = req.body;

  // Step 1: Ensure only the user or an admin can update the profile
  if (req.user.role !== 'admin' && req.user.userID !== id) {
    return res.status(403).json({ message: 'Access Denied. You can only update your own profile.' });
  }

  try {
    // Step 2: Find user by ID
    const user = await User.findById(id);

    // Step 3: Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Step 4: Partial updates for fields

    // Name Update
    if (updates.name) {
      user.name = updates.name.trim(); // Remove extra spaces
    }

    // Email Validation
    if (updates.email) {
      const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
      }
      user.email = updates.email;
    }

    // Role update only allowed for admins
    if (updates.role && req.user.role === 'admin') {
      user.role = updates.role;
    } else if (updates.role) {
      return res.status(403).json({ message: 'Only admins can update user roles.' });
    }


    // Password validation and hashing
    if (updates.password) {
      if (updates.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      }
      user.password = await bcrypt.hash(updates.password, 10);
    } 
    // Step 5: Save the updated user
    await user.save();

    // Step 6: Return updated user info without password
    const { password, ...updatedUser } = user.toObject();
    res.status(200).json({
      message: 'User profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while updating the user profile.', error });
  }
  
};


// Controller: Delete User

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export controllers
export { getAllUsers, createUser, registerUser, changePassword, updateUserProfile, deleteUser };

