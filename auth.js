const db = require('./app/models');
const User = db.users;
const passport = require('passport');
const bcrypt = require('bcrypt');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

// passport strategy for google auth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({ where: { email: profile.email } });
      if (user) {
        return done(null, user);
      }
      const newUser = {
        names: profile.displayName,
        email: profile.email,
        password: bcrypt.hashSync(profile.id, 10), // hash the user's Google ID as the password
      };
      const createdUser = await User.create(newUser);
      return done(null, createdUser);
    } catch (err) {
      return done(err, null);
    }
  }));

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'], // specify the algorithm used for signing the JWT
}, async (jwtPayload, done) => {
  try {
    const user = await User.findByPk(jwtPayload.id);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return done("User not found", null);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/**
 * A function that takes in the user's credentials and returns a JWT token
 * @param {Object} credentials - The user's credentials including email and password
 * @returns {String} - The JWT token
 */
async function login(credentials) {
  try {
    const user = await User.findOne({ where: { email: credentials.email } });
    if (!user || !bcrypt.compareSync(credentials.password, user.password)) {
      throw new Error('Invalid email or password');
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
  } catch (err) {
    throw err;
  }
}

module.exports = { passport, login };

