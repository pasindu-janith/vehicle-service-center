import React, { useState, useEffect } from "react";
import { FaEye, FaCar, FaClock } from "react-icons/fa";
import { CgSandClock } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

const OngoingReservationsTable = ({ ongoing }) => {
  const [inProgress, setInProgress] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    if (ongoing && Array.isArray(ongoing)) {
      setInProgress(ongoing);
    }
    console.log("Ongoing reservations updated:", ongoing);
  }, [ongoing]);

  const formatTime12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute), 0, 0);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateProgress = (reservation) => {
    const startDateTime = new Date(
      `${new Date(reservation.reserve_date).toLocaleDateString("en-CA")}T${
        reservation.start_time
      }`
    );
    const endDateTime = new Date(
      `${new Date(reservation.end_date).toLocaleDateString("en-CA")}T${
        reservation.end_time
      }`
    );
    const now = new Date();

    const totalDuration = endDateTime - startDateTime;
    const elapsed = now - startDateTime;

    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;

    return Math.round((elapsed / totalDuration) * 100);
  };

  const getRemainingTime = (reservation) => {
    const endDateTime = new Date(
      `${new Date(reservation.end_date).toLocaleDateString("en-CA")}T${
        reservation.end_time
      }`
    );
    const now = new Date();
    const remaining = endDateTime - now;

    if (remaining <= 0) return "Completed";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleViewDetails = (reservationId) => {
    navigate(`/myaccount/reservation-info/${reservationId}`);
  };

  return (
    <div className="container-fluid p-0">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h4 className="mb-1 fw-bold text-dark">
                <CgSandClock className="text-primary me-2" size={22} />
                Ongoing Reservations
              </h4>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-primary fs-6 px-3 py-2">
                {inProgress.length} Active
              </span>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr className="border-bottom bg-light">
                  <th className="fw-bold text-dark px-4 py-3 border-0">
                    <div className="text-muted small text-uppercase fw-semibold">
                      Res. ID
                    </div>
                  </th>
                  <th className="fw-bold text-dark py-3 border-0">
                    <div className="text-muted small text-uppercase fw-semibold">
                      Vehicle
                    </div>
                  </th>
                  <th
                    className="fw-bold text-dark py-3 border-0"
                    style={{ width: "30%" }}
                  >
                    <div className="text-muted small text-uppercase fw-semibold">
                      Progress
                    </div>
                  </th>
                  <th className="fw-bold text-dark py-3 border-0">
                    <div className="text-muted small text-uppercase fw-semibold">
                      End at
                    </div>
                  </th>
                  <th className="fw-bold text-dark py-3 border-0">
                    <div className="text-muted small text-uppercase fw-semibold">
                      Remaining
                    </div>
                  </th>
                  <th className="fw-bold text-dark py-3 border-0 text-center">
                    <div className="text-muted small text-uppercase fw-semibold">
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {inProgress.length > 0 ? (
                  inProgress.map((reservation) => {
                    const progress = calculateProgress(reservation);
                    const remaining = getRemainingTime(reservation);
                    return (
                      <tr
                        key={reservation.reservation_id}
                        className="border-bottom"
                        style={{ transition: "background-color 0.2s ease" }}
                      >
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <div
                                className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                                style={{ width: "8px", height: "8px" }}
                              />
                            </div>
                            <span className="fw-bold text-primary">
                              {reservation.reservation_id}
                            </span>
                          </div>
                        </td>

                        <td className="py-3">
                          <div>
                            <div className="fw-semibold text-dark mb-1">
                              <FaCar className="me-1" size={14} />
                              {reservation.vehicle_id}
                            </div>
                            <div className="small text-muted">
                              {reservation.service_name}
                            </div>
                          </div>
                        </td>

                        <td className="py-3">
                          <div className="d-flex align-items-center pe-2">
                            <div
                              className="progress flex-grow-1 me-2"
                              style={{ height: "10px", minWidth: "100px" }}
                            >
                              <div
                                className={`progress-bar progress-bar-striped progress-bar-animated ${
                                  progress >= 75 ? "bg-success" : "bg-primary"
                                }`}
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              />
                            </div>
                            <small className="text-muted fw-medium text-nowrap">
                              {progress}%
                            </small>
                          </div>
                        </td>

                        <td className="py-3">
                          <div className="small">
                            <div className="text-dark mb-1">
                              {new Date(
                                reservation.end_date
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-muted">
                              {formatTime12Hour(reservation.end_time)}
                            </div>
                          </div>
                        </td>

                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <FaClock className="text-muted me-1" size={12} />
                            <span className="small fw-medium text-dark">
                              {remaining}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 text-center">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              handleViewDetails(reservation.reservation_id)
                            }
                            style={{ minWidth: "110px" }}
                          >
                            <FaEye className="me-1" size={12} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-5 text-center">
                      <div className="text-muted">
                        <FaClock size={32} className="mb-3" />
                        <p className="mb-0">
                          No ongoing reservations at the moment
                        </p>
                        <small>Active reservations will appear here</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {inProgress.length > 0 && (
          <div className="card-footer bg-light border-top py-3">
            <div className="d-flex justify-content-between align-items-center text-muted small">
              <span>
                Showing {inProgress.length} ongoing reservation
                {inProgress.length !== 1 ? "s" : ""}
              </span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OngoingReservationsTable;
