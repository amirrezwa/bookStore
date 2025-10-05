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
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";

function LentPage() {
  const token = localStorage.getItem("token");
  const [lentRecords, setLentRecords] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");

  const fetchLents = async (email = "") => {
    try {
      const res = await fetch(
        `http://localhost:5000/books/borrowed${email ? `?email=${email}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      // فقط درخواست‌های approved یا returned
      const filtered = data.filter(
        (r) => r.status === "approved" || r.status === "returned"
      );
      setLentRecords(filtered);
    } catch (err) {
      console.error(err);
      setLentRecords([]);
    }
  };

  useEffect(() => {
    fetchLents();
  }, []);

  const returnBook = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/books/return/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to return");
      await fetchLents();
      alert("Book returned ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to return book");
    }
  };

  const handleSearch = () => {
    fetchLents(searchEmail);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, ml: 35 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>
        Lent Books — Your Lends 📚
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Search bar */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <input
          type="text"
          placeholder="Search by user email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                User Email
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Book Title
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Borrowed At
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Returned
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lentRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No lends found 📭
                </TableCell>
              </TableRow>
            ) : (
              lentRecords.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.userEmail}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>
                    {new Date(r.requestedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {r.status === "returned" ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </TableCell>
                  <TableCell>
                    {r.status !== "returned" && (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => returnBook(r.id)}
                        sx={{
                          textTransform: "none",
                          "&:hover": { bgcolor: "#2e7d32" },
                        }}
                      >
                        Mark Returned
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default LentPage;
