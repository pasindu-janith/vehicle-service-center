import { useNavigate, Link } from "react-router-dom";
import "./styles/Navbar.css"; // Import your custom CSS file for sidebar styles
import images from "../assets/assets"; // Import your images
const ServiceNavbar = () => {
  const navigate = useNavigate(); // Hook for navigation

  const goToLogin = () => {
    navigate("/login"); // Navigate to login page
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container">
        {/* Breadcrumb on the left */}
        <a className="navbar-brand" href=" ">
          <img src={images.logo} alt="Logo" style={{ height: '55px' }} />
        </a>
        

        {/* Buttons on the right */}
        <div className="d-flex">
        <nav aria-label="breadcrumb" className="me-auto">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Service Type
            </li>
          </ol>
        </nav>
        </div>
      </div>
    </nav>
  );
};

export default ServiceNavbar;
