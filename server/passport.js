const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

passport.serializeUser((user, done) => {
  done(null, { id: user.id, role: user.role });
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value || null;
        const name = profile.displayName || 'Google User';

        db.query(
          'SELECT * FROM users WHERE provider = ? AND provider_id = ? LIMIT 1',
          ['google', googleId],
          (err, rows) => {
            if (err) return done(err);

            if (rows.length > 0) {
              return done(null, rows[0]);
            }

            db.query(
              'INSERT INTO users (name, email, password, role, provider, provider_id) VALUES (?, ?, ?, ?, ?, ?)',
              [name, email, null, 'user', 'google', googleId],
              (err2, result) => {
                if (err2) return done(err2);

                db.query(
                  'SELECT * FROM users WHERE id = ? LIMIT 1',
                  [result.insertId],
                  (err3, rows2) => {
                    if (err3) return done(err3);
                    return done(null, rows2[0]);
                  }
                );
              }
            );
          }
        );
      } catch (e) {
        return done(e);
      }
    }
  )
);

module.exports = passport;