import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Divider,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete, Edit, Search } from "@mui/icons-material";

function BooksPage({ refreshFlag }) {
  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 👈 برای سرچ
  const [filteredBooks, setFilteredBooks] = useState([]);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchBooks = () => {
    fetch("http://localhost:5000/books", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setFilteredBooks(data); // 👈 مقدار اولیه برای فیلترشده
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => fetchBooks(), [refreshFlag]);

  const deleteBook = (id) => {
    fetch(`http://localhost:5000/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => fetchBooks());
  };

  const handleAddOpen = () => {
    setEditingBook(null);
    setTitle("");
    setAuthor("");
    setOpen(true);
  };

  const handleEditOpen = (book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setOpen(true);
  };

  const handleSave = () => {
    setError("");
    if (!title || !author) {
      setError("Please fill all fields");
      return;
    }

    const url = editingBook
      ? `http://localhost:5000/books/${editingBook.id}`
      : "http://localhost:5000/books";
    const method = editingBook ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, author }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(() => {
        setOpen(false);
        setEditingBook(null);
        fetchBooks();
      })
      .catch((err) => setError(err.message));
  };

  const requestBorrow = (bookId) => {
    fetch("http://localhost:5000/books/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message);
        }
        setRequestedBooks((prev) => [...prev, bookId]);
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
        setFilteredBooks((prev) => prev.filter((b) => b.id !== bookId));
        alert("Request sent ✅");
      })
      .catch((err) => alert(err.message));
  };

  // 👇 تابع سرچ
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredBooks(books);
      return;
    }

    const lower = searchTerm.toLowerCase();
    const result = books.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        b.author.toLowerCase().includes(lower)
    );
    setFilteredBooks(result);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, ml: 40 }}>
      {/* بالا - عنوان و دکمه اضافه کردن */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Book Store 📚</Typography>
        {role === "admin" && (
          <Button variant="contained" color="primary" onClick={handleAddOpen}>
            Add Book
          </Button>
        )}
      </Box>

      {/* بخش سرچ */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

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
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No books found 📭
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book.id} hover>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    {role === "admin" ? (
                      <>
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
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        disabled={requestedBooks.includes(book.id)}
                        onClick={() => requestBorrow(book.id)}
                      >
                        {requestedBooks.includes(book.id)
                          ? "Requested"
                          : "Request Borrow"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* دیالوگ افزودن/ویرایش کتاب */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingBook ? "Edit Book ✏️" : "Add Book ➕"}
        </DialogTitle>
        <DialogContent>
          {error && <Typography color="error">{error}</Typography>}
          <Box sx={{ mt: 2 }}>
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingBook ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default BooksPage;
