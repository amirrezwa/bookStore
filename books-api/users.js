const express = require("express");
const router = express.Router();
const pool = require("./db");
const jwt = require("jsonwebtoken");

const SECRET = "my_secret_key";

// Middleware احراز هویت
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// فقط ادمین می‌تونه لیست ببینه
router.get("/", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  const users = await pool.query("SELECT email, role FROM users");
  res.json(users.rows);
});

// تغییر نقش کاربر
router.patch("/:email", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  const { role } = req.body;
  await pool.query("UPDATE users SET role=$1 WHERE email=$2", [
    role,
    req.params.email,
  ]);
  res.json({ message: "Role updated ✅" });
});

module.exports = router;
