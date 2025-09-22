const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "my_secret_key";
let users = []; // کاربران ثبت نام شده
let loggedUsers = []; // کاربرانی که وارد شدند

// ثبت نام
async function register(req, res) {
  const { email, password } = req.body;

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { email, password: hashedPassword, role: "user" };
  users.push(newUser);

  res.json({
    message: "User registered successfully",
    user: { email, role: "user" },
  });
}

// لاگین
async function login(req, res) {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(400).json({ message: "Invalid credentials" });

  // ذخیره ورود کاربر
  if (!loggedUsers.find((u) => u.email === email)) {
    loggedUsers.push({ email, role: user.role });
  }

  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
    expiresIn: "1h",
  });
  res.json({ token, role: user.role });
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

// گرفتن کاربران (فقط admin)
function getUsers(req, res) {
  if (req.user.role !== "admin") return res.sendStatus(403);

  res.json(loggedUsers.filter((u) => u.role === "user"));
}

module.exports = { register, login, authenticate, getUsers };
