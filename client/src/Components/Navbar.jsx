import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import images from '../Assets/assets';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Navbar.css';

const CustomNavbar = ({activeSection}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleScroll = (e, sectionId) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const navigate = useNavigate(); // Hook for navigation

  const goToLogin = () => {
    navigate('/login'); // Navigate to login page
  };
  
  const goToSignUp = () => {
    navigate('/signup/register'); // Navigate to signup page
  };
  return (
    <nav className="navbar navbar-expand-lg fixed-top navbar-color pb-2 pt-1 mt-2 mb-2 ms-3 me-3 rounded">
      <div className="container">
        {/* Logo on the Left */}
        <a className="navbar-brand" href=" ">
          <img src={images.logo} alt="Logo" style={{ height: '55px' }} />
        </a>

        {/* Toggle Button for Mobile View */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleSidebar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Centered Links for Desktop */}
        <div className="collapse navbar-collapse justify-content-center d-none d-lg-flex">
          <ul className="navbar-nav fw-bold text-black">
            <li className="nav-item me-4">
              <a className={`nav-link roboto ${activeSection === 'carouselExampleFade' ? 'active-link' : ''}`} href="#carouselExampleFade" onClick={(e) => handleScroll(e, 'carouselExampleFade')}>Home</a>
            </li>
            <li className="nav-item me-4">
              <a className={`nav-link roboto ${activeSection === 'services' ? 'active-link' : ''}`} href="#services" onClick={(e) => handleScroll(e, 'services')}>Our Services</a>
            </li>
            <li className="nav-item me-4">
              <a className={`nav-link roboto ${activeSection === 'aboutus' ? 'active-link' : ''}`} href="#aboutus" onClick={(e) => handleScroll(e, 'aboutus')}>About us</a>
            </li>
            <li className="nav-item me-4">
              <a className={`nav-link roboto ${activeSection === 'expertise' ? 'active-link' : ''}`} href="#expertise" onClick={(e) => handleScroll(e, 'expertise')}>Our Expertise</a>
            </li>
            <li className="nav-item">
              <a className={`nav-link roboto ${activeSection === 'contactus' ? 'active-link' : ''}`} href="#contactus" onClick={(e) => handleScroll(e, 'contactus')}>Contact Us</a>
            </li>
          </ul>
        </div>

        {/* Right-Aligned Login & Register Buttons for Desktop */}
        <div className="collapse navbar-collapse justify-content-end d-none d-lg-flex">
          <button className="btn btn-danger rounded-pill ps-3 pe-3 pt-2 pb-2 me-2" onClick={goToLogin} type="button">Login</button>
          <button className="btn btn-danger rounded-pill ps-3 pe-3 pt-2 pb-2" onClick={goToSignUp} type="button">Register</button>
        </div>

        {/* Sidebar for Mobile View */}
        <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          <button className="btn-close" onClick={toggleSidebar}></button>
          <ul className="list-unstyled">
            <li>
              <a href="#carouselExampleFade" className="nav-link">Home</a>
            </li>
            <li>
              <a href="#services" className="nav-link">Our Services</a>
            </li>
            <li>
              <a href="#aboutus" className="nav-link">About us</a>
            </li>
            <li>
              <a href="#expertise" className="nav-link">Our Expertise</a>
            </li>
            <li>
              <a href="#contactus" className="nav-link">Contact Us</a>
            </li>
          </ul>
          <div className="d-flex flex-column mt-3">
            <button className="btn btn-outline-primary mb-2" onClick={goToLogin} type="button">Login</button>
            <button className="btn btn-primary" type="button">Register Now</button>
          </div>
        </div>

        {/* Overlay when Sidebar is active */}
        {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
      </div>
    </nav>
  );
};

export default CustomNavbar;
