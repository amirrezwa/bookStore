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

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [search, setSearch] = useState("");

  const fetchBooks = () => {
    fetch("http://localhost:5000/books")
      .then((res) => res.json())
      .then((data) => setBooks(data));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const addBook = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author }),
    })
      .then((res) => res.json())
      .then(() => {
        setTitle("");
        setAuthor("");
        fetchBooks();
      });
  };
  const deleteBook = (id) => {
    fetch(`http://localhost:5000/books/${id}`, {
      method: "DELETE",
    }).then(() => fetchBooks());
  };

  const startEdit = (book) => {
    setEditingBook(book.id);
    setTitle(book.title);
    setAuthor(book.author);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/books/${editingBook}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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

  const searchBooks = (e) => {
    const query = e.target.value;
    setSearch(query);
    fetch(`http://localhost:5000/books/search?q=${query}`)
      .then((res) => res.json())
      .then((data) => setBooks(data));
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 2,
        ml: 25,
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

        {/* ADD / EDIT */}
        <form onSubmit={editingBook ? saveEdit : addBook}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
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

        {/* Search */}
        <TextField
          fullWidth
          label="🔍 Search Book..."
          value={search}
          onChange={searchBooks}
          sx={{ mt: 3, mb: 2 }}
        />

        <Divider sx={{ mb: 2 }} />

        {/* Book List */}
        <List>
          {books.map((book) => (
            <ListItem
              key={book.id}
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                mb: 1,
                bgcolor: "#fafafa",
              }}
              secondaryAction={
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
              }
            >
              <ListItemText
                primary={book.title}
                secondary={book.author}
                primaryTypographyProps={{ fontWeight: "bold" }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default App;
