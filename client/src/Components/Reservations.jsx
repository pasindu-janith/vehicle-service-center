import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiCalendar, CiClock2, CiSearch, CiFilter } from "react-icons/ci";
import { FaTrash, FaEdit } from "react-icons/fa";
import { BiPlus } from "react-icons/bi";
import { MdPayment } from "react-icons/md";
import { MdOutlineBookmark } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import "./styles/Dashboard.css";
import BASE_URL from "../config.js";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table or card
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicle: "",
    serviceType: "",
    serviceDate: null,
    serviceTime: null,
    serviceEndTime: "",
    notes: "",
  });
  useEffect(() => {
    const loadReservations = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadAllUserReservations`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setReservations(data);
            setFilteredReservations(data);
            console.log("Reservations loaded successfully:", data);
          }
        }
      } catch (error) {
        console.error("Error loading reservations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadReservations();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = reservations;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (reservation) => reservation.status_name.toLowerCase() === statusFilter
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (reservation) =>
          reservation.reservation_id.toString().includes(searchTerm) ||
          reservation.vehicle_id.toString().includes(searchTerm) ||
          reservation.service_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReservations(filtered);
  }, [reservations, searchTerm, statusFilter]);

  const deleteReservation = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/cancelReservation?rid=${selectedReservation.reservation_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
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

  const getStatusVariant = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Pending":
        return "warning";
      case "Cancelled":
        return "danger";
      case "Confirmed":
        return "info";
      default:
        return "primary";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const ReservationCard = ({ reservation }) => (
    <div className="col-lg-6 col-xl-4 mb-4">
      <div className="card h-100 shadow-sm border-0 reservation-card">
        <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
          <span className="fw-bold text-primary">
            #{reservation.reservation_id}
          </span>
          <span
            className={`badge bg-${getStatusVariant(reservation.status_name)}`}
          >
            {reservation.status_name}
          </span>
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            {/* <CiCar className="text-muted me-2" size={20} /> */}
            <span className="fw-semibold">
              Vehicle: {reservation.vehicle_id}
            </span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <CiCalendar className="text-muted me-2" size={16} />
            <small className="text-muted">
              {formatDate(reservation.reserve_date)}
            </small>
          </div>
          <div className="d-flex align-items-center mb-2">
            <CiClock2 className="text-muted me-2" size={16} />
            <small className="text-muted">
              {formatTime(reservation.start_time)}
            </small>
          </div>
          <div className="mb-3">
            <span className="badge bg-light text-dark">
              {reservation.service_name}
            </span>
          </div>
        </div>
        <div className="card-footer bg-transparent border-0">
          <div className="d-flex gap-2 flex-wrap">
            {reservation.status_name === "Pending" && (
              <>
                <button
                  className="btn btn-sm btn-primary flex-fill"
                  onClick={() => {
                    setSelectedReservation(reservation);
                    setShowEditModal(true);
                  }}
                >
                  <FaEdit size={16} className="me-1" />
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    setSelectedReservation(reservation);
                    setShowDeleteModal(true);
                  }}
                >
                  <FaTrash size={16} />
                </button>
              </>
            )}
            {reservation.status_name === "Completed" && (
              <button
                className="btn btn-sm btn-success flex-fill"
                onClick={() => {
                  window.location.href = `/myaccount/proceed-payment?resid=${reservation.reservation_id}`;
                }}
              >
                <MdPayment size={16} className="me-1" />
                Payment
              </button>
            )}
            <button
              className="btn btn-sm btn-info text-white"
              onClick={() =>
                navigate(
                  `/myaccount/reservation-info/${reservation.reservation_id}`
                )
              }
            >
              <IoMdInformationCircleOutline size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mt-4" style={{ minHeight: "100vh" }}>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="text-center">
            <spinner
              className="spinner-border text-primary mb-3"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </spinner>
            <h4 className="text-muted">Loading your reservations...</h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center mb-1">
            <MdOutlineBookmark className="me-1 text-darkblue" size={40} />
            <h2
              className="main-title mb-1 fw-bold"
              style={{ fontSize: "2.5rem" }}
            >
              My Reservations
            </h2>
          </div>

          <p className="text-muted mb-0">
            {filteredReservations.length} reservation
            {filteredReservations.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link
          to="/myaccount/add-reservation"
          className="btn btn-primary d-flex align-items-center"
          style={{ borderRadius: "12px" }}
        >
          <BiPlus size={20} className="me-2" />
          New Reservation
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body py-3">
          <div className="row align-items-center">
            <div className="col-md-4 mb-2 mb-md-0">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <CiSearch size={20} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search reservations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ boxShadow: "none" }}
                />
              </div>
            </div>
            <div className="col-md-3 mb-2 mb-md-0">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <CiFilter size={20} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ boxShadow: "none" }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="col-md-5">
              <div className="d-flex justify-content-end">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${
                      viewMode === "table"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    } btn-sm`}
                    onClick={() => setViewMode("table")}
                  >
                    Table View
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      viewMode === "card"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    } btn-sm`}
                    onClick={() => setViewMode("card")}
                  >
                    Card View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredReservations.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="text-muted mb-3">
              <CiCalendar size={64} />
            </div>
            <h4 className="text-muted mb-2">No reservations found</h4>
            <p className="text-muted mb-3">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You haven't made any reservations yet"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link to="/myaccount/add-reservation" className="btn btn-primary">
                Make Your First Reservation
              </Link>
            )}
          </div>
        </div>
      ) : viewMode === "card" ? (
        <div className="row">
          {filteredReservations.map((reservation) => (
            <ReservationCard
              key={reservation.reservation_id}
              reservation={reservation}
            />
          ))}
        </div>
      ) : (
        <div className="card shadow-sm p-3" style={{ borderRadius: "12px" }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-semibold">Res ID</th>
                  <th className="border-0 fw-semibold">Vehicle</th>
                  <th className="border-0 fw-semibold">Date</th>
                  <th className="border-0 fw-semibold">Time</th>
                  <th className="border-0 fw-semibold">Service</th>
                  <th className="border-0 fw-semibold">Status</th>
                  <th className="border-0 fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.reservation_id}>
                    <td className="py-3 fw-semibold text-primary">
                      {reservation.reservation_id}
                    </td>
                    <td className="py-3">{reservation.vehicle_id}</td>
                    <td className="py-3">
                      <div className="d-flex align-items-center">
                        <CiCalendar className="text-muted me-2" size={16} />
                        {formatDate(reservation.reserve_date)}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center">
                        <CiClock2 className="text-muted me-2" size={16} />
                        {formatTime(reservation.start_time)}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="badge bg-light text-dark">
                        {reservation.service_name}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`badge bg-${getStatusVariant(
                          reservation.status_name
                        )}`}
                      >
                        {reservation.status_name}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="d-flex gap-1">
                        {reservation.status_name === "Pending" && (
                          <>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowEditModal(true);
                              }}
                              title="Edit reservation"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowDeleteModal(true);
                              }}
                              title="Cancel reservation"
                            >
                              <FaTrash size={16} />
                            </button>
                          </>
                        )}
                        {reservation.status_name === "Completed" && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => {
                              window.location.href = `/myaccount/proceed-payment?resid=${reservation.reservation_id}`;
                            }}
                            title="Proceed to payment"
                          >
                            <MdPayment size={16} />
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-info text-white"
                          onClick={() =>
                            navigate(
                              `/myaccount/reservation-info/${reservation.reservation_id}`
                            )
                          }
                          title="View details"
                        >
                          <IoMdInformationCircleOutline size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedReservation && showEditModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Reservation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedReservation(null);
                    setShowEditModal(false);
                  }}
                ></button>
              </div>
              <div className="modal-body pt-0">
                <div className="alert alert-info border-0">
                  <strong>Reservation ID:</strong> 
                  {selectedReservation.reservation_id}
                </div>
                {/* Edit form fields go here */}
                <div className="mb-3">
                  <label htmlFor="serviceDate" className="form-label">
                    Preferred Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="serviceDate"
                    name="serviceDate"
                    value={formData.serviceDate || ""}
                    min={new Date().toISOString().split("T")[0]} // Disable previous days
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        serviceDate: value,
                      }));
                    }}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="serviceTime" className="form-label">
                    Preferred Time <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="serviceTime"
                    name="serviceTime"
                    required
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value !== "") {
                        setFormData((prev) => ({
                          ...prev,
                          serviceTime: value,
                        }));
                      }
                    }}
                  >
                    <option selected disabled value>
                      Choose a time
                    </option>
                    {Array.from({ length: (18 - 8) * 4 }, (_, index) => {
                      const hours = 8 + Math.floor(index / 4);
                      const minutes = (index % 4) * 15;
                      const time = `${hours
                        .toString()
                        .padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}:00`;
                      return (
                        <option key={time} value={time}>
                          {time.slice(0, 5)}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">
                    Additional Notes
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  ></textarea>

                  </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSelectedReservation(null);
                    setShowEditModal(false);
                  }}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  Save Changes
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-danger">
                  Cancel Reservation
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedReservation(null);
                    setShowDeleteModal(false);
                  }}
                ></button>
              </div>
              <div className="modal-body pt-3">
                <p className="text-center">
                  Are you sure you want to cancel reservation number{" "}
                  <strong>{selectedReservation.reservation_id}</strong>?
                </p>
                <div className="alert alert-warning border-0">
                  <small>
                    <strong>Note:</strong> This action cannot be undone. You may
                    need to create a new reservation if you change your mind.
                  </small>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSelectedReservation(null);
                    setShowDeleteModal(false);
                  }}
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={deleteReservation}
                >
                  Cancel Reservation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .reservation-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .reservation-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .table-hover tbody tr:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }

        .btn {
          border-radius: 8px;
          transition: all 0.2s;
        }

        .card {
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

export default Reservations;
