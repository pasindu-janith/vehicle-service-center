import React from "react";
import { Link } from "react-router-dom";

const Reservations = () => {
  return (
    <div className="container mt-4 vh-100">
      <div className="card">
        <div className="card-header">
          <h3 className="mb-0">Your Reservations</h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-end mb-3">
            <Link to="/myaccount/add-reservation" className="btn btn-primary">New Reservation</Link>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Reservation ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Service</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>12345</td>
                <td>2025-03-18</td>
                <td>10:00 AM</td>
                <td>Oil Change</td>
                <td>
                  <span className="badge bg-success">Confirmed</span>
                </td>
                <td>
                  <button className="btn btn-sm btn-warning">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
              <tr>
                <td>67890</td>
                <td>2025-03-20</td>
                <td>2:00 PM</td>
                <td>Brake Inspection</td>
                <td>
                  <span className="badge bg-warning">Pending</span>
                </td>
                <td>
                  <button className="btn btn-sm btn-warning">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
