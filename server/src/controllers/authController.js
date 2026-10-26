const authService = require('../services/authService');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Register new resident member
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);

    res.cookie('token', result.accessToken, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Account awaiting verification.',
      data: {
        user: result.user,
      },
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sign in user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.cookie('token', result.accessToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: result.user,
      },
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sign out user and clear authentication cookie
 */
const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access credentials
 */
const refresh = async (req, res, next) => {
  try {
    const accessToken = authService.generateToken(req.user);
    res.cookie('token', accessToken, cookieOptions);

    res.status(200).json({
      success: true,
      accessToken,
      user: req.user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refresh,
};
