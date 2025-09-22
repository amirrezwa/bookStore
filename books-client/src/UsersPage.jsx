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

  useEffect(() => {
    fetch("http://localhost:5000/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Users 👥
      </Typography>
      <List>
        {users.map((user) => (
          <ListItem key={user.email}>
            <ListItemText primary={user.email} secondary={user.role} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default UsersPage;
