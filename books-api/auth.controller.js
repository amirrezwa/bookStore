const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let users = []; // بعدا میره تو دیتابیس

const SECRET = "mysecret"; // حتما توی .env بذار

// ثبت نام
async function register(req, res) {
  const { email, password, role } = req.body;

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // ⚠️ فقط ادمین‌ها دستی اضافه بشن، نه هر کسی
  let userRole = "user";
  if (role === "admin") {
    // مثلا بگیم فقط وقتی ایمیل خاصی باشه اجازه بده ادمین بشه
    if (email === "admin@example.com") {
      userRole = "admin";
    } else {
      return res
        .status(403)
        .json({ message: "Not allowed to register as admin" });
    }
  }

  const newUser = { email, password: hashedPassword, role: userRole };
  users.push(newUser);

  res.json({
    message: "User registered successfully",
    user: { email, role: userRole },
  });
}

// لاگین
async function login(req, res) {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // ساخت JWT همراه role
  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
    expiresIn: "1h",
  });

  res.json({ token, role: user.role });
}

// Middleware برای محافظت
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // email, role
    next();
  });
}

// Middleware برای نقش
function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

module.exports = { register, login, authenticate, authorize };
