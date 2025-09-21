import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 یادت نره
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
} from "@mui/material";

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // 👈 برای ریدایرکت

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? "http://localhost:5000/auth/login"
      : "http://localhost:5000/auth/register";

    const body = isLogin
      ? { email, password }
      : {
          email,
          password,
          role: email === "admin@example.com" ? "admin" : "user",
        };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("Response:", res.status, data);

    if (res.ok) {
      if (isLogin) {
        console.log("Login success, navigating..."); // 👈 تست
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        navigate("/books");
      } else {
        setMessage("Registered successfully ✅");
      }
    } else {
      console.log("Login failed:", data); // 👈 تست
      setMessage(data.message || "Error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {isLogin ? "Login 🔐" : "Register 📝"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {isLogin ? "Login" : "Register"}
            </Button>
          </Box>
        </form>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "Need an account? Register"
              : "Already have an account? Login"}
          </Button>
        </Box>
        {message && (
          <Typography align="center" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default AuthPage;
