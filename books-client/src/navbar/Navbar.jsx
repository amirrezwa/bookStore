import {
  AppBar,
  Toolbar,
  Button,
  Box,
  MenuItem,
  Menu,
  Avatar,
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

  const getButtonColor = (path) => {
    return location.pathname === path ? "secondary" : "inherit";
  };

  return (
    <AppBar position="fixed" sx={{ top: 0, left: 0, right: 0 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Button
            color={getButtonColor("/books")}
            onClick={() => navigate("/books")}
          >
            Books
          </Button>

          {role === "admin" && (
            <>
              <Button
                color={getButtonColor("/add-book")}
                onClick={() => navigate("/add-book")}
              >
                Add Book
              </Button>
              <Button
                color={getButtonColor("/users")}
                onClick={() => navigate("/users")}
              >
                Users
              </Button>
              <Button
                color={getButtonColor("/borrow")}
                onClick={() => navigate("/borrow")}
              >
                Borrow (lend)
              </Button>
              <Button
                color={getButtonColor("/lent")}
                onClick={() => navigate("/lent")}
              >
                Lent
              </Button>
            </>
          )}

          {role === "user" && (
            <Button
              color={getButtonColor("/my-borrows")}
              onClick={() => navigate("/my-borrows")}
            >
              My Borrowed
            </Button>
          )}
        </Box>

        {/* پروفایل کاربر */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <span>{email || "User"}</span>{" "}
          <Avatar sx={{ cursor: "pointer" }} onClick={handleOpen} />
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ cursor: "pointer" }} />
              Log Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
