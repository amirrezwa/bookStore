import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Divider,
} from "@mui/material";

function LentPage() {
  const token = localStorage.getItem("token");
  const [lentRecords, setLentRecords] = useState([]);

  const fetchLents = async () => {
    try {
      const res = await fetch("http://localhost:5000/books/borrowed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLentRecords(data);
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

  // گروه‌بندی بر اساس user_email برای نمایش مرتب
  const grouped = lentRecords.reduce((acc, rec) => {
    const key = rec.user_email;
    acc[key] = acc[key] || [];
    acc[key].push(rec);
    return acc;
  }, {});

  return (
    <Container maxWidth="md" sx={{ mt: 4, ml: 50 }}>
      <Typography variant="h4" gutterBottom>
        Lent Books — Your Lends 📚
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {Object.keys(grouped).length === 0 ? (
        <Typography>No lends found 📭</Typography>
      ) : (
        Object.entries(grouped).map(([userEmail, records]) => (
          <Box key={userEmail} sx={{ mb: 3 }}>
            <Typography variant="h6">{userEmail}</Typography>
            <List>
              {records.map((r) => (
                <ListItem
                  key={r.id}
                  sx={{
                    border: "1px solid #eee",
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: "#fafafa",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <ListItemText
                    primary={r.title}
                    secondary={
                      <>
                        <div>
                          Borrowed at:{" "}
                          {new Date(r.borrowed_at).toLocaleString()}
                        </div>
                        <div>Returned: {r.returned ? "Yes" : "No"}</div>
                      </>
                    }
                  />
                  <Box>
                    {!r.returned && (
                      <Button
                        variant="contained"
                        onClick={() => returnBook(r.id)}
                      >
                        Mark Returned
                      </Button>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        ))
      )}
    </Container>
  );
}

export default LentPage;
