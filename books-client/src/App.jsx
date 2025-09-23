import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import BooksPage from "./BooksPage";
import UsersPage from "./UsersPage";
import AddBookPage from "./AddBookPage";
import BorrowPage from "./BorrowPage";
import AuthPage from "./AuthPage";
import BorrowedBooksPage from "./BorrowedBooksPage";
import LentPage from "./LentPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/add-book" element={<AddBookPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/borrow" element={<BorrowPage />} />
        <Route path="/my-borrows" element={<BorrowedBooksPage />} />
        <Route path="/lent" element={<LentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
