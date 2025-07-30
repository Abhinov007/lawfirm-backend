const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
require("dotenv").config();

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7); // Remove "Bearer " prefix
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid Token." });
    }

    // Fetch full user object (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user; // ✅ Attach full user object to request
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({ message: "Invalid Token." });
  }
};

// Role-based Authorization Middleware
const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Forbidden: Insufficient Permissions." });
    }
    next();
  };
};

module.exports = { authMiddleware, roleCheck };
