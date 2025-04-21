import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import images from "../assets/assets";
import "./css/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "toastr/build/toastr.min.css";
import toastr from "toastr";
import UserReister from "./../Components/UserRegister";
import OTPVerify from "../Components/OTPVerify";
import EmailVerify from "../Components/EmailVerify";
import EmailVerified from "../Components/EmailVerified";

// Configure toastr options

const SignUp = () => {

  return (
    <div className="container-fluid">
      <div className="row">
        <div
          className="col-md-6 d-md-block d-none position-fixed h-100"
          style={{
            backgroundColor: "rgba(255, 0, 0, 0.7)",
            clipPath: "polygon(0% 0%, 88% 0%, 100% 100%, 0% 100%)",
          }}
        ></div>
        <div
          className="col-md-6 d-md-block d-none"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.6),rgba(0, 0, 0, 0.2)),url(${images.signup})`,
            backgroundSize: "cover",
            clipPath: "polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)",
            minHeight: "100vh",
            height: "auto",
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
            <Routes>
              <Route path="/register" element={<UserReister />} />
              <Route path="/otpverify" element={<OTPVerify />} />
              <Route path="/email-verify" element={<EmailVerify />} />
              <Route path="/emailactivation" element={<EmailVerified />} />

            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
