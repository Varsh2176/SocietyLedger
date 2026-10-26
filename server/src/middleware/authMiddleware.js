const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication Middleware
 * Validates JWT access token from HttpOnly cookie 'token' or 'Authorization: Bearer <token>' header.
 * Attaches authenticated user and societyId to req.
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Fallback to Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No session or token provided.',
      });
    }

    // 3. Verify token
    const secret = process.env.JWT_SECRET || 'societyledger_super_secret_jwt_key_2026_change_in_production';
    const decoded = jwt.verify(token, secret);

    // 4. Fetch user from database
    const user = await User.findById(decoded.id).select('+isActive');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account has been deactivated. Please contact society administration.',
      });
    }

    // Attach user and society ID scope
    req.user = user;
    req.societyId = user.societyId ? user.societyId.toString() : null;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.',
        isExpired: true,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication credentials.',
    });
  }
};

/**
 * Optional authentication: attaches user if token is present, but doesn't reject if absent.
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const secret = process.env.JWT_SECRET || 'societyledger_super_secret_jwt_key_2026_change_in_production';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
        req.societyId = user.societyId ? user.societyId.toString() : null;
      }
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};
