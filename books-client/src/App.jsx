import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import BooksPage from "./BooksPage";
import UsersPage from "./UsersPage";
import AddBookPage from "./AddBookPage";
import AuthPage from "./AuthPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/add-book" element={<AddBookPage />} />
      </Routes>
    </Router>
  );
}

export default App;
