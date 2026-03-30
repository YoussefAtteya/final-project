const db = require('../db');




const getAllDishes = (req, res) => {
  const { category } = req.query;

  let query = 'SELECT * FROM dishes';
  let values = [];

  if (category) {
    query += ' WHERE category_id = ?';
    values.push(category);
  }

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};



const getFeaturedDishes = (req, res) => {
  db.query(
    'SELECT * FROM dishes WHERE is_featured = 1',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

const getTodaySpecial = (req, res) => {
  db.query(
    'SELECT * FROM dishes WHERE is_special = 1 LIMIT 1',
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0] || null);
    }
  );
};

module.exports = {
  getAllDishes,
  getFeaturedDishes,
  getTodaySpecial
};






