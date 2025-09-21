require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || "mysecretkey";

// ------------ Middleware ------------
app.use(
  cors({
    origin: "http://localhost:5173", // پورت فرانت‌اندت
    credentials: true,
  })
);
app.use(bodyParser.json());

// ------------ PostgreSQL Setup ------------
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS borrowed_books (
      id UUID PRIMARY KEY,
      book_id UUID REFERENCES books(id),
      user_email TEXT NOT NULL,
      borrowed_at TIMESTAMP DEFAULT NOW()
    )
  `);
})();

// ------------ Auth Middleware ------------
let users = []; // موقتاً in-memory

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
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });
    next();
  };
}

// ------------ Auth Routes ------------
app.post("/auth/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (users.find((u) => u.email === email))
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  let userRole =
    role === "admin" && email === "admin@example.com" ? "admin" : "user";

  users.push({ email, password: hashedPassword, role: userRole });

  res.json({
    message: "Registered successfully ✅",
    user: { email, role: userRole },
  });
});

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

// Get all users (admin)
app.get("/auth/users", authenticate, authorize(["admin"]), (req, res) => {
  res.json(users.map((u) => ({ email: u.email, role: u.role })));
});

// ------------ Books Routes ------------
async function getAllBooks() {
  const res = await pool.query("SELECT * FROM books ORDER BY title");
  return res.rows;
}

async function getBookById(id) {
  const res = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
  return res.rows[0];
}

async function createBook(id, title, author) {
  const res = await pool.query(
    "INSERT INTO books (id, title, author) VALUES ($1, $2, $3) RETURNING *",
    [id, title, author]
  );
  return res.rows[0];
}

async function updateBook(id, title, author) {
  const res = await pool.query(
    "UPDATE books SET title = $1, author = $2 WHERE id = $3 RETURNING *",
    [title, author, id]
  );
  return res.rows[0];
}

async function deleteBook(id) {
  const res = await pool.query("DELETE FROM books WHERE id = $1 RETURNING *", [
    id,
  ]);
  return res.rows[0];
}

async function searchBooks(query) {
  const res = await pool.query(
    "SELECT * FROM books WHERE LOWER(title) LIKE $1 OR LOWER(author) LIKE $1",
    [`%${query.toLowerCase()}%`]
  );
  return res.rows;
}

app.get(
  "/books",
  authenticate,
  authorize(["user", "admin"]),
  async (req, res) => {
    const books = await getAllBooks();
    res.json(books);
  }
);

app.get(
  "/books/:id",
  authenticate,
  authorize(["user", "admin"]),
  async (req, res) => {
    const book = await getBookById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  }
);

app.post("/books", authenticate, authorize(["admin"]), async (req, res) => {
  const { title, author } = req.body;
  const existing = await searchBooks(title);
  if (
    existing.some(
      (b) =>
        b.title.toLowerCase() === title.toLowerCase() &&
        b.author.toLowerCase() === author.toLowerCase()
    )
  )
    return res.status(400).json({ message: "This book already exists 📕" });
  const newBook = await createBook(uuidv4(), title, author);
  res.json(newBook);
});

app.put("/books/:id", authenticate, authorize(["admin"]), async (req, res) => {
  const { title, author } = req.body;
  const updated = await updateBook(req.params.id, title, author);
  if (!updated) return res.status(404).json({ message: "Book not found" });
  res.json(updated);
});

app.delete(
  "/books/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    const deleted = await deleteBook(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted ✅" });
  }
);

app.get(
  "/books/search/:query",
  authenticate,
  authorize(["user", "admin"]),
  async (req, res) => {
    const results = await searchBooks(req.params.query);
    res.json(results);
  }
);

// ------------ Borrow Books (Admin) ------------
app.post("/borrow", authenticate, authorize(["admin"]), async (req, res) => {
  const { book_id, user_email } = req.body;

  const user = users.find((u) => u.email === user_email);
  if (!user) return res.status(404).json({ message: "User not found" });

  const book = await getBookById(book_id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  const result = await pool.query(
    "INSERT INTO borrowed_books (id, book_id, user_email) VALUES ($1,$2,$3) RETURNING *",
    [uuidv4(), book_id, user_email]
  );

  res.json(result.rows[0]);
});

app.get("/borrow", authenticate, authorize(["admin"]), async (req, res) => {
  const result = await pool.query(`
    SELECT b.title, b.author, bb.user_email as email, bb.borrowed_at
    FROM borrowed_books bb
    JOIN books b ON b.id = bb.book_id
    ORDER BY bb.borrowed_at DESC
  `);
  res.json(result.rows);
});

// ------------ Start Server ------------
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
