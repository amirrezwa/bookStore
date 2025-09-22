const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(bodyParser.json());

const SECRET = "my_secret_key";

// آرایه کاربران و لاگین شده‌ها
let users = [];
let loggedUsers = [];
let books = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin" },
  { id: 2, title: "The Pragmatic Programmer", author: "Andrew Hunt" },
];

// ساخت admin پیش‌فرض
async function createDefaultAdmin() {
  const email = "amirrezwanoori@gmail.com";
  const password = "12345678";

  if (!users.find((u) => u.email === email)) {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword, role: "admin" });
    console.log("✅ Default admin created:", email, "password:", password);
  }
}

// ثبت نام user عادی
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, role: "user" });
  res.json({
    message: "User registered successfully",
    user: { email, role: "user" },
  });
});

// لاگین
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

  // ذخیره کاربر لاگین شده
  if (!loggedUsers.find((u) => u.email === email)) {
    loggedUsers.push({ email, role: user.role });
  }

  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
    expiresIn: "1h",
  });
  res.json({ token, role: user.role });
});

// گرفتن کاربران (فقط admin)
app.get("/auth/users", (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.role !== "admin") return res.sendStatus(403);
    res.json(loggedUsers.filter((u) => u.role === "user"));
  });
});

// کتاب‌ها (CRUD ساده)
app.get("/books", (req, res) => res.json(books));

app.post("/books", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.role !== "admin") return res.sendStatus(403);

    const { title, author } = req.body;
    const exists = books.some(
      (b) =>
        b.title.toLowerCase() === title.toLowerCase() &&
        b.author.toLowerCase() === author.toLowerCase()
    );
    if (exists) return res.status(400).json({ message: "Book already exists" });

    const newBook = {
      id: books.length ? books[books.length - 1].id + 1 : 1,
      title,
      author,
    };
    books.push(newBook);
    res.json(newBook);
  });
});

app.put("/books/:id", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.role !== "admin") return res.sendStatus(403);

    const id = parseInt(req.params.id);
    const book = books.find((b) => b.id === id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.title = req.body.title;
    book.author = req.body.author;
    res.json(book);
  });
});

app.delete("/books/:id", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.role !== "admin") return res.sendStatus(403);

    const id = parseInt(req.params.id);
    books = books.filter((b) => b.id !== id);
    res.json({ message: "Book deleted" });
  });
});

// شروع سرور و ایجاد admin پیش‌فرض
app.listen(5000, async () => {
  await createDefaultAdmin();
  console.log("🚀 Server running on http://localhost:5000");
});
