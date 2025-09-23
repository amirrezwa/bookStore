const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(bodyParser.json());

const SECRET = "my_secret_key";

// دیتابیس ساده در حافظه
let users = [];
let books = [];
let borrowedBooks = [];

// ایجاد ادمین پیش‌فرض
async function createDefaultAdmin() {
  const email = "amirrezwanoori@gmail.com";
  const password = "12345678";

  if (!users.find((u) => u.email === email)) {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword, role: "admin" });
    console.log("✅ Default admin created:", email, "password:", password);
  }
}

// Middleware احراز هویت
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware مجوز دسترسی به نقش‌ها
function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });
    next();
  };
}

// ثبت‌نام
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  if (users.find((u) => u.email === email))
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, role: "user" });
  res.json({ message: "User registered successfully", email, role: "user" });
});

// لاگین
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
    expiresIn: "1h",
  });
  res.json({ token, role: user.role });
});

// گرفتن لیست کاربران (فقط admin)
app.get("/auth/users", authenticate, authorize(["admin"]), (req, res) => {
  res.json(users.map((u) => ({ email: u.email, role: u.role })));
});

// تغییر نقش کاربر (admin/user) توسط ادمین
app.put(
  "/auth/users/:email/role",
  authenticate,
  authorize(["admin"]),
  (req, res) => {
    const { email } = req.params;
    const { role } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ message: "User not found" });

    // نمی‌تونی نقش ادمین پیش‌فرض رو تغییر بدی
    if (user.email === "amirrezwanoori@gmail.com")
      return res.status(403).json({ message: "Cannot change main admin role" });

    user.role = role;
    res.json({ message: "Role updated", email: user.email, role: user.role });
  }
);

// کتاب‌ها
app.get("/books", authenticate, (req, res) => res.json(books));

app.post("/books", authenticate, authorize(["admin"]), (req, res) => {
  const { title, author } = req.body;
  if (books.some((b) => b.title === title && b.author === author))
    return res.status(400).json({ message: "Book already exists" });

  const newBook = { id: uuidv4(), title, author };
  books.push(newBook);
  res.json(newBook);
});

app.put("/books/:id", authenticate, authorize(["admin"]), (req, res) => {
  const { id } = req.params;
  const { title, author } = req.body;
  const book = books.find((b) => b.id === id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (
    books.some((b) => b.id !== id && b.title === title && b.author === author)
  )
    return res.status(400).json({ message: "Book already exists" });

  book.title = title;
  book.author = author;
  res.json(book);
});

app.delete("/books/:id", authenticate, authorize(["admin"]), (req, res) => {
  const { id } = req.params;
  books = books.filter((b) => b.id !== id);
  borrowedBooks = borrowedBooks.filter((bb) => bb.bookId !== id);
  res.json({ message: "Book deleted" });
});

// قرض دادن کتاب
// برای ذخیره، lender_email و borrowed_at اضافه میشه
app.post("/books/borrow", authenticate, authorize(["admin"]), (req, res) => {
  const { userEmail, bookId } = req.body;
  const book = books.find((b) => b.id === bookId);
  const user = users.find((u) => u.email === userEmail);
  if (!book || !user)
    return res.status(404).json({ message: "Book or user not found" });

  borrowedBooks.push({
    id: uuidv4(),
    bookId,
    title: book.title,
    user_email: userEmail,
    lender_email: req.user.email, // اضافه شد
    returned: false,
    borrowed_at: new Date().toISOString(),
  });
  res.json({ message: "Book borrowed" });
});

// برگشت کتاب
app.post(
  "/books/return/:id",
  authenticate,
  authorize(["admin"]),
  (req, res) => {
    const { id } = req.params;
    const borrow = borrowedBooks.find((bb) => bb.id === id);
    if (!borrow) return res.status(404).json({ message: "Borrow not found" });
    borrow.returned = true;
    borrow.returned_at = new Date().toISOString();
    res.json({ message: "Book returned" });
  }
);

// مشاهده لیست قرض‌ها
// اگر admin باشه: فقط رکوردهایی که خودش قرض داده (lender_email === req.user.email)
// اگر user باشه: فقط قرض‌های خودش (user_email === req.user.email)
app.get("/books/borrowed", authenticate, (req, res) => {
  if (req.user.role === "admin") {
    const myLents = borrowedBooks.filter(
      (bb) => bb.lender_email === req.user.email
    );
    return res.json(myLents);
  }
  // برای کاربر معمولی فقط کتاب‌هایی که خودش قرض گرفته
  const myBorrows = borrowedBooks.filter(
    (bb) => bb.user_email === req.user.email
  );
  res.json(myBorrows);
});

app.listen(5000, async () => {
  await createDefaultAdmin();
  console.log("🚀 Server running on http://localhost:5000");
});
