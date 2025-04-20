import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import images from "../assets/assets";
import "./styles/forms.css";
import toastr from "toastr";

const PasswordReset = () => {
  const navigate = useNavigate();
  const [isTokenValid, setIsTokenValid] = useState(false);
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  const [formData, setFormData] = useState({
    password: "",
    repassword: "",
  });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/user/verify-password-token?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setIsTokenValid(true);
        } else {
          toastr.error(data.message || "Failed to verify token", "Error");
        }
      } catch (error) {
        console.error("Verify token error:", error);
        toastr.error("Something went wrong. Please try again.", "Error");
      }
    };
    verifyToken();
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.repassword) {
      toastr.error("Passwords do not match");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:4000/api/v1/user/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            password: formData.password,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        toastr.success("New password updated successfully!");
        navigate("/login");
      } else {
        toastr.error(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const goToLogin = () => {
    navigate("/login"); // Navigate to login page
  };

  return (
    <div className="mb-4">
      <h2 className="mb-3">Reset Password</h2>
      {isTokenValid ? (
        <div>
          <div className="container mt-4">
            <div className="card shadow-lg p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-bold">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control field"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    value={formData.password}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="repassword" className="form-label fw-bold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control field"
                    id="repassword"
                    name="repassword"
                    onChange={handleChange}
                    value={formData.repassword}
                    placeholder="Re-enter new password"
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center mt-3">
          <img src={images.erroricon} />
          <h3>Invalid or expired token</h3>
          <p>
            The token you are trying to use is either invalid or has expired.
          </p>
          <button className="btn btn-danger" onClick={goToLogin}>
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default PasswordReset;
