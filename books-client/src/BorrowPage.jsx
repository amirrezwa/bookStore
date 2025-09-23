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
    fetch("http://localhost:5000/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data));

    fetch("http://localhost:5000/books", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBooks(data));
  }, []);

  const borrowBook = () => {
    fetch("http://localhost:5000/books/borrow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userEmail: selectedUser, bookId: selectedBook }),
    }).then(() => alert("Book borrowed ✅"));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
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
