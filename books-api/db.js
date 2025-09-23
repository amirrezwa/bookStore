const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER ?? "postgres",
  host: process.env.DB_HOST ?? "127.0.0.1",
  database: process.env.DB_DATABASE ?? "library",
  password: process.env.DB_PASSWORD ?? "postgres",
  port: process.env.DB_PORT ?? 5432,
});

(async () => {
  // جدول کاربران
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);

  // جدول کتاب‌ها
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL
    )
  `);

  // جدول کتاب‌های قرض گرفته شده
  await pool.query(`
    CREATE TABLE IF NOT EXISTS borrowed_books (
      id SERIAL PRIMARY KEY,
      user_email TEXT REFERENCES users(email),
      book_id INT REFERENCES books(id),
      borrowed_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // ایجاد ادمین پیش‌فرض
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [
    "amirrezwanoori@gmail.com",
  ]);
  if (res.rowCount === 0) {
    const bcrypt = require("bcrypt");
    const hashed = await bcrypt.hash("12345678", 10);
    await pool.query(
      "INSERT INTO users(email, password, role) VALUES($1, $2, 'admin')",
      ["amirrezwanoori@gmail.com", hashed]
    );
    console.log(
      "✅ Default admin created: amirrezwanoori@gmail.com / 12345678"
    );
  }
})();

module.exports = pool;
