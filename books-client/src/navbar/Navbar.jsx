import {
  AppBar,
  Toolbar,
  Button,
  Box,
  MenuItem,
  Menu,
  Avatar,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email") || "User";
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (!token) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/");
  };

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1976d2",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* دکمه‌ها */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            color="inherit"
            onClick={() => navigate("/books")}
            sx={{
              fontWeight: location.pathname === "/books" ? "bold" : "normal",
              color: location.pathname === "/books" ? "#000000" : "#fff",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            Books
          </Button>

          {role === "admin" && (
            <>
              <Button
                color="inherit"
                onClick={() => navigate("/users")}
                sx={{
                  fontWeight:
                    location.pathname === "/users" ? "bold" : "normal",
                  color: location.pathname === "/users" ? "#000000" : "#fff",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                Users
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate("/pendingrequestspage")}
                sx={{
                  fontWeight:
                    location.pathname === "/pendingrequestspage"
                      ? "bold"
                      : "normal",
                  color:
                    location.pathname === "/pendingrequestspage"
                      ? "#000000"
                      : "#fff",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                pendingrequestspage
              </Button>

              <Button
                color="inherit"
                onClick={() => navigate("/lent")}
                sx={{
                  fontWeight: location.pathname === "/lent" ? "bold" : "normal",
                  color: location.pathname === "/lent" ? "#ffeb3b" : "#fff",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                Lent
              </Button>
            </>
          )}

          {role === "user" && (
            <Button
              color="inherit"
              onClick={() => navigate("/my-borrows")}
              sx={{
                fontWeight:
                  location.pathname === "/my-borrows" ? "bold" : "normal",
                color: location.pathname === "/my-borrows" ? "#000000" : "#fff",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              My Borrowed
            </Button>
          )}
        </Box>

        {/* پروفایل کاربر */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: "#fff", fontWeight: "500" }}>
            {email}
          </Typography>
          <Avatar
            sx={{
              cursor: "pointer",
              bgcolor: "#ffffff",
              color: "#1976d2",
              fontWeight: "bold",
            }}
            onClick={handleOpen}
          >
            {email[0].toUpperCase()}
          </Avatar>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Log Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
