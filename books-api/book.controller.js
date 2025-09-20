const { v4: uuidv4 } = require("uuid");
const db = require("./db");

function setup(app) {
  // Get all books
  app.get("/books", async (req, res) => {
    const books = await db.getAllBooks();
    res.json(books);
  });

  // Get book by ID
  app.get("/books/:id", async (req, res) => {
    const book = await db.getBookById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  });

  // Create new book
  app.post("/books", async (req, res) => {
    const { title, author } = req.body;
    if (!title || !author)
      return res.status(400).json({ message: "Title and author are required" });

    const newBook = await db.createBook(uuidv4(), title, author);
    res.status(201).json(newBook);
  });

  // Update book
  app.put("/books/:id", async (req, res) => {
    const { title, author } = req.body;
    const updatedBook = await db.updateBook(req.params.id, title, author);
    if (!updatedBook)
      return res.status(404).json({ message: "Book not found" });

    res.json(updatedBook);
  });

  // Delete book
  app.delete("/books/:id", async (req, res) => {
    const deletedBook = await db.deleteBook(req.params.id);
    if (!deletedBook)
      return res.status(404).json({ message: "Book not found" });

    res.json(deletedBook);
  });

  // Search books
  app.get("/books/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json(await db.getAllBooks());

    const results = await db.searchBooks(q);
    res.json(results);
  });
}

module.exports = { setup };
