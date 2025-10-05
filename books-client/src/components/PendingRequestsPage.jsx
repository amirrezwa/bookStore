import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";

function PendingRequestsPage({ refreshFlag }) {
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);

  const fetchRequests = () => {
    fetch("http://localhost:5000/books/requests", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // فقط درخواست‌های pending
        const pending = data.filter((r) => r.status === "pending");
        setRequests(pending);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => fetchRequests(), [refreshFlag]);

  const approve = (id) => {
    fetch(`http://localhost:5000/books/requests/${id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => fetchRequests())
      .catch((err) => alert(err.message));
  };

  const reject = (id) => {
    fetch(`http://localhost:5000/books/requests/${id}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => fetchRequests())
      .catch((err) => alert(err.message));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, ml: 35 }}>
      <Typography variant="h4" gutterBottom>
        Pending Borrow Requests 📋
      </Typography>

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
                Requested At
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No pending requests 📭
                </TableCell>
              </TableRow>
            ) : (
              requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.userEmail}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>
                    {new Date(r.requestedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ mr: 1 }}
                      onClick={() => approve(r.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => reject(r.id)}
                    >
                      Reject
                    </Button>
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

export default PendingRequestsPage;
