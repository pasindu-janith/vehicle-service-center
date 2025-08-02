import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiCircleInfo } from "react-icons/ci";
import "./styles/Dashboard.css";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
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
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error loading reservations:", error);
      }
    };
    loadReservations();
  }, []);

  const deleteReservation = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/user/cancelReservation?rid=${selectedReservation.reservation_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        setReservations((prevReservations) =>
          prevReservations.map((reservation) =>
            reservation.reservation_id === selectedReservation.reservation_id
              ? { ...reservation, status_name: "Cancelled" }
              : reservation
          )
        );
        setShowDeleteModal(false);
        setSelectedReservation(null);
      } else {
        console.error("Error deleting reservation:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  return (
    <div className="container mt-4" style={{ minHeight: "100vh" }}>
      <h2 className="text-darkblue mb-3 fw-bold" style={{ fontSize: "40px" }}>
        Reservations
      </h2>
      <div className="card">
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
                  <th>Res ID</th>
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
                      <div
                        className="spinner-border text-primary mt-4"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation.reservation_id}>
                      <td>{reservation.reservation_id}</td>
                      <td>{reservation.vehicle_id}</td>
                      <td>
                        {new Date(reservation.reserve_date).toLocaleDateString(
                          "en-CA"
                        )}
                      </td>
                      <td>
                        {new Date(
                          `1970-01-01T${reservation.start_time}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td>{reservation.service_name}</td>
                      <td>
                        <span
                          className={`badge ${
                            reservation.status_name === "Completed"
                              ? "bg-success"
                              : reservation.status_name === "Pending"
                              ? "bg-warning"
                              : reservation.status_name === "Cancelled"
                              ? "bg-danger"
                              : "bg-primary"
                          }`}
                        >
                          {reservation.status_name}
                        </span>
                      </td>
                      <td>
                        {reservation.status_name === "Pending" ? (
                          <>
                            <button
                              className="btn btn-sm btn-primary me-1"
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowEditModal(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowDeleteModal(true);
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : reservation.status_name === "Completed" ? (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                window.location.href = `/proceed-payment/${reservation.reservation_id}`;
                              }}
                            >
                              Payment
                            </button>
                          </>
                        ) : (
                          ""
                        )}
                        <button
                          className="btn p-0 btn-outline-primary border-0 no-hover-bg bg-transparent ms-2 text-primary"
                          onClick={() =>
                            navigate(
                              `/myaccount/reservation-info/${reservation.reservation_id}`
                            )
                          }
                        >
                          <CiCircleInfo size={25}></CiCircleInfo>info
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {selectedReservation && showEditModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Reservation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedReservation(null);
                    setShowEditModal(false);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {/* Add your edit reservation form here */}
                <p>
                  Edit reservation form for ID:{" "}
                  {selectedReservation.reservation_id}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedReservation(null);
                    setShowEditModal(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selectedReservation && showDeleteModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedReservation(null);
                    setShowDeleteModal(false);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the Reservation{" "}
                  <strong>{selectedReservation.reservation_id}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedReservation(null);
                    setShowDeleteModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    deleteReservation();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
