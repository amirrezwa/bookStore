import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Box,
  Divider,
} from "@mui/material";

function BorrowedBooksPage() {
  const token = localStorage.getItem("token");
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  const fetchBorrowedBooks = async () => {
    try {
      const res = await fetch("http://localhost:5000/books/borrowed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch borrowed books");
      const data = await res.json();
      setBorrowedBooks(data);
    } catch (err) {
      console.error(err);
      setBorrowedBooks([]);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4, ml: 40 }}>
      <Typography variant="h4" gutterBottom>
        My Borrowed Books 📚
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {borrowedBooks.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          You haven't borrowed any books yet 📭
        </Typography>
      ) : (
        <List>
          {borrowedBooks.map((b) => (
            <Paper
              key={b.id}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: "#fafafa",
              }}
            >
              <ListItem disablePadding>
                <ListItemText
                  primary={b.title}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <div>
                        Borrowed at: {new Date(b.borrowed_at).toLocaleString()}
                      </div>
                      <div>Returned: {b.returned ? "Yes ✅" : "No ❌"}</div>
                      <div>Lender: {b.lender_email}</div>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Container>
  );
}

export default BorrowedBooksPage;
