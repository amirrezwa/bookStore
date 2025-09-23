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

// گرفتن همه کتاب‌ها
router.get("/", authenticate, async (req, res) => {
  const result = await pool.query("SELECT * FROM books");
  res.json(result.rows);
});

// اضافه کردن کتاب (ادمین)
router.post("/", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  const { title, author } = req.body;
  const result = await pool.query(
    "INSERT INTO books(title,author) VALUES($1,$2) RETURNING *",
    [title, author]
  );
  res.json(result.rows[0]);
});

// ویرایش کتاب (ادمین)
router.put("/:id", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  const { title, author } = req.body;
  const result = await pool.query(
    "UPDATE books SET title=$1, author=$2 WHERE id=$3 RETURNING *",
    [title, author, req.params.id]
  );
  res.json(result.rows[0]);
});

// حذف کتاب (ادمین)
router.delete("/:id", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  await pool.query("DELETE FROM books WHERE id=$1", [req.params.id]);
  res.json({ message: "Book deleted ✅" });
});

module.exports = router;
