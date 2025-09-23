import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
} from "@mui/material";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchUsers = () => {
    fetch("http://localhost:5000/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => fetchUsers(), []);

  const toggleRole = (email, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    fetch(`http://localhost:5000/auth/users/${email}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    }).then(() => fetchUsers());
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Users 👥
      </Typography>
      <List>
        {users.map((u) => (
          <ListItem
            key={u.email}
            sx={{
              border: "1px solid #eee",
              borderRadius: 2,
              mb: 1,
              bgcolor: "#fafafa",
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
        ))}
      </List>
    </Container>
  );
}

export default UsersPage;
