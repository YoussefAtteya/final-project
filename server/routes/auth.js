const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, logout, adminLogin } = require('../controllers/authController');
const passport = require('passport');





// Google OAuth start
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google` }),
  (req, res) => {
    // ✅ هنا user اتعمله login داخل req.user + session
    // session fixation protection
    req.session.regenerate((err) => {
      if (err) return res.redirect(`${process.env.FRONTEND_URL}/login?error=session`);

      req.session.userId = req.user.id;
      req.session.role = req.user.role;

      res.redirect(`${process.env.FRONTEND_URL}/`); // أو /account
    });
  }
);
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: {
      id: req.session.userId,
      role: req.session.role
    }
  });
});




router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  login
);

router.post(
  '/admin-login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  adminLogin
);

router.post('/logout', logout);

module.exports = router;
