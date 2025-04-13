import AdminPanel from "./pages/AdminPanel";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
