import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/forms.css";
import toastr from "toastr";
import BASE_URL from "../config.js";

const PasswordForgot = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  });

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setIsDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsDisabled(true);
    setTimer(60); // Start 60-second timer

    try {
      const response = await fetch(
        `${BASE_URL}/forgot-password-process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        toastr.success("Password reset link sent successfully!");
      } else {
        toastr.error(data.message || "Failed to resend OTP", "Error");
        setIsDisabled(false);
        setTimer(0);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toastr.error("Something went wrong. Please try again.");
      setIsDisabled(false);
      setTimer(0);
    }
  };

  const goToLogin = () => {
    navigate("/login"); // Navigate to login page
  };

  return (
    <div className="mb-4">
      <h2 className="mb-3">Forgot Password</h2>
      
      <div className="card shadow-lg p-4"><p style={{ fontSize: "17px" }}>
        Enter your registered email to receive a password reset link.
      </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group d-flex align-items-center">
            <input
              type="email"
              className="form-control field me-2"
              id="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              value={formData.email}
              required
            />
            <button
              type="submit"
              className="btn btn-danger"
              disabled={isDisabled}
            >
              {isDisabled ? `Wait ${timer}s` : "Send"}
            </button>
          </div>
        </form>
      </div>
      <div className="text-center mt-3">
        <div className="d-flex align-items-center mb-3 mt-4">
          <div className="border-bottom flex-grow-1"></div>
          <span className="px-3 text-muted">If password is remembered</span>
          <div className="border-bottom flex-grow-1"></div>
        </div>

        <button onClick={goToLogin} className="btn btn-danger buttons w-100">
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default PasswordForgot;
