import { Link } from "react-router-dom";
import images from "./../assets/assets";

const Sidebar = () => {

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/v1/admin/logout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include credentials for cross-origin requests
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.removeItem("admin");
      window.location.href = "/login"; // Redirect to login page after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand Logo */}
      <a href="index3.html" className="brand-link">
        <span className="brand-text font-weight-light">
          Auto Lanka Services
        </span>
      </a>
      {/* Sidebar */}
      <div className="sidebar">
        {/* Sidebar user panel (optional) */}
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <img
              src={images.profile}
              className="img-circle elevation-2"
              alt="User Image"
            />
          </div>
          <div className="info">
            <Link to='profile' className="d-block">
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
            {/* Add icons to the links using the .nav-icon class
         with font-awesome or any other icon font library */}
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link active">
                <i className="nav-icon fas fa-tachometer-alt" />
                <p>Dashboard</p>
              </Link>
            </li>

            <li className="nav-item">
              <a href="#" className="nav-link">
                <i className="nav-icon fas fa-toolbox" />
                <p>
                  Service Orders
                  <i className="fas fa-angle-left right" />
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link to="/ongoing" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Ongoing</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/pending" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Pending</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/completed" className="nav-link">
                    <i className="far fa-circle nav-icon" />
                    <p>Completed</p>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link to="/reservations" className="nav-link">
                <i className="nav-icon fas fa-book" />
                <p>Reservations</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/calender" className="nav-link">
                <i className="nav-icon fas fa-calendar" />
                <p>Calendar</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/payment" className="nav-link">
                <i className="nav-icon fas fa-credit-card" />
                <p>Payments</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/customers" className="nav-link">
                <i className="nav-icon fas fa-users" />
                <p>Customers</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/vehicles" className="nav-link">
                <i className="nav-icon fas fa-car" />
                <p>Vehicles</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/message" className="nav-link">
                <i className="nav-icon fas fa-regular fa-comment" />
                <p>
                  Messages
                </p>
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link to="/login" className="nav-link">
                <i className="nav-icon fas fa-chart-pie" />
                <p>Progress</p>
              </Link>
            </li> */}
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
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
