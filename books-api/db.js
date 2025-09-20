const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER ?? "postgres",
  host: process.env.DB_HOST ?? "127.0.0.1",
  database: process.env.DB_DATABASE ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  port: process.env.DB_PORT ?? 5432,
});

// // Create table if it doesn't exist
(async () => {
  await pool.query(`
     CREATE TABLE IF NOT EXISTS books (
       id UUID PRIMARY KEY,
       title TEXT NOT NULL,
       author TEXT NOT NULL
     )
   `);
})();

async function getAllBooks() {
  const result = await pool.query("SELECT * FROM books");
  return result.rows;
}

async function getBookById(id) {
  const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
  return result.rows[0];
}

async function createBook(id, title, author) {
  const result = await pool.query(
    "INSERT INTO books (id, title, author) VALUES ($1, $2, $3) RETURNING *",
    [id, title, author]
  );
  return result.rows[0];
}

async function updateBook(id, title, author) {
  const result = await pool.query(
    "UPDATE books SET title = $1, author = $2 WHERE id = $3 RETURNING *",
    [title, author, id]
  );
  return result.rows[0];
}

async function deleteBook(id) {
  const result = await pool.query(
    "DELETE FROM books WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
}

async function searchBooks(query) {
  const result = await pool.query(
    "SELECT * FROM books WHERE LOWER(title) LIKE $1 OR LOWER(author) LIKE $1",
    [`%${query.toLowerCase()}%`]
  );
  return result.rows;
}

// for JWT
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey"; // بهتره تو .env بذاری

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
};
