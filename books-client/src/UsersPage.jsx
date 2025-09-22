import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "admin") return;

    fetch("http://localhost:5000/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, [token, role]);

  if (role !== "admin") {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography align="center">
          فقط ادمین می‌تواند کاربران را ببیند ❌
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Users 👥
      </Typography>
      <List>
        {users.length === 0 ? (
          <Typography align="center" color="text.secondary">
            هیچ کاربری لاگین نکرده 📭
          </Typography>
        ) : (
          users.map((user) => (
            <ListItem key={user.email}>
              <ListItemText primary={user.email} secondary={user.role} />
            </ListItem>
          ))
        )}
      </List>
    </Container>
  );
}

export default UsersPage;
