import React from "react";
import "toastr/build/toastr.min.css";
import toastr from "toastr";
import { BASE_URL } from "../config.js";

const Profile = () => {
  const [formData, setFormData] = React.useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { oldPassword, newPassword, confirmPassword } = formData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toastr.warning("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toastr.error("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
        credentials: "include", // Include credentials for cross-origin requests
      });

      if (!response.ok) {
        const data = await response.json();
        toastr.error(data.message || "Failed to update password.");
        return;
      }
      toastr.success("Password updated successfully.");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <section className="content">
      <div className="container-fluid">
        <div className="card mt-3">
          <div className="card-header">Reset Admin Password</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="">Enter old password</label>
                    <input
                      type="password"
                      name="oldPassword"
                      onChange={handleChange}
                      value={formData.oldPassword}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="">Enter new password</label>
                    <input
                      type="password"
                      name="newPassword"
                      onChange={handleChange}
                      value={formData.newPassword}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="">Re-Enter new password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      onChange={handleChange}
                      value={formData.confirmPassword}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    Update
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card mt-3">
          <div className="card-header">SMS Gateway Details</div>
          <div className="card-body">
            <table className="table table-bordered mb-3">
              <tbody>
                <tr>
                  <td>Remaining Amount:</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Account Status:</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <button className="btn btn-info">
              Load SMS Gateway Details
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
