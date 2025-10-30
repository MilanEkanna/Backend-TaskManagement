const ErrorResponse = require('../utils/errorResponse');

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ErrorResponse('Role not authorized', 403));
  }
  next();
};

module.exports = { authorize };