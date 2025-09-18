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
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom align="center">
        📚 مدیریت کتاب‌ها
      </Typography>

      {/* فرم افزودن/ویرایش */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={editingBook ? saveEdit : addBook}>
          <TextField
            fullWidth
            label="عنوان کتاب"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="نویسنده"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            margin="normal"
          />
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {editingBook ? "💾 ذخیره تغییرات" : "➕ افزودن کتاب"}
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
                ❌ لغو
              </Button>
            )}
          </Box>
        </form>
      </Paper>

      {/* سرچ */}
      <TextField
        fullWidth
        label="🔍 جست‌وجوی کتاب..."
        value={search}
        onChange={searchBooks}
        sx={{ mb: 3 }}
      />

      {/* لیست کتاب‌ها */}
      <List>
        {books.map((book) => (
          <ListItem
            key={book.id}
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
            <ListItemText primary={book.title} secondary={book.author} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default App;
