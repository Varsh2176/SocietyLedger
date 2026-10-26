const jwt = require('jsonwebtoken');
const { User, Society } = require('../models');
const { USER_ROLES } = require('../config/constants');
const { logAction } = require('./auditService');

/**
 * Generates JWT token for user
 */
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'societyledger_super_secret_jwt_key_2026_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      role: user.role,
      societyId: user.societyId ? user.societyId.toString() : null,
    },
    secret,
    { expiresIn }
  );
};

/**
 * Registers a new user account.
 * Security enforcement: Public registration is restricted to 'Resident' role.
 * Elevated roles (Treasurer, Admin, Committee, Auditor) must be granted by Administrator.
 */
const registerUser = async (data) => {
  const { name, email, password, phone, apartmentNumber, societyCode } = data;

  if (!email || !password || !name) {
    const error = new Error('Name, email, and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Find society if code supplied, else assign to first active society
  let society = null;
  if (societyCode) {
    society = await Society.findOne({ code: societyCode.trim().toUpperCase() });
  }
  if (!society) {
    society = await Society.findOne({ isActive: true });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone ? phone.trim() : '',
    apartmentNumber: apartmentNumber ? apartmentNumber.trim().toUpperCase() : '',
    role: USER_ROLES.RESIDENT, // Security Rule: Public registration default
    societyId: society ? society._id : null,
    isVerified: false,
    isActive: true,
  });

  const accessToken = generateToken(user);

  if (society) {
    await logAction({
      societyId: society._id,
      actor: `${user.name} (Resident)`,
      actorId: user._id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityRef: user.email,
      details: `New resident account registered for unit ${user.apartmentNumber || 'N/A'}. Awaiting verification.`,
    });
  }

  return {
    user: user.toJSON(),
    accessToken,
  };
};

/**
 * Authenticates user login credentials
 */
const loginUser = async (email, password) => {
  if (!email || !password) {
    const error = new Error('Please provide email and password.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password +isActive');

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account is currently deactivated. Please contact society administration.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateToken(user);

  if (user.societyId) {
    await logAction({
      societyId: user.societyId,
      actor: `${user.name} (${user.role})`,
      actorId: user._id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityRef: user.email,
      details: `User signed in successfully with role '${user.role}'.`,
    });
  }

  return {
    user: user.toJSON(),
    accessToken,
  };
};

/**
 * Retrieves current authenticated user profile
 */
const getMe = async (userId) => {
  const user = await User.findById(userId).populate('societyId', 'name code fiscalYear registrationNumber');
  if (!user) {
    const error = new Error('User record not found.');
    error.statusCode = 404;
    throw error;
  }

  return user.toJSON();
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  getMe,
};
