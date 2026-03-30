function requireAuth(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    next();
  } catch (error) {
    console.error("requireAuth error:", error);
    return res.status(500).json({
      error: "Authentication check failed.",
    });
  }
}

module.exports = requireAuth;