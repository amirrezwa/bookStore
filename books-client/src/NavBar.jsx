import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // اگه لاگین نکرده باشه، Navbar نمایش داده نشه
  if (!token) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          {/* همه نقش‌ها می‌تونن کتاب‌ها رو ببینن */}
          <Button color="inherit" onClick={() => navigate("/books")}>
            Books
          </Button>

          {/* فقط admin می‌تونه کاربران و افزودن کتاب رو ببینه */}
          {role === "admin" && (
            <>
              <Button color="inherit" onClick={() => navigate("/users")}>
                Users
              </Button>
              <Button color="inherit" onClick={() => navigate("/add-book")}>
                Add Book
              </Button>
            </>
          )}
        </Box>

        <Button color="inherit" onClick={logout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
