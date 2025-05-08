import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  // Step 1: Declare state for email, password, and error message
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Step 2: Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on submit

    // Step 3: Check if email and password are entered
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    try {
      // Step 4: Send login request to backend
      const response = await axios.post("http://localhost:4000/admin/login", {
        email,
        password,
      });

      if (response.data.token) {
        // Successful login, redirect to dashboard
        // You can use history.push or Link to navigate to the dashboard
        window.location.href = "/dashboard";
      }
    } catch (error) {
      // Step 5: Show error message if login fails
      setErrorMessage(error.response ? error.response.data.message : "Login failed");
    }
  };

  return (
    <div className="hold-transition login-page">
      <div className="login-box">
        <div className="card card-outline card-primary">
          <div className="card-header text-center">
            <a href="../../index2.html" className="h1">
              <b>Auto Lanka</b> Services
            </a>
          </div>
          <div className="card-body">
            <p className="login-box-msg">Sign in to dashboard</p>
            <form onSubmit={handleSubmit}> {/* Step 6: Attach handleSubmit */}
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}  // Step 7: Bind email to state
                  onChange={(e) => setEmail(e.target.value)}  // Step 8: Handle email change
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-envelope" />
                  </div>
                </div>
              </div>
              <div className="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password} // Step 9: Bind password to state
                  onChange={(e) => setPassword(e.target.value)} // Step 10: Handle password change
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock" />
                  </div>
                </div>
              </div>
              {errorMessage && <p className="text-danger">{errorMessage}</p>} {/* Step 11: Show error message */}
              <div className="row">
                <div className="col-8">
                  <div className="icheck-primary">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember Me</label>
                  </div>
                </div>
              </div>
              <div className="col-12 mt-2 mb-3">
                <button type="submit" className="btn btn-primary btn-block">
                  Sign In
                </button>
              </div>
            </form>
            <p className="mb-1">
              <a href="forgot-password.html">I forgot my password</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
