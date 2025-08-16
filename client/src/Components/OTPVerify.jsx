import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/forms.css";
import "toastr/build/toastr.min.css";
import toastr from "toastr";
import images from "../assets/assets";
import BASE_URL from "../config.js";

const OTPVerify = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  if (!location.state) {
    navigate("/signup/register"); // Redirect to register if state is missing
  }
  const { mobile, email } = location.state || {};
  // Reference for input fields
  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef());

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleChange = (index, e) => {
    const value = e.target.value;

    if (isNaN(value)) return;

    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle keydown for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (pastedData.length <= 6 && /^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) {
          newOtp[i] = pastedData[i];
        }
      }
      setOtp(newOtp);

      // Focus on the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((val) => val === "");
      if (nextEmptyIndex !== -1) {
        inputRefs[nextEmptyIndex].current.focus();
      } else {
        inputRefs[5].current.focus();
      }
    }
  };

  // Handle OTP verification
  const verifyOtp = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
    const otpValue = otp.join("");

    // Validate OTP
    if (otpValue.length !== 6) {
      toastr.warning("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/otpverify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile: mobile,
            otp: otpValue,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toastr.success("Mobile verification success!");
        navigate("/signup/email-verify", {
          state: { email },
        });
      } else {
        toastr.error(data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toastr.error("Something went wrong. Please try again.");
    }
  };

  // Handle OTP resend
  const resendOtp = async () => {
    if (timer > 0) return;
    setIsResending(true);
    try {
      const response = await fetch(
        `${BASE_URL}/resendotp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mobile }),
        }
      );
      //resend otp function
      const data = await response.json();

      if (response.ok) {
        toastr.success("New OTP sent successfully!", "Success");
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

  return (
    <div className="container-fluid mt-5">
      <div className="row justify-content-center">
        <div className="card-body">
          <div className="text-center mb-4">
            <h2>Mobile Number Verification</h2>
            <img
              src={images.smsicon}
              className="mt-2 mb-4"
              style={{ width: "90px" }}
            />
            <p style={{ fontSize: "17px" }}>
              Please enter the 6-digit code sent to <b>{mobile}</b>
            </p>
          </div>

          <div className="d-flex justify-content-center mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={inputRefs[index]}
                className="form-control mx-1 text-center"
                style={{ width: "45px", height: "45px" }}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : null}
              />
            ))}
          </div>

          <div className="d-grid gap-2">
            <button
              className="btn btn-danger"
              onClick={verifyOtp}
              disabled={isSubmitting}
            >
              Verify OTP
            </button>
          </div>

          <div className="text-center mt-3">
            {timer > 0 ? (
              <p>Resend OTP in {timer} seconds</p>
            ) : (
              <button
                className="btn btn-link p-0"
                onClick={resendOtp}
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;
