const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let books = [];

app.get("/books", (req, res) => {
  res.json(books);
});

app.get("/books/:id", (req, res) => {
  const book = books.find((b) => b.id === req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

app.post("/books", (req, res) => {
  const { title, author } = req.body;
  if (!title || !author)
    return res.status(400).json({ message: "Title and author are required" });

  const newBook = { id: uuidv4(), title, author };
  books.push(newBook);
  res.status(201).json(newBook);
});

app.put("/books/:id", (req, res) => {
  const { title, author } = req.body;
  const bookIndex = books.findIndex((b) => b.id === req.params.id);
  if (bookIndex === -1)
    return res.status(404).json({ message: "Book not found" });

  books[bookIndex] = { ...books[bookIndex], title, author };
  res.json(books[bookIndex]);
});

app.delete("/books/:id", (req, res) => {
  const bookIndex = books.findIndex((b) => b.id === req.params.id);
  if (bookIndex === -1)
    return res.status(404).json({ message: "Book not found" });

  const deletedBook = books.splice(bookIndex, 1);
  res.json(deletedBook[0]);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.delete("/books/:id", (req, res) => {
  const { id } = req.params;
  books = books.filter((book) => book.id !== id);
  res.json({ message: "Delete" });
});
app.put("/books/:id", (req, res) => {
  const { id } = req.params;
  const { title, author } = req.body;

  const book = books.find((b) => b.id === id);
  if (!book) {
    return res.status(404).json({ message: "book NOT found" });
  }

  if (title) book.title = title;
  if (author) book.author = author;

  res.json(book);
});

app.get("/books/search", (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json(books);
  }

  const searchTerm = q.toLowerCase();
  const results = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm) ||
      b.author.toLowerCase().includes(searchTerm)
  );

  res.json(results);
});
