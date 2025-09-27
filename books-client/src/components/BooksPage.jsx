import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

function BooksPage() {
  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [editingBook, setEditingBook] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // گرفتن کتاب‌ها
  const fetchBooks = () => {
    fetch("http://localhost:5000/books", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => fetchBooks(), []);

  // حذف کتاب
  const deleteBook = (id) => {
    fetch(`http://localhost:5000/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => fetchBooks());
  };

  // باز کردن مودال برای اضافه کردن
  const handleAddOpen = () => {
    setEditingBook(null);
    setTitle("");
    setAuthor("");
    setOpen(true);
  };

  // باز کردن مودال برای ویرایش
  const handleEditOpen = (book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setOpen(true);
  };

  // ذخیره (Add یا Edit)
  const handleSave = (e) => {
    e.preventDefault();
    setError("");

    if (editingBook) {
      fetch(`http://localhost:5000/books/${editingBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, author }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update book");
          return res.json();
        })
        .then(() => {
          setOpen(false);
          setEditingBook(null);
          fetchBooks();
        })
        .catch((err) => setError(err.message));
    } else {
      fetch("http://localhost:5000/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, author }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to add book");
          return res.json();
        })
        .then(() => {
          setOpen(false);
          fetchBooks();
        })
        .catch((err) => setError(err.message));
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, ml: 50 }}>
      {/* تیتر و دکمه Add */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Book Store 📚</Typography>
        {role === "admin" && (
          <Button variant="contained" color="primary" onClick={handleAddOpen}>
            Add Book
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* جدول کتاب‌ها */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Title
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Author
              </TableCell>
              {role === "admin" && (
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={role === "admin" ? 3 : 2}>
                  No books found 📭
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id} hover>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  {role === "admin" && (
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => deleteBook(book.id)}
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditOpen(book)}
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog برای Add یا Edit */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingBook ? "Edit Book ✏️" : "Add New Book ➕"}
        </DialogTitle>
        <DialogContent>
          {error && <Typography color="error">{error}</Typography>}
          <Box component="form" onSubmit={handleSave} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            {editingBook ? "Save Changes" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default BooksPage;
