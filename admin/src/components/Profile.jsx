import React from "react";

const Profile = () => {
  return (
    <section className="content">
      <div className="container-fluid">
        <div className="card mt-3">
          <div className="card-header">Reset Admin Password</div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="">Enter old password</label>
                  <input type="password" className="form-control" />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="">Enter new password</label>
                  <input type="password" className="form-control" />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="">Re-Enter new password</label>
                  <input type="password" className="form-control" />
                </div>
              </div>
              <div className="col-12 d-flex justify-content-end">
                <button className="btn btn-primary">Update</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
