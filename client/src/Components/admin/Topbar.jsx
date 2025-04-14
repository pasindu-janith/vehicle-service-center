import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";

const Topbar = ({ onToggleSidebar }) => {
  return (
    <nav className="navbar navbar-light bg-light px-4 d-flex justify-content-between">
      <button className="btn btn-light" onClick={onToggleSidebar}>
        <FaBars />
      </button>
      <div className="d-flex align-items-center">
        <button className="btn btn-light me-3">
          <FaBell />
        </button>
        <FaUserCircle size={28} />
      </div>
    </nav>
  );
};

export default Topbar;
