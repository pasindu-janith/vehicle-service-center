import React from "react";

const Profile = () => {
  const [formData, setFormData] = React.useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = formData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/v1/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "Password reset failed.");
        return;
      }

      alert("Password updated successfully.");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert("An error occurred. Please try again.");
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
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
