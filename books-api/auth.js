const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const SECRET = "my_secret_key";

// ثبت‌نام
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const userExist = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  if (userExist.rowCount)
    return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users(email,password,role) VALUES($1,$2,'user')",
    [email, hashed]
  );
  res.json({ message: "User registered ✅" });
});

// لاگین
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userRes = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  if (!userRes.rowCount)
    return res.status(400).json({ message: "Invalid credentials" });

  const user = userRes.rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
    expiresIn: "1h",
  });
  res.json({ token, role: user.role });
});

module.exports = router;
