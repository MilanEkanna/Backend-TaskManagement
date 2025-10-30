const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  const { username, email, password, role = 'user', team } = req.body;

  try {
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return next(new ErrorResponse('User already exists', 400));

    user = await User.create({ username, email, password, role, team });
    sendToken(user, 201, res);
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorResponse('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new ErrorResponse('Invalid credentials', 401));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));

  sendToken(user, 200, res);
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json({ success: true, data: user });
};

// @desc    Logout (client deletes token)
// @route   POST /api/auth/logout
const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out' });
};

const sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
  });
};

module.exports = { register, login, getMe, logout };