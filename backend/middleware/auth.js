const jwt = require("jsonwebtoken");



// block requests without a valid JWT

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;



  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();


  } catch (err) {

    return res.status(401).json({ error: "Session expired. Please log in again." });
  }


};





const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {

    return res.status(401).json({ error: "Not authenticated" });
  }
  if (!allowedRoles.includes(req.user.role)) {

    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

module.exports = { requireAuth, requireRole };
