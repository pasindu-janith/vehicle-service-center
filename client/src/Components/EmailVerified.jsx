import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import images from "../assets/assets";
import "./styles/forms.css";
import toastr from "toastr";

const EmailVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Then add your navigation logic

  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  if (!token) {
    navigate("/signup/register");
  }
  const [success, setSuccess] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/user/emailverify?token=${encodeURIComponent(
            token
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setSuccess(true);
        }
        setMessage(data.message);
      } catch (error) {
        console.log(error);
      }
    };
    verifyEmail();
  });

  const goToLogin = () => {
    navigate("/login"); // Navigate to login page
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const resendEmail = async (e) => {
    e.preventDefault();
    setIsResending(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/v1/user/resend-verify-email",
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
      if (response.ok) {
        setSent(true);
      } else {
        setIsResending(false);
        toastr.error("Failed to resend verification email");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="text-center mb-4">
      {success && (
        <>
          <img
            src={images.successicon}
            alt=""
            className="mb-3 mt-2"
            style={{ width: "110px" }}
          />
          <h3>Email Verification successful</h3>
          <p>Now you can log into your account!</p>
          <div className="text-center mt-3">
            <button
              onClick={goToLogin}
              className="btn btn-danger buttons w-100"
            >
              Go to Login
            </button>
          </div>
        </>
      )}

      {!success && (
        <>
          <img
            src={images.erroricon}
            alt=""
            className="mb-3 mt-2"
            style={{ width: "110px" }}
          />
          <h3>Email Verification falied!</h3>
          <p style={{ fontSize: "17px" }}>{message}</p>
          <p>
            Enter your registered Email address to get a new email with
            verification link
          </p>
          <div id="resend-form" className={`${sent ? "d-none" : ""}`}>
            <form className="d-flex" onSubmit={resendEmail}>
              <input
                type="email"
                name="email"
                id="email"
                className="form-control field me-2"
                placeholder="Enter email"
                onChange={handleChange}
                required
              />
              <button type="submit" className="btn btn-danger" disabled={isResending}>
                {isResending ? "Sending..." : "Resend"}
              </button>
            </form>
          </div>
          <div id="resend-success" className={`${sent ? "" : "d-none"}`}>
            <p style={{ fontSize: "17px" }}>
              Email sent successfully. Check your inbox and click on the
              verification link at the mail setnt by us. If it is not in the
              inbox check your spam folder.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default EmailVerify;
