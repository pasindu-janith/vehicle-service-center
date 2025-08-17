import { Link, useLocation } from "react-router-dom";
import images from "./../assets/assets";
import { useState } from "react";
import { BASE_URL } from "../config.js";

const Sidebar = () => {
  const location = useLocation();
  const serviceOrderPaths = ["/ongoing", "/pending", "/completed"];
  // Check if the current path is one of the service order paths
  const [isServiceOrderActive, setServiceOrderActive] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${BASE_URL}/logout`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include credentials for cross-origin requests
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.removeItem("admin");
      window.location.href = "/login"; // Redirect to login page after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand Logo */}
      <a href="index3.html" className="brand-link">
        <span className="brand-text font-weight-light">Shan Automobile</span>
      </a>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <img
              src={images.profile}
              className="img-circle elevation-2"
              alt="User Image"
            />
          </div>
          <div className="info">
            <Link to="profile" className="d-block">
              Admin User
            </Link>
          </div>
        </div>
        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
            data-accordion="false"
          >
            <li className="nav-item">
              <Link
                to="/dashboard"
                className={`nav-link ${
                  location.pathname === "/dashboard" ? "active" : ""
                }`}
              >
                <i className="nav-icon fas fa-tachometer-alt" />
                <p>Dashboard</p>
              </Link>
            </li>
            <li
              className={`nav-item ${isServiceOrderActive ? "menu-open" : ""}`}
            >
              <a
                className={`nav-link ${
                  serviceOrderPaths.includes(location.pathname) ? "active" : ""
                }`}
                onClick={() => setServiceOrderActive(!isServiceOrderActive)}
                style={{ cursor: "pointer" }}
              >
                <i className="nav-icon fas fa-toolbox" />
                <p>
                  Service Orders
                  <i className="fas fa-angle-left right" />
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link
                    to="/ongoing"
                    className={`nav-link ${
                      location.pathname === "/ongoing" ? "active" : ""
                    }`}
                  >
                    <i className="far fa-circle nav-icon" />
                    <p>Ongoing</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/pending"
                    className={`nav-link ${
                      location.pathname === "/pending" ? "active" : ""
                    }`}
                  >
                    <i className="far fa-circle nav-icon" />
                    <p>Pending</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/completed"
                    className={`nav-link ${
                      location.pathname === "/completed" ? "active" : ""
                    }`}
                  >
                    <i className="far fa-circle nav-icon" />
                    <p>Completed</p>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link
                to="/reservations"
                className={`nav-link ${
                  location.pathname === "/reservations" ? "active" : ""
                }`}
              >
                <i className="nav-icon fas fa-book" />
                <p>Reservations</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/calendar"
                className={`nav-link ${
                  location.pathname === "/calendar" ? "active" : ""
                }`}
              >
                <i className="nav-icon fas fa-calendar" />
                <p>Calendar</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/payment"
                className={`nav-link ${
                  location.pathname === "/payment" ? "active" : ""
                }`}
              >
                <i className="nav-icon fas fa-credit-card" />
                <p>Payments</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/customers"
                className={`nav-link ${
                  location.pathname === "/customers" ? "active" : ""
                }`}
              >
                <i className="nav-icon fas fa-users" />
                <p>Customers</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/vehicles"
                className={`nav-link ${
                  location.pathname === "/vehicles" ? "active" : ""
                }`}
              >
                <i className="nav-icon fas fa-car" />
                <p>Vehicles</p>
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link to="/message" className="nav-link">
                <i className="nav-icon fas fa-regular fa-comment" />
                <p>Messages</p>
              </Link>
            </li> */}
            {/* <li className="nav-item">
              <Link to="/login" className="nav-link">
                <i className="nav-icon fas fa-chart-pie" />
                <p>Progress</p>
              </Link>
            </li> */}
            <li className="nav-item">
              <Link
                to="/profile"
                className={`nav-link ${
                  location.pathname === "/profile" ? "active" : ""
                }`}
              >
                <i className="nav-icon fas fa-user-cog" />
                <p>Settings</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link onClick={handleLogout} className="nav-link">
                <i className="nav-icon fas fa-sign-out-alt" />
                <p>Log out</p>
              </Link>
            </li>
          </ul>
        </nav>
        {/* /.sidebar-menu */}
      </div>
      {/* /.sidebar */}
    </aside>
  );
};

export default Sidebar;
