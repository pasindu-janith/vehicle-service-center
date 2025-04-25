import React, { useState } from "react";

const ProfileSettings = () => {
  const [formProfileData, setProfileFormData] = useState({
    licensePlate: "",
    vehicleType: "",
    make: "",
    model: "",
    color: "",
    year: "",
    transmission: "",
    fuelType: "",
    vehicleImage: null,
  });

  const [accountFormData, setaccountFormData] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in formProfileData) {
      formData.append(key, formProfileData[key]);
    }
    try {
      const response = await fetch(
        "http://localhost:4000/api/v1/user/updateProfile",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.error("Error updating profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container">
      <div className="card mt-5 shadow-sm">
        <div className="card-header">
          <h4>User Profile Data</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
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
                  onChange={handleChange}
                  placeholder=""
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
                  onChange={handleChange}
                  placeholder=""
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
                  id="fname"
                  name="fname"
                  onChange={handleChange}
                  placeholder=""
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
                  id="lname"
                  name="lname"
                  onChange={handleChange}
                  placeholder=""
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
                  onChange={handleChange}
                  placeholder="Address Number e.g. 123/A"
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  id="lname"
                  name="lname"
                  onChange={handleChange}
                  placeholder="Lane/street"
                  required
                />
              </div>
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  id="lname"
                  name="lname"
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>
            </div>
            <button className="btn btn-danger mt-3">Update Profile</button>
          </form>
        </div>
      </div>

      <div className="card mt-5 shadow-sm">
        <div className="card-header">
          <h4>Acccount Settings</h4>
        </div>
        <div className="card-body">
          <p>Reset your account password</p>
          <form>
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
            <button type="submit" className="btn btn-danger mt-1">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
