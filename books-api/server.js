const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:5173", // فرانتت
    credentials: true,
  })
);

const SECRET = "my_secret_key";

// دیتابیس ساده
let users = [];
let books = []; // 📚 ذخیره کتاب‌ها داخل آرایه
let bookId = 1;

// ایجاد کاربر پیش‌فرض
async function createDefaultUser() {
  const email = "amirrezwanoori@gmail.com";
  const password = "12345678";
  const role = "admin";

  const exists = users.find((u) => u.email === email);
  if (exists) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, role });
  console.log("✅ Default user created:", email, "password:", password);
}

// ثبت‌نام
app.post("/auth/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, role: role || "user" });

  res.json({ message: "User registered successfully" });
});

// ورود
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res
      .status(400)
      .json({ message: "Invalid credentials (user not found)" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ message: "Invalid credentials (wrong password)" });
  }

  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
    expiresIn: "1h",
  });
  res.json({ token, role: user.role });
});

// میدلور احراز هویت
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

// 📚 API کتاب‌ها
// گرفتن همه کتاب‌ها
app.get("/books", authenticate, (req, res) => {
  res.json(books);
});

// افزودن کتاب
app.post("/books", authenticate, (req, res) => {
  const { title, author } = req.body;
  const newBook = { id: bookId++, title, author };
  books.push(newBook);
  res.json(newBook);
});

// حذف کتاب
app.delete("/books/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  books = books.filter((b) => b.id !== id);
  res.json({ message: "Book deleted" });
});

// ویرایش کتاب
app.put("/books/:id", authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author } = req.body;
  const book = books.find((b) => b.id === id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  book.title = title;
  book.author = author;
  res.json(book);
});

// جستجو
app.get("/books/search/:query", authenticate, (req, res) => {
  const query = req.params.query.toLowerCase();
  const result = books.filter(
    (b) =>
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query)
  );
  res.json(result);
});

// شروع سرور
app.listen(5000, async () => {
  await createDefaultUser();
  console.log("🚀 Server running on http://localhost:5000");
});
