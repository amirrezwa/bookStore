import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

function BorrowedBooksPage() {
  const token = localStorage.getItem("token");
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  const fetchBorrowedBooks = async () => {
    try {
      const res = await fetch("http://localhost:5000/books/borrowed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
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
    <Container maxWidth="md" sx={{ mt: 4, ml: 50 }}>
      <Typography variant="h4" gutterBottom>
        My Borrowed Books 📚
      </Typography>
      <List>
        {borrowedBooks.length === 0 ? (
          <Typography>No borrowed books found 📭</Typography>
        ) : (
          borrowedBooks.map((b) => (
            <ListItem
              key={b.id}
              sx={{ border: "1px solid #eee", mb: 1, borderRadius: 2 }}
            >
              <ListItemText
                primary={b.title}
                secondary={
                  <>
                    <div>
                      Borrowed at: {new Date(b.borrowed_at).toLocaleString()}
                    </div>
                    <div>Returned: {b.returned ? "Yes" : "No"}</div>
                    <div>Lender: {b.lender_email}</div>
                  </>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Container>
  );
}

export default BorrowedBooksPage;
