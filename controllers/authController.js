const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        let isVerified = false;

        // Special handling for admin registration
        if (role === "admin") {
            if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
                return res.status(403).json({ message: "Unauthorized admin registration" });
            }

            // Check if an admin already exists
            const adminExists = await User.findOne({ role: "admin" });
            if (adminExists) {
                return res.status(403).json({ message: "Admin already exists" });
            }

            isVerified = true; // Auto-verify admin
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            isVerified
        });

        const savedUser = await user.save();
        console.log("✅ User saved to database:", savedUser);

        // Generate JWT token
        const token = generateToken(savedUser._id);

        // Send response
        res.status(201).json({
            _id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            isVerified: savedUser.isVerified,
            token
        });
    } catch (error) {
        console.error("❌ Error in registerUser:", error);
        res.status(500).json({ message: error.message });
    }
};


// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Handle admin login from .env credentials
    if (email === process.env.ADMIN_EMAIL) {
        if (password === process.env.ADMIN_PASSWORD) {
            let adminUser = await User.findOne({ email });

            // If admin is not yet registered, create them now
            if (!adminUser) {
                adminUser = new User({
                    name: "Admin",
                    email: process.env.ADMIN_EMAIL,
                    password: "", // Leave password blank or set a flag (not used)
                    role: "admin",
                    isVerified: true
                });

                await adminUser.save();
            }

            return res.json({
                _id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                isVerified: adminUser.isVerified,
                token: generateToken(adminUser.id)
            });
        } else {
            return res.status(401).json({ message: 'Invalid admin password' });
        }
    }

    // Handle non-admin login
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
        return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user.id)
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};


// PUT /api/users/verify/:id
const verifyUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      if (user.isVerified) return res.status(400).json({ message: "User already verified" });
  
      user.isVerified = true;
      await user.save();
  
      res.status(200).json({ message: "User verified successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  // GET /api/users/unverified
const getUnverifiedUsers = async (req, res) => {
    try {
        const unverifiedUsers = await User.find({ isVerified: false, role: { $ne: 'admin' } }).select('-password'); // Exclude admin and password
        res.status(200).json(unverifiedUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = { registerUser, loginUser, verifyUser, getUnverifiedUsers };