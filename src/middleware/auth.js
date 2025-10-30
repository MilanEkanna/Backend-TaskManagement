const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');

const protect = (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return next(new ErrorResponse('Not authorized', 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(new ErrorResponse('Not authorized', 401));
  }
};

module.exports = { protect };