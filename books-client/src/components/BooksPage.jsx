import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

function BooksPage() {
  const [books, setBooks] = useState([]);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchBooks = () => {
    fetch("http://localhost:5000/books", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => fetchBooks(), []);

  const deleteBook = (id) => {
    fetch(`http://localhost:5000/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => fetchBooks());
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, ml: 50 }}>
      <Typography variant="h4" gutterBottom>
        Book Store 📚
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {books.length === 0 ? (
          <Typography>No books found 📭</Typography>
        ) : (
          books.map((book) => (
            <ListItem
              key={book.id}
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                mb: 1,
                bgcolor: "#fafafa",
                color: "black",
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
                    <IconButton edge="end" color="primary">
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
    </Container>
  );
}

export default BooksPage;
