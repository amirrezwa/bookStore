// server.js
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // اجازه به همه دامین‌ها
app.use(express.json());

const SECRET = "mysecret";

// ==== دیتابیس موقت ====
let users = [];
let books = [
  { id: uuidv4(), title: "Clean Code", author: "Robert C. Martin" },
  { id: uuidv4(), title: "The Pragmatic Programmer", author: "Andrew Hunt" },
];

// ==== Auth Middleware ====
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

function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

// ==== Auth Routes ====
app.post("/auth/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  let userRole = "user";
  if (role === "admin" && email === "admin@example.com") userRole = "admin";

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, role: userRole });

  res.json({
    message: "Registered successfully",
    user: { email, role: userRole },
  });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
    expiresIn: "1h",
  });
  res.json({ token, role: user.role });
});

// ==== Books Routes ====
app.get("/books", authenticate, authorize(["user", "admin"]), (req, res) => {
  res.json(books);
});

app.get(
  "/books/search/:q",
  authenticate,
  authorize(["user", "admin"]),
  (req, res) => {
    const q = req.params.q.toLowerCase();
    const results = books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
    res.json(results);
  }
);

app.post("/books", authenticate, authorize(["admin"]), (req, res) => {
  const { title, author } = req.body;

  const exists = books.some(
    (b) =>
      b.title.toLowerCase() === title.toLowerCase() &&
      b.author.toLowerCase() === author.toLowerCase()
  );
  if (exists)
    return res.status(400).json({ message: "این کتاب قبلاً وجود دارد 📕" });

  const newBook = { id: uuidv4(), title, author };
  books.push(newBook);
  res.json(newBook);
});

app.put("/books/:id", authenticate, authorize(["admin"]), (req, res) => {
  const { title, author } = req.body;
  const bookIndex = books.findIndex((b) => b.id === req.params.id);
  if (bookIndex === -1)
    return res.status(404).json({ message: "کتاب پیدا نشد" });

  const exists = books.some(
    (b) =>
      b.id !== req.params.id &&
      b.title.toLowerCase() === title.toLowerCase() &&
      b.author.toLowerCase() === author.toLowerCase()
  );
  if (exists)
    return res.status(400).json({ message: "این کتاب قبلاً وجود دارد 📕" });

  books[bookIndex] = { id: books[bookIndex].id, title, author };
  res.json(books[bookIndex]);
});

app.delete("/books/:id", authenticate, authorize(["admin"]), (req, res) => {
  const index = books.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "کتاب پیدا نشد" });

  books.splice(index, 1);
  res.json({ message: "کتاب حذف شد ✅" });
});

// ==== Start Server ====
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
