import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./AuthPage";
import BooksPage from "./BooksPage";
import BorrowPage from "./BorrowPage";

function App() {
  const role = localStorage.getItem("role");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/books" element={<BooksPage />} />
        {role === "admin" && <Route path="/borrow" element={<BorrowPage />} />}
      </Routes>
    </Router>
  );
}

export default App;
