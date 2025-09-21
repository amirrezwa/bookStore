import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";

function BorrowPage() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [borrowedList, setBorrowedList] = useState([]);

  // دریافت کتاب‌ها
  const fetchBooks = async () => {
    try {
      const res = await fetch("http://localhost:5000/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // دریافت لیست کتاب‌های قرض گرفته شده
  const fetchBorrowed = async () => {
    try {
      const res = await fetch("http://localhost:5000/books/borrowed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBorrowedList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // قرض دادن کتاب به یوزر
  const borrowBook = async () => {
    if (!selectedUser || !selectedBook) return;

    const book = books.find((b) => b.id === selectedBook);
    if (!book) return;

    try {
      await fetch("http://localhost:5000/books/borrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail: selectedUser, bookId: selectedBook }),
      });

      // اضافه کردن فوری به borrowedList برای نمایش لحظه‌ای
      setBorrowedList((prev) => [
        ...prev,
        {
          borrow_id: Math.random().toString(36).substr(2, 9), // id موقت
          title: book.title,
          user_email: selectedUser,
          returned: false,
        },
      ]);

      // ریست کردن انتخاب‌ها
      setSelectedBook("");
      setSelectedUser("");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchBorrowed();

    // نمونه یوزرها، می‌تونی بعداً از بک‌اند بگیری
    setUsers(["user1@example.com", "user2@example.com", "admin@example.com"]);
  }, []);

  return (
    <Container sx={{ mt: 3, ml: 25 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Borrow Books 📚
        </Typography>

        {/* فرم قرض دادن کتاب */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Select User</MenuItem>
            {users.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Select Book</MenuItem>
            {books.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.title}
              </MenuItem>
            ))}
          </Select>
          <Button variant="contained" onClick={borrowBook}>
            Borrow
          </Button>
        </Box>

        {/* نمایش لحظه‌ای کتاب‌های قرض گرفته شده */}
        <Typography variant="h6">Borrowed Books List 📋</Typography>
        <List>
          {borrowedList.length === 0 && (
            <Typography align="center" color="text.secondary">
              No borrowed books yet 📭
            </Typography>
          )}
          {borrowedList.map((b) => (
            <ListItem key={b.borrow_id}>
              <ListItemText
                primary={`${b.title} -> ${b.user_email}`}
                secondary={b.returned ? "Returned ✅" : "Borrowed ⏳"}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default BorrowPage;
