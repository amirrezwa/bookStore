import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./AuthPage";
import BooksPage from "./BooksPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/books" element={<BooksPage />} />
      </Routes>
    </Router>
  );
}

export default App;
