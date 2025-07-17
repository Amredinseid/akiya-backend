import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

// REGISTER - Hash password before saving
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    // Save user with hashed password
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// LOGIN - Compare password with bcrypt
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email not found' });
    }

    // Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Successful login
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ ADMIN SIGNUP ROUTE
router.post('/admin-signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin', // ✅ Important: tag as admin
    });

    await adminUser.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('❌ Admin Signup Error:', error);
    res.status(500).json({ message: 'Server error during admin signup' });
  }
});

// LOGIN - Compare password with bcrypt

router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.role !== 'admin') {
      return res
        .status(401)
        .json({ message: 'Admin not found or unauthorized' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Login successful',
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});
export default router;
