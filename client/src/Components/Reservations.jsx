import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadReservations = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/loadAllUserReservations",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setReservations(data);
            setIsLoading(false);
          }else {
            setIsLoading(false);
          } 
        }
      } catch (error) {
        console.error("Error loading reservations:", error);
      }
    };
    loadReservations();
  }, []);

  return (
    <div className="container mt-4" style={{ minHeight: "100vh" }}>
      <div className="card">
        <div className="card-header">
          <h3 className="mb-0">Your Reservations</h3>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-end mb-3">
            <Link to="/myaccount/add-reservation" className="btn btn-primary">
              New Reservation
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Reservation ID</th>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>

                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <div className="spinner-border text-primary mt-4" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation.reservation_id}>
                      <td>{reservation.reservation_id}</td>
                      <td>{reservation.vehicle_id}</td>
                      <td>{new Date(reservation.reserve_date).toISOString().split("T")[0]}</td>
                      <td>{reservation.start_time} - {reservation.end_time}</td>
                      <td>{reservation.service_name}</td>
                      <td>
                        <span
                          className={`badge ${
                            reservation.status_name === "Completed"
                              ? "bg-success"
                              : reservation.status_name === "Pending"
                              ? "bg-warning"
                              : "bg-secondary"
                          }`}
                        >
                          {reservation.status_name}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1">Edit</button>
                        <button className="btn btn-sm btn-danger">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
