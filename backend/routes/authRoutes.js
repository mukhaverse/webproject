const express = require("express");
const bcrypt = require("bcrypt");
const jwt= require("jsonwebtoken");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const SALT_ROUNDS = 10;   
const TOKEN_TTL   = "7d"; 
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



const signToken = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );




  

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  // validate that all fields r present
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  if (!EMAIL_REGEX.test(email))
    return res.status(400).json({ error: "Please enter a valid email address" });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    // check for an existing account with the same email
    const [existing] = await db.promise().query(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (existing.length > 0)
      return res.status(409).json({ error: "An account with this email already exists" });

    
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    
    const [result] = await db.promise().query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), email.toLowerCase().trim(), passwordHash]
    );


    const newUser = {
      id:    result.insertId,
      name:  name.trim(),
      email: email.toLowerCase().trim(),
      role:  "user",  
    };


    const token = signToken(newUser);
    return res.status(201).json({ token, user: newUser });

  } catch (err) {

    console.error("[AUTH] Signup error:", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });


  }

});









router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {

    const [rows] = await db.promise().query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });


    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);


    if (!passwordMatches)
      return res.status(401).json({ error: "Invalid email or password" });


    const { password_hash, ...safeUser } = user;


    const token = signToken(safeUser);
    return res.json({ token, user: safeUser });



  } catch (err) {

    console.error("[AUTH] Login error:", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });

  }



});








router.get("/me", requireAuth, async (req, res) => {
  try {

    
    const [rows] = await db.promise().query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [req.user.id]

    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Account not found" });

    return res.json(rows[0]);

  } catch (err) {


    console.error("[AUTH] Me error:", err.message);

    return res.status(500).json({ error: "Server error" });

  }

});





router.post("/logout", requireAuth, (req, res) => {
  return res.json({ success: true });
});


module.exports = router;

