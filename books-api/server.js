// server.js
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

let users = [];
let books = [];
let borrowRequests = [];

// ساخت ادمین پیش‌فرض
async function createDefaultAdmin() {
  const email = "amirrezwanoori@gmail.com";
  const password = "12345678";
  if (!users.find((u) => u.email === email)) {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword, role: "admin" });
    console.log("Default admin created");
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

// ================== Auth ==================

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
  res.json({ token, role: user.role, email: user.email });
});

// ================== Books ==================

// گرفتن لیست کتاب‌ها
app.get("/books", authenticate, (req, res) => {
  if (req.user.role === "admin") return res.json(books);

  const pendingOrApproved = borrowRequests
    .filter(
      (r) =>
        r.userEmail === req.user.email &&
        (r.status === "pending" || r.status === "approved")
    )
    .map((r) => r.bookId);

  res.json(
    books.filter((b) => b.available && !pendingOrApproved.includes(b.id))
  );
});

// اضافه کردن کتاب
app.post("/books", authenticate, authorize(["admin"]), (req, res) => {
  const { title, author } = req.body;
  if (books.some((b) => b.title === title && b.author === author))
    return res.status(400).json({ message: "Book already exists" });

  const newBook = { id: uuidv4(), title, author, available: true };
  books.push(newBook);
  res.json(newBook);
});

// ویرایش کتاب
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

// حذف کتاب
app.delete("/books/:id", authenticate, authorize(["admin"]), (req, res) => {
  const { id } = req.params;
  books = books.filter((b) => b.id !== id);
  borrowRequests = borrowRequests.filter((r) => r.bookId !== id);
  res.json({ message: "Book deleted" });
});

// ================== Borrow Requests ==================

// کاربر درخواست قرض کتاب بده
app.post("/books/request", authenticate, authorize(["user"]), (req, res) => {
  const { bookId } = req.body;
  const book = books.find((b) => b.id === bookId);
  if (!book || !book.available)
    return res.status(404).json({ message: "Book not available" });

  borrowRequests.push({
    id: uuidv4(),
    userEmail: req.user.email,
    bookId,
    title: book.title,
    requestedAt: new Date(),
    status: "pending",
  });

  res.json({ message: "Request sent" });
});

// گرفتن درخواست‌های pending برای ادمین
app.get("/books/requests", authenticate, authorize(["admin"]), (req, res) => {
  const pending = borrowRequests.filter((r) => r.status === "pending");
  res.json(pending);
});

// تایید درخواست
app.post(
  "/books/requests/:id/approve",
  authenticate,
  authorize(["admin"]),
  (req, res) => {
    const reqIndex = borrowRequests.findIndex((r) => r.id === req.params.id);
    if (reqIndex === -1)
      return res.status(404).json({ message: "Request not found" });

    const request = borrowRequests[reqIndex];
    request.status = "approved";

    const book = books.find((b) => b.id === request.bookId);
    if (book) book.available = false;

    res.json({ message: "Request approved", request });
  }
);

// رد درخواست
app.post(
  "/books/requests/:id/reject",
  authenticate,
  authorize(["admin"]),
  (req, res) => {
    const reqIndex = borrowRequests.findIndex((r) => r.id === req.params.id);
    if (reqIndex === -1)
      return res.status(404).json({ message: "Request not found" });

    borrowRequests[reqIndex].status = "rejected";
    res.json({ message: "Request rejected" });
  }
);

// گرفتن کتاب‌های قرض داده شده (user خودش یا admin)
app.get("/books/borrowed", authenticate, (req, res) => {
  if (req.user.role === "admin") {
    res.json(borrowRequests.filter((r) => r.status === "approved"));
  } else {
    res.json(
      borrowRequests.filter(
        (r) => r.userEmail === req.user.email && r.status === "approved"
      )
    );
  }
});
// گرفتن لیست کاربران (فقط برای ادمین)
app.get("/auth/users", authenticate, authorize(["admin"]), (req, res) => {
  const { email } = req.query;
  let filteredUsers = users;

  if (email) {
    filteredUsers = users.filter((u) =>
      u.email.toLowerCase().includes(email.toLowerCase())
    );
  }

  res.json(filteredUsers);
});
// تغییر نقش کاربر
app.put(
  "/auth/users/:email/role",
  authenticate,
  authorize(["admin"]),
  (req, res) => {
    const { email } = req.params;
    const { role } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    res.json({ message: "Role updated successfully", user });
  }
);

// برگشت کتاب
app.post("/books/return/:id", authenticate, (req, res) => {
  const borrow = borrowRequests.find(
    (r) => r.id === req.params.id && r.status === "approved"
  );
  if (!borrow) return res.status(404).json({ message: "Not found" });

  if (req.user.role === "user" && borrow.userEmail !== req.user.email)
    return res.status(403).json({ message: "Not your borrow" });

  borrow.status = "returned";
  const book = books.find((b) => b.id === borrow.bookId);
  if (book) book.available = true;

  res.json({ message: "Book returned successfully" });
});

app.listen(5000, async () => {
  await createDefaultAdmin();
  console.log("Server running on http://localhost:5000");
});
