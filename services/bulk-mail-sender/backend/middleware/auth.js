const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies
    if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ error: 'User not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ error: 'Please verify your email first' });
  }
  return next();
};