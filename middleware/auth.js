const catchAsync = require('../utils/catchAsync');
const passport = require('../middleware/passport');

const AuthMiddleware = catchAsync(async (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err || !user) {
      const error = new Error(info && info.message ? info.message : 'Unauthorized');
      error.statusCode = 401;
      return next(error);
    }
    req.user = user;
    next();
  })(req, res, next);
});

module.exports = {
  AuthMiddleware
};