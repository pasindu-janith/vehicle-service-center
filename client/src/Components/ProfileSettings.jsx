import { useState, useEffect } from "react";
import { data } from "react-router-dom";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

const ProfileSettings = () => {
  const [formProfileData, setProfileFormData] = useState({
    fname: "",
    lname: "",
    nic: "",
    email: "",
    mobile: "",
    addressNo: "",
    addressLane: "",
    addressCity: "",
  });
  const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/getUserData",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProfileFormData((prev) => ({
            ...prev,
            fname: data.first_name || "",
            lname: data.last_name || "",
            nic: data.nicno || "",
            email: data.email || "",
            mobile: data.mobile_no || "",
            addressNo: data.address_line1 || "",
            addressLane: data.address_line2 || "",
            addressCity: data.address_line3 || "",
          }));
        } else {
          console.error("Error fetching user data:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfileLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/v1/user/updateUserProfileData",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formProfileData),
          credentials: "include",
        }
      );
      if (response.ok) {
        toastr.success("Profile updated successfully!");
      } else {
        console.error("Error updating profile:", response.statusText);
        toastr.error(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setIsResetPasswordLoading(true);
    const oldPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      toastr.error("New password and confirmation do not match.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4000/api/v1/user/resetUserPassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
          credentials: "include",
        }
      );
      if (response.ok) {
        toastr.success("Password updated successfully!");
        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";
      } else {
        console.error("Error updating password:", response.statusText);
        toastr.error(data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsResetPasswordLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="text-darkblue mb-2 mt-5 fw-bold">User Profile Data</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleProfileSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="color" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fname"
                  name="fname"
                  value={formProfileData.fname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="lname" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="lname"
                  name="lname"
                  value={formProfileData.lname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="color" className="form-label">
                  NIC
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nic"
                  name="nic"
                  value={formProfileData.nic}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="lname" className="form-label">
                  Mobile Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="mobile"
                  name="mobile"
                  value={formProfileData.mobile}
                  onChange={handleChange}
                  disabled
                  required
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="lname" className="form-label">
                  Email address
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formProfileData.email}
                  onChange={handleChange}
                  disabled
                  required
                />
              </div>

              <label htmlFor="">Address</label>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  id="addressNo"
                  name="addressNo"
                  value={formProfileData.addressNo}
                  onChange={handleChange}
                  placeholder="Address Number e.g. 123/A"
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  id="addressLane"
                  name="addressLane"
                  value={formProfileData.addressLane}
                  onChange={handleChange}
                  placeholder="Lane/street"
                  required
                />
              </div>
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  id="addressCity"
                  name="addressCity"
                  value={formProfileData.addressCity}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary mt-3"
              disabled={isProfileLoading}
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>

      <h2 className="text-darkblue mt-4 mb-2 fw-bold">Account Settings</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          <p className="fw-bold">Reset your account password</p>
          <form onSubmit={handleAccountSubmit}>
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">
                Current Password
              </label>
              <input
                type="password"
                className="form-control"
                id="currentPassword"
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm new password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary mt-1"
              disabled={isResetPasswordLoading}
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
