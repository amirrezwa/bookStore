import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
} from "@mui/material";

function BorrowPage() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedBook, setSelectedBook] = useState("");

  useEffect(() => {
    // گرفتن لیست کاربران
    fetch("http://localhost:5000/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));

    // گرفتن لیست کتاب‌ها
    fetch("http://localhost:5000/books", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error(err));
  }, [token]);

  const borrowBook = () => {
    if (!selectedUser || !selectedBook) {
      alert("Please select both user and book");
      return;
    }

    fetch("http://localhost:5000/books/borrow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userEmail: selectedUser, bookId: selectedBook }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to borrow book");
        return res.json();
      })
      .then(() => {
        alert("Book borrowed ✅");
        // حذف کتاب قرض داده شده از لیست
        setBooks((prevBooks) => prevBooks.filter((b) => b.id !== selectedBook));
        setSelectedBook(""); // ریست انتخاب کتاب
      })
      .catch((err) => alert(err.message));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, ml: 50 }}>
      <Typography variant="h4" gutterBottom>
        Borrow Books 📚
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          select
          label="Select User"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          {users.map((u) => (
            <MenuItem key={u.email} value={u.email}>
              {u.email}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Select Book"
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
        >
          {books.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.title}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={borrowBook}>
          Borrow
        </Button>
      </Box>
    </Container>
  );
}

export default BorrowPage;
