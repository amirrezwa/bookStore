import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <AppBar
      position="fixed" // 👈 ثابت کردن در بالای صفحه
      sx={{ top: 0, left: 0, right: 0 }} // 👈 اطمینان از کل عرض صفحه
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Button color="inherit" onClick={() => navigate("/books")}>
            Books
          </Button>

          {role === "admin" && (
            <>
              <Button color="inherit" onClick={() => navigate("/add-book")}>
                Add Book
              </Button>
              <Button color="inherit" onClick={() => navigate("/users")}>
                Users
              </Button>
              <Button color="inherit" onClick={() => navigate("/borrow")}>
                Borrow (lend)
              </Button>
              <Button color="inherit" onClick={() => navigate("/lent")}>
                Lent
              </Button>
            </>
          )}

          {role === "user" && (
            <Button color="inherit" onClick={() => navigate("/my-borrows")}>
              My Borrowed
            </Button>
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
