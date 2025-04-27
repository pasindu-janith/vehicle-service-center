import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Services from "./Pages/Services";
import SignUp from "./Pages/SignUp";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Dashboard from "./Pages/UserPanel";
import toastr from "toastr";
import ForgotPassword from "./Pages/ForgotPassword";
import { UserProvider } from "./Context/UserContext";

toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: true,
  positionClass: "toast-top-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

function App() {
  return (
    <>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/*" element={<ForgotPassword />} />
            <Route path="/signup/*" element={<SignUp />} />
            <Route path="/myaccount/*" element={<Dashboard />} />
          </Routes>
        </Router>
    </>
  );
}

export default App;
