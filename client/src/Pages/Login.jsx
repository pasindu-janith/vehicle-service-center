import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import images from "../assets/assets";
import "./css/styles.css";
import toastr from "toastr";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const encodedValue = parts.pop().split(";").shift();
        return decodeURIComponent(encodedValue);
      }
      return null;
    };

    const remembered = getCookie("rememberUser");
    if (remembered) {
      setFormData({
        email: decodeURIComponent(remembered),
      });
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // This endpoint should verify the token in the cookie
        const response = await fetch(
          "http://localhost:4000/api/v1/user/authUser",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          navigate("/myaccount/dashboard");
        }
      } catch (error) {
        // Token invalid or expired - stay on login page
        console.log(error);
      }
    };
    
    verifyToken();
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email === "" || formData.password === "") {
      toastr.warning("Please fill all the fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Send data to backend API
      const response = await fetch("http://localhost:4000/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: rememberMe,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      if (data.token) {
        // Optionally store user info
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect to protected route
        navigate("/myaccount/dashboard");
      }
    } catch (error) {
      toastr.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="container-fluid">
      <div className="row">
        <div
          className="col-md-6 d-md-block d-none vh-100 position-fixed"
          style={{
            backgroundColor: "rgba(255, 0, 0, 0.7)",
            clipPath: "polygon(0% 0%, 88% 0%, 100% 100%, 0% 100%)",
          }}
        ></div>
        <div
          className="col-md-6 d-md-block d-none vh-100"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.6),rgba(0, 0, 0, 0.2)),url(${images.login})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            clipPath: "polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)",
          }}
        ></div>

        <div className="col-md-6 col-12 d-flex justify-content-center align-items-center mt-3">
          <div className="col-md-8 col-11 text-left">
            <Link to="/">
              <img
                src={images.logo}
                className="mb-4"
                style={{ width: "150px" }}
              />
            </Link>
            <h1 className="fw-bolder">Login</h1>
            <h3 className="mb-4">Login to your account</h3>
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control field"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control field"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember Me
                  </label>
                </div>
                <Link to="/login/forgot-password" className="text-decoration-none">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-danger w-100 buttons"
                disabled={isSubmitting}
              >
                Login
              </button>
            </form>

            {/* Divider */}
            <div className="text-center mt-4 mb-3">
              <span className="text-muted">Don't have an account?</span>
              <Link to="/signup/register" className="text-decoration-none ms-2">
                Sign Up
              </Link>
            </div>
            {/* <div className="d-flex align-items-center mb-3">
              <div className="border-bottom flex-grow-1"></div>
              <span className="px-3 text-muted">or</span>
              <div className="border-bottom flex-grow-1"></div>
            </div>
            <button className="btn btn-outline-secondary col-12 align-items-center buttons">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
                alt="Google Logo"
                style={{ width: "20px", height: "20px" }}
              />
              &nbsp;&nbsp;Login with Google
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
