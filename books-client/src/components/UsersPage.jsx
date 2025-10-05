import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  TextField,
} from "@mui/material";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const token = localStorage.getItem("token");

  // گرفتن لیست کاربران از سرور
  const fetchUsers = (emailQuery = "") => {
    let url = "http://localhost:5000/auth/users";
    if (emailQuery) url += `?email=${emailQuery}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data); // همه کاربران از جمله خودش
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => fetchUsers(), []);

  // تغییر نقش کاربر
  const toggleRole = (email, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    fetch(`http://localhost:5000/auth/users/${email}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    }).then(() => fetchUsers(searchEmail));
  };

  const handleSearch = () => {
    fetchUsers(searchEmail);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, ml: 40 }}>
      <Typography variant="h4" gutterBottom>
        Users 👥
      </Typography>

      {/* سرچ ایمیل */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Search by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <List>
        {users.length === 0 ? (
          <Typography>No users found 📭</Typography>
        ) : (
          users.map((u) => (
            <ListItem
              key={u.email}
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                mb: 1,
                bgcolor: "#fafafa",
                color: "black",
              }}
            >
              <ListItemText primary={u.email} secondary={u.role} />
              <Box>
                <Button
                  variant="contained"
                  onClick={() => toggleRole(u.email, u.role)}
                >
                  Toggle Role
                </Button>
              </Box>
            </ListItem>
          ))
        )}
      </List>
    </Container>
  );
}

export default UsersPage;
