const db = require('../db');

async function requireAdmin(req, res, next) {

  const userId = req.session?.userId || req.session?.adminId;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  try {

    const [rows] = await db.promise().query(
      "SELECT role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!rows.length || rows[0].role !== "admin") {
      return res.status(403).json({
        error: "Forbidden"
      });
    }

    next();

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Admin authorization failed"
    });

  }

}

module.exports = requireAdmin;