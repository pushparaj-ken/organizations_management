// middleware/passport.js
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/userModel'); // Assuming you have a User model
const AssessmentResult = require('../models/assessmentresult')

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await AssessmentResult.findOne({ userId: payload.id });
    if (user) {
      return done(null, user);
    } else {
      console.log("TCL: ", "error")
      return done(null, false, { message: 'Unauthorized' });
    }
  } catch (error) {
    return done(error, false);
  }
}));

module.exports = passport;
