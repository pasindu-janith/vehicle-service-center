import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config.js";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const verifyLoginStatus = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/authAdmin`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.log(error);
      }
    };
    verifyLoginStatus();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (formData.email === "" || formData.password === "") {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.adminToken) {
        // localStorage.setItem("admin", JSON.stringify(data.admin));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "An error occurred during login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hold-transition login-page">
      <div className="login-box">
        <div className="card card-outline card-primary">
          <div className="card-header text-center">
            <h1 className="h1">
              <b>Shan Automobile</b>
              <br />
              <small>Admin Login</small>
            </h1>
          </div>
          <div className="card-body">
            <p className="login-box-msg">Sign in to administration dashboard</p>

            <form onSubmit={handleLogin}>
              <div className="input-group mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock" />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-8">
                  <div className="icheck-primary">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rememberMe: e.target.checked,
                        })
                      }
                    />
                    <label htmlFor="remember">Remember Me</label>
                  </div>
                </div>
              </div>

              <div className="col-12 mt-2 mb-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
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
