import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./navbar/Navbar";
import BooksPage from "./components/BooksPage";
import UsersPage from "./components/UsersPage";
import AddBookPage from "./components/AddBookPage";
import BorrowPage from "./components/BorrowPage";
import AuthPage from "./auth/AuthPage";
import BorrowedBooksPage from "./components/BorrowedBooksPage";
import LentPage from "./components/LentPage";
import PendingRequestsPage from "./components/PendingRequestsPage";

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
        <Route path="/pendingrequestspage" element={<PendingRequestsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
