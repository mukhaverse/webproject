

function requireAdmin(req, res, next) {
  // req.user is set by requireAuth middleware before this runs
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { requireAdmin };