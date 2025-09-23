const express = require("express");
const router = express.Router();
const pool = require("./db");
const jwt = require("jsonwebtoken");

const SECRET = "my_secret_key";

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// قرض دادن کتاب (ادمین)
router.post("/", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  const { userEmail, bookId } = req.body;
  await pool.query(
    "INSERT INTO borrowed_books(user_email,book_id) VALUES($1,$2)",
    [userEmail, bookId]
  );
  res.json({ message: "Book borrowed ✅" });
});

// لیست کتاب‌های قرض گرفته شده
router.get("/", authenticate, async (req, res) => {
  let result;
  if (req.user.role === "admin") {
    result = await pool.query(`
      SELECT bb.id, bb.borrowed_at, u.email AS user_email, b.title
      FROM borrowed_books bb
      JOIN users u ON bb.user_email = u.email
      JOIN books b ON bb.book_id = b.id
    `);
  } else {
    result = await pool.query(
      `
      SELECT bb.id, bb.borrowed_at, b.title
      FROM borrowed_books bb
      JOIN books b ON bb.book_id = b.id
      WHERE bb.user_email=$1
    `,
      [req.user.email]
    );
  }
  res.json(result.rows);
});

module.exports = router;
