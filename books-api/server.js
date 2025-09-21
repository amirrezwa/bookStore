const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = "mysecret"; // بهتره تو .env بذاری

// ---------- PostgreSQL Setup ----------
const pool = new Pool({
  user: process.env.DB_USER ?? "postgres",
  host: process.env.DB_HOST ?? "127.0.0.1",
  database: process.env.DB_DATABASE ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  port: process.env.DB_PORT ?? 5432,
});

// Create tables if not exist
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS loans (
      id UUID PRIMARY KEY,
      book_id UUID REFERENCES books(id),
      user_email TEXT NOT NULL,
      loan_date TIMESTAMP DEFAULT NOW(),
      return_date TIMESTAMP NULL
    );
  `);
})();

// ---------- In-memory users ----------
let users = []; // بعدا میتونی بره DB

// ---------- Middleware ----------
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

// ---------- Auth Routes ----------
// Register
app.post("/auth/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (users.find((u) => u.email === email))
    return res.status(400).json({ message: "User already exists" });

  let userRole = "user";
  if (role === "admin") {
    if (email === "admin@example.com") userRole = "admin";
    else
      return res
        .status(403)
        .json({ message: "Not allowed to register as admin" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, role: userRole });

  res.json({
    message: "Registered successfully",
    user: { email, role: userRole },
  });
});

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
    expiresIn: "1h",
  });
  res.json({ token, role: user.role });
});

// ---------- Books Routes ----------
app.get(
  "/books",
  authenticate,
  authorize(["user", "admin"]),
  async (req, res) => {
    const result = await pool.query("SELECT * FROM books");
    res.json(result.rows);
  }
);

app.get(
  "/books/:id",
  authenticate,
  authorize(["user", "admin"]),
  async (req, res) => {
    const result = await pool.query("SELECT * FROM books WHERE id = $1", [
      req.params.id,
    ]);
    if (!result.rows[0])
      return res.status(404).json({ message: "Book not found" });
    res.json(result.rows[0]);
  }
);

app.post("/books", authenticate, authorize(["admin"]), async (req, res) => {
  const { title, author } = req.body;

  const exists = await pool.query(
    "SELECT * FROM books WHERE LOWER(title) = $1 AND LOWER(author) = $2",
    [title.toLowerCase(), author.toLowerCase()]
  );
  if (exists.rows.length)
    return res.status(400).json({ message: "این کتاب قبلاً وجود دارد 📕" });

  const newBook = { id: uuidv4(), title, author };
  await pool.query(
    "INSERT INTO books (id, title, author) VALUES ($1, $2, $3)",
    [newBook.id, title, author]
  );
  res.json(newBook);
});

app.put("/books/:id", authenticate, authorize(["admin"]), async (req, res) => {
  const { title, author } = req.body;

  const exists = await pool.query(
    "SELECT * FROM books WHERE id != $1 AND LOWER(title) = $2 AND LOWER(author) = $3",
    [req.params.id, title.toLowerCase(), author.toLowerCase()]
  );
  if (exists.rows.length)
    return res.status(400).json({ message: "این کتاب قبلاً وجود دارد 📕" });

  const result = await pool.query(
    "UPDATE books SET title = $1, author = $2 WHERE id = $3 RETURNING *",
    [title, author, req.params.id]
  );
  res.json(result.rows[0]);
});

app.delete(
  "/books/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    const result = await pool.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!result.rows[0])
      return res.status(404).json({ message: "Book not found" });
    res.json({ message: "کتاب حذف شد ✅" });
  }
);

// Search books
app.get(
  "/books/search/:query",
  authenticate,
  authorize(["user", "admin"]),
  async (req, res) => {
    const q = req.params.query.toLowerCase();
    const result = await pool.query(
      "SELECT * FROM books WHERE LOWER(title) LIKE $1 OR LOWER(author) LIKE $1",
      [`%${q}%`]
    );
    res.json(result.rows);
  }
);

// ---------- Loans Routes ----------
app.get("/loans", authenticate, async (req, res) => {
  if (req.user.role === "admin") {
    const allLoans = await pool.query(
      "SELECT * FROM loans ORDER BY loan_date DESC"
    );
    return res.json(allLoans.rows);
  } else {
    const userLoans = await pool.query(
      "SELECT * FROM loans WHERE user_email = $1 AND return_date IS NULL",
      [req.user.email]
    );
    return res.json(userLoans.rows);
  }
});

app.post(
  "/loans/:bookId/:userEmail",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    const { bookId, userEmail } = req.params;
    const newLoan = { id: uuidv4(), book_id: bookId, user_email: userEmail };
    await pool.query(
      "INSERT INTO loans (id, book_id, user_email) VALUES ($1, $2, $3)",
      [newLoan.id, bookId, userEmail]
    );
    res.json({ message: "کتاب قرض داده شد ✅", loan: newLoan });
  }
);

app.put("/loans/return/:loanId", authenticate, async (req, res) => {
  const result = await pool.query(
    "UPDATE loans SET return_date = NOW() WHERE id = $1 RETURNING *",
    [req.params.loanId]
  );
  res.json({ message: "کتاب برگردانده شد ✅", loan: result.rows[0] });
});

// ---------- Start Server ----------
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
