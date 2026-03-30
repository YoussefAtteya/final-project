const db = require("../config/db");

async function attachCurrentUser(req, res, next) {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      req.user = null;
      return next();
    }

    const [rows] = await db.execute(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    req.user = rows.length ? rows[0] : null;
    next();
  } catch (error) {
    console.error("attachCurrentUser error:", error);
    req.user = null;
    next();
  }
}

module.exports = attachCurrentUser;