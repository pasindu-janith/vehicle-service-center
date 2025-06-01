import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/forms.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "toastr/build/toastr.min.css";
import toastr from "toastr";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
    repassword: "",
    fname: "",
    lname: "",
  });

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

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
    if (
      formData.fname === "" ||
      formData.lname === "" ||
      formData.email === "" ||
      formData.mobile === "" ||
      formData.password === "" ||
      formData.repassword === ""
    ) {
      toastr.error("Please fill all the fields.");
      return;
    }
    const isChecked = e.target.agree.checked;
    if (!isChecked) {
      toastr.error("Please agree to the terms and conditions.");
      return;
    }

    if (formData.password !== formData.repassword) {
      toastr.error("Passwords do not match.");
      return;
    }

    // Validate mobile number
    const mobilePattern = /^[0-9]{9}$/;
    if (!mobilePattern.test(formData.mobile)) {
      toastr.error("Invalid mobile number. Please enter 9 digits after +94.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ text: "", type: "" });

      // Send data to backend API
      const response = await fetch(
        "http://localhost:4000/api/v1/user/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fname: formData.fname,
            lname: formData.lname,
            email: formData.email,
            mobile: formData.mobile,
            password: formData.password,
            repassword: formData.repassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toastr.success(
        "Registration successful! Verify your mobile number to continue."
      );
      navigate("/signup/otpverify", {
        state: { mobile: formData.mobile, email: formData.email },
      });
      setFormData({
        mobile: "",
        email: "",
        password: "",
        repassword: "",
        fname: "",
        lname: "",
      });
    } catch (error) {
      toastr.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="fw-bolder mb-4">Register now</h1>
      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="row">
          <div className="col-md-6 col-12 mb-3">
            <label htmlFor="fname" className="form-label">
              First Name
            </label>
            <input
              type="text"
              className="form-control field"
              id="fname"
              name="fname"
              value={formData.fname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 col-12 mb-3">
            <label htmlFor="lname" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              className="form-control field"
              id="lname"
              name="lname"
              value={formData.lname}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control field"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="mobile" className="form-label">
            Mobile Number
          </label>
          <div className="input-group">
            <span className="input-group-text">+94</span>
            <input
              type="tel"
              className="form-control field"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              maxLength={9}
              pattern="[0-9]{9}"
              required
            />
          </div>
          <div className="form-text">
            Enter 9 digits after +94 (e.g., 712345678)
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control field"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="repassword" className="form-label">
            Re-enter Password
          </label>
          <input
            type="password"
            className="form-control field"
            id="repassword"
            name="repassword"
            value={formData.repassword}
            onChange={handleChange}
            required
          />
        </div>
        {/* Remember Me and Forgot Password */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              name="agree"
              id="agree"
              type="checkbox"
            />
            <label className="form-check-label" htmlFor="agree">
              Agree to terms and conditions
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-danger w-100 buttons"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>

      {/* Divider */}
      <div className="text-center mt-4 mb-3">
        <span className="text-muted">Already have an account?</span>
        <Link to="/login" className="text-decoration-none ms-2">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
