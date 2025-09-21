// controllers/books.controller.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate"); // middleware احراز هویت

// دیتابیس موقتی (می‌تونی بعداً با PostgreSQL یا MongoDB جایگزینش کنی)
let books = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin" },
  { id: 2, title: "The Pragmatic Programmer", author: "Andrew Hunt" },
];

// گرفتن همه کتاب‌ها
router.get("/", authenticate, (req, res) => {
  res.json(books);
});

// جستجو در کتاب‌ها
router.get("/search/:query", authenticate, (req, res) => {
  const query = req.params.query.toLowerCase();
  const results = books.filter(
    (b) =>
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query)
  );
  res.json(results);
});

// اضافه کردن کتاب (فقط admin)
router.post("/", authenticate, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can add books" });
  }

  const { title, author } = req.body;

  // جلوگیری از تکراری بودن
  const exists = books.some(
    (b) =>
      b.title.toLowerCase() === title.toLowerCase() &&
      b.author.toLowerCase() === author.toLowerCase()
  );
  if (exists) {
    return res.status(400).json({ message: "این کتاب قبلاً وجود دارد 📕" });
  }

  const newBook = {
    id: books.length ? books[books.length - 1].id + 1 : 1,
    title,
    author,
  };
  books.push(newBook);
  res.json(newBook);
});

// ویرایش کتاب (فقط admin)
router.put("/:id", authenticate, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can edit books" });
  }

  const id = parseInt(req.params.id);
  const { title, author } = req.body;

  const bookIndex = books.findIndex((b) => b.id === id);
  if (bookIndex === -1) {
    return res.status(404).json({ message: "کتاب پیدا نشد" });
  }

  // چک تکراری بودن
  const exists = books.some(
    (b) =>
      b.id !== id &&
      b.title.toLowerCase() === title.toLowerCase() &&
      b.author.toLowerCase() === author.toLowerCase()
  );
  if (exists) {
    return res.status(400).json({ message: "این کتاب قبلاً وجود دارد 📕" });
  }

  books[bookIndex] = { id, title, author };
  res.json(books[bookIndex]);
});

// حذف کتاب (فقط admin)
router.delete("/:id", authenticate, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can delete books" });
  }

  const id = parseInt(req.params.id);
  const bookIndex = books.findIndex((b) => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: "کتاب پیدا نشد" });
  }

  books.splice(bookIndex, 1);
  res.json({ message: "کتاب حذف شد ✅" });
});

module.exports = router;
