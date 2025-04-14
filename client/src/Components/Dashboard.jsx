import React from "react";
import { Link } from "react-router-dom";
import images from "../Assets/assets";

const Dashboard = () => {
  return (
    <div
      className="container pt-3 vh-100"
      style={{ backgroundColor: "#f4f4f4" }}
    >
      <div className="row">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <img
                src={images.profile}
                style={{ borderRadius: "100%", width: "150px" }}
              />
              <h4>Pasindu Janith</h4>
              <p>New user</p>
              <div className="table-responsive">
                <table className="table text-start">
                  <tbody>
                    <tr>
                      <td style={{ width: "120px" }}>Email:</td>
                      <td className="text-break">
                        pjhathurusinghe14@gmail.com
                      </td>
                    </tr>
                    <tr>
                      <td>Mobile:</td>
                      <td className="text-break">+94 70 367 6389</td>
                    </tr>
                    <tr>
                      <td>Services ongoing:</td>
                      <td className="text-break">21</td>
                    </tr>
                    <tr>
                      <td>Services Pending:</td>
                      <td className="text-break">21</td>
                    </tr>
                    <tr>
                      <td>Services Completed:</td>
                      <td className="text-break">21</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="col-12">
            <div
              className="card mb-3"
              style={{ borderLeft: "5px solid #dc3545" }}
            >
              <div className="card-body">
                <h4>Verify your Email</h4>
                <p>
                  An email has been sent to your email address. Please verify
                  your email to get full benefits. Unverified email access is
                  only for limited time period in the system.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div
              className="card mb-3"
              style={{ borderLeft: "5px solid #dc3545" }}
            >
              <div className="card-body">
                <h4>Complete your profile</h4>
                <p>
                  Your profile is not fully completed yet. Please take few
                  minutes and complete it to get full benefits.
                </p>
                <button className="btn btn-danger">Complete Profile</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h4>Ongoing Service Progress</h4>
              <div className="container mt-3">
                <div
                  className="row pb-2 pt-2"
                  style={{ borderBottom: "1px solid rgb(141, 141, 141)" }}
                >
                  <div className="col-md-2">Service 43946</div>
                  <div className="col-md-10">
                    <div className="progress mb-2">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "25%" }}
                        aria-valuenow={25}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        25%
                      </div>
                    </div>
                    <label>Ends in: 2023:04:24</label>
                    <br />
                    <Link to="#">More Details</Link>
                  </div>
                </div>

                <div
                  className="row pb-2 pt-2"
                  style={{ borderBottom: "2px solidrgb(87, 87, 87)" }}
                >
                  <div className="col-md-2">Service 43946</div>
                  <div className="col-md-10">
                    <div className="progress mb-2">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "50%" }}
                        aria-valuenow={50}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        50%
                      </div>
                    </div>
                    <label>Ends in: 2023:04:22</label>
                    <br />
                    <Link to="#">More Details</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
