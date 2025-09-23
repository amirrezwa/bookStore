import { useState } from "react";
import { Container, Typography, TextField, Button, Box } from "@mui/material";

function AddBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const addBook = (e) => {
    e.preventDefault();
    setError("");

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
        setTitle("");
        setAuthor("");
      })
      .catch((err) => setError(err.message));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Book ➕
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box component="form" onSubmit={addBook} sx={{ mt: 2 }}>
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
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Add Book
        </Button>
      </Box>
    </Container>
  );
}

export default AddBookPage;
