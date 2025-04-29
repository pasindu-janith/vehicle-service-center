import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import images from "../Assets/assets";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/Navbar.css";
import { CgProfile } from "react-icons/cg";
import { CiLogout, CiSettings } from "react-icons/ci";
import { div } from "framer-motion/client";

const NavbarUserPanel = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      // This endpoint should verify the token in the cookie
      const response = await fetch("http://localhost:4000/api/v1/user/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        navigate("/login");
      }
    } catch (error) {
      // Token invalid or expired - stay on login page
      console.log(error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-color pb-2 pt-2 mb-2 ms-3 me-3 rounded">
      <div className="container">
        {/* Logo on the Left */}
        <a className="navbar-brand" href="/">
          <img src={images.logo} alt="Logo" style={{ height: "55px" }} />
        </a>

        {/* Toggle Button for Mobile View */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleSidebar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-center d-none d-lg-flex">
          <ul className="navbar-nav fw-bold text-black">
            <li className="nav-item me-4">
              <Link className="nav-link roboto" to="/myaccount/dashboard">
                Dashboard
              </Link>
            </li>
            <li className="nav-item me-4">
              <Link className="nav-link roboto" to="/myaccount/reservations">
                Reservations
              </Link>
            </li>
            <li className="nav-item me-4">
              <Link to="/myaccount/myvehicle" className="nav-link roboto">
                My Vehicles
              </Link>
            </li>
            <li className="nav-item me-4">
              <Link className="nav-link roboto" to="/myaccount/payments">
                Payments
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link roboto" to="/myaccount/settings">
                Settings
              </Link>
            </li>
          </ul>
        </div>

        <div className="dropdown" ref={dropdownRef}>
          {/* Profile Button */}
          <button
            className="btn btn-white dropdown-toggle d-flex align-items-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            <CgProfile size={30} className="me-2" />
            Pasindu Janith
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <ul
              className="dropdown-menu show position-absolute"
              style={{ right: 0 }}
            >
              <li>
                <Link className="dropdown-item" to="/myaccount/settings">
                  <CiSettings size={25} /> Settings
                </Link>
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={logout}>
                  <CiLogout size={25} /> Logout
                </button>
              </li>
            </ul>
          )}
        </div>
        {/* Sidebar for Mobile View */}
        <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
          <button className="btn-close" onClick={toggleSidebar}></button>
          <ul className="list-unstyled">
            <li>
              <Link to="/myaccount/dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/myaccount/reservations" className="nav-link">
                Reservations
              </Link>
            </li>
            <li>
              <Link to="/myaccount/myvehicle" className="nav-link">
                My Vehicles
              </Link>
            </li>
            <li>
              <Link to="#expertise" className="nav-link">
                Payments
              </Link>
            </li>
            <li>
              <Link to="/myaccount/settings" className="nav-link">
                Settings
              </Link>
            </li>
          </ul>
        </div>

        {/* Overlay when Sidebar is active */}
        {isSidebarOpen && (
          <div className="overlay" onClick={toggleSidebar}></div>
        )}
      </div>
    </nav>
  );
};

export default NavbarUserPanel;
