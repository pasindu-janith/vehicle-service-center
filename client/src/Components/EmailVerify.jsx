import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import images from "../assets/assets";
import "./styles/forms.css";
import toastr from "toastr";
import BASE_URL from "../config.js";

const EmailVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!location.state) {
    navigate("/signup/register"); 
  }

  const { email } = location.state || {};
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const resendEmail = async () => {
    if (timer > 0) return;
    setIsResending(true);
    try {
      const response = await fetch(
        `${BASE_URL}/resend-verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        toastr.success("New verification Email sent successfully!", "Success");
        setTimer(60);
      } else {
        toastr.error(data.message || "Failed to resend OTP", "Error");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toastr.error("Something went wrong. Please try again.", "Error");
    } finally {
      setIsResending(false);
    }
  };

  const goToLogin = () => {
    navigate("/login"); // Navigate to login page
  };

  return (
    <div className="text-center mb-4">
      <h2>Email Verification</h2>
      <img
        src={images.emailicon}
        alt=""
        className="mb-3 mt-2"
        style={{ width: "110px" }}
      />
      <p style={{ fontSize: "17px" }}>
        Click on the verification link at the mail sent by us to your email:{" "}
        <b>{email}</b> If the email is not in your inbox, please check your spam
        folder.
      </p>
      <div className="text-center mt-3">
        {timer > 0 ? (
          <p>Resend Email in {timer} seconds</p>
        ) : (
          <button
            className="btn btn-link p-0"
            onClick={resendEmail}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>
        )}

        <div className="d-flex align-items-center mb-3 mt-4">
          <div className="border-bottom flex-grow-1"></div>
          <span className="px-3 text-muted">If Email is verified</span>
          <div className="border-bottom flex-grow-1"></div>
        </div>

        <button onClick={goToLogin} className="btn btn-danger buttons w-100">
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
