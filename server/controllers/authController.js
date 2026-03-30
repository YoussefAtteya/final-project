const db = require('../db');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');


const adminLogin = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ? AND role = "admin" LIMIT 1',
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

      const admin = results[0];
      const match = await bcrypt.compare(password, admin.password);

      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      req.session.regenerate((err) => {
       if (err) {
        return res.status(500).json({ error: 'Session error' });
      }

      req.session.adminId = admin.id;
      req.session.role = admin.role;

        res.json({
          message: 'Admin logged in successfully'
        });
    });

    }
  );
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {

    db.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email],
      async (err, results) => {

        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
          return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, hashedPassword],
          (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });

            res.json({ message: 'User registered successfully' });
          }
        );
      }
    );

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      
      req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session error' });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

     res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
   });
});

    }
  );
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('restaurant_session');
    res.json({ message: 'Logged out successfully' });
  });
};


module.exports = { adminLogin, register, login, logout };
