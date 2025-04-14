import { Link } from "react-router-dom";
import { FaHome, FaFileAlt, FaCog } from "react-icons/fa";
import "./adminpanel.css"; // Add a separate CSS file for styling

const Sidebar = ({ isCollapsed }) => {
  return (
    <div className={`sidebar bg-dark text-white ${isCollapsed ? "collapsed" : ""}`}>
      <div className={`sidebar-header text-center py-3 ${isCollapsed ? "d-none" : ""}`}>
        <h4>Admin Dashboard</h4>
      </div>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link to="/" className="nav-link text-white d-flex align-items-center">
            <FaHome className="sidebar-icon" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/reports" className="nav-link text-white d-flex align-items-center">
            <FaFileAlt className="sidebar-icon" />
            {!isCollapsed && <span>Reports</span>}
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/settings" className="nav-link text-white d-flex align-items-center">
            <FaCog className="sidebar-icon" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
