// src/BooksPage.js
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // fetch books
  const fetchBooks = () => {
    fetch("http://localhost:5000/books", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Error fetching books:", err));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // add book
  const addBook = (e) => {
    e.preventDefault();
    setError("");

    const exists = books.some(
      (b) =>
        b.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        b.author.trim().toLowerCase() === author.trim().toLowerCase()
    );

    if (exists) {
      setError("این کتاب قبلاً اضافه شده 📕");
      return;
    }

    fetch("http://localhost:5000/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, author }),
    })
      .then((res) => res.json())
      .then(() => {
        setTitle("");
        setAuthor("");
        fetchBooks();
      });
  };

  // delete book
  const deleteBook = (id) => {
    fetch(`http://localhost:5000/books/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => fetchBooks())
      .catch((err) => console.error("Error deleting book:", err));
  };

  // start editing
  const startEdit = (book) => {
    setEditingBook(book.id);
    setTitle(book.title);
    setAuthor(book.author);
  };

  // save edit
  const saveEdit = (e) => {
    e.preventDefault();
    setError("");

    const exists = books.some(
      (b) =>
        b.id !== editingBook &&
        b.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        b.author.trim().toLowerCase() === author.trim().toLowerCase()
    );

    if (exists) {
      setError("این کتاب قبلاً وجود دارد 📕");
      return;
    }

    fetch(`http://localhost:5000/books/${editingBook}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, author }),
    })
      .then((res) => res.json())
      .then(() => {
        setEditingBook(null);
        setTitle("");
        setAuthor("");
        fetchBooks();
      });
  };

  // search
  const searchBooks = (e) => {
    const query = e.target.value;
    setSearch(query);

    if (query.trim() === "") {
      fetchBooks();
      return;
    }

    fetch(`http://localhost:5000/books/search/${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Error searching books:", err));
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          fontWeight="bold"
          sx={{ mb: 3 }}
        >
          Book Store 📚
        </Typography>

        {/* Error */}
        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Add / Edit → فقط برای ادمین */}
        {role === "admin" && (
          <form onSubmit={editingBook ? saveEdit : addBook}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              fullWidth
              label="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              margin="normal"
              variant="outlined"
              required
            />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                {editingBook ? "Save Change 💾" : "Add Book ➕"}
              </Button>
              {editingBook && (
                <Button
                  onClick={() => {
                    setEditingBook(null);
                    setTitle("");
                    setAuthor("");
                  }}
                  variant="outlined"
                  color="secondary"
                  fullWidth
                >
                  Cancel ❌
                </Button>
              )}
            </Box>
          </form>
        )}

        {/* Search */}
        <TextField
          fullWidth
          label="🔍 Search Book..."
          value={search}
          onChange={searchBooks}
          sx={{ mt: 3, mb: 2 }}
        />

        <Divider sx={{ mb: 2 }} />

        {/* List */}
        <List>
          {books.length === 0 ? (
            <Typography align="center" color="text.secondary">
              کتابی یافت نشد 📭
            </Typography>
          ) : (
            books.map((book) => (
              <ListItem
                key={book.id}
                sx={{
                  border: "1px solid #eee",
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: "#fafafa",
                }}
                secondaryAction={
                  role === "admin" && (
                    <>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => deleteBook(book.id)}
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => startEdit(book)}
                      >
                        <Edit />
                      </IconButton>
                    </>
                  )
                }
              >
                <ListItemText
                  primary={book.title}
                  secondary={book.author}
                  primaryTypographyProps={{ fontWeight: "bold" }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Container>
  );
}

export default BooksPage;
