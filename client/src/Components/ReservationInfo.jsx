import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CiCircleInfo } from "react-icons/ci";
import { motion } from "framer-motion";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPlayCircle,
} from "react-icons/fi";
import { FaBarsProgress } from "react-icons/fa6";
import { FaCarAlt } from "react-icons/fa";
import { MdNotes } from "react-icons/md";
import BASE_URL from "../config.js";
import AdminChatbox from "./AdminChatBox.jsx";

const ReservationInfo = () => {
  const { resid: reservationID } = useParams();
  const navigate = useNavigate();
  const [activeReservation, setActiveReservation] = useState(null);
  // const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const loadReservationInfo = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/fetchReservationData?resid=${reservationID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setActiveReservation(data.reservationData);
          console.log("Reservation data:", data.messages);

          const reservationData = data.reservationData;
          if (
            reservationData &&
            reservationData.reserve_date &&
            reservationData.start_time &&
            reservationData.end_date &&
            reservationData.end_time
          ) {
            const start = new Date(
              `${new Date(reservationData.reserve_date).toLocaleDateString(
                "en-CA"
              )}T${reservationData.start_time}`
            );
            const end = new Date(
              `${new Date(reservationData.end_date).toLocaleDateString(
                "en-CA"
              )}T${reservationData.end_time}`
            );
            const now = new Date();

            setRemainingTime(end - now);
            setDuration(end - start);
          }
        } else {
          navigate("/myaccount/reservations");
        }
      } catch (error) {
        console.error("Error fetching reservation data:", error);
        navigate("/myaccount/reservations");
      } finally {
        setIsLoading(false);
      }
    };
    loadReservationInfo();
  }, [reservationID, navigate]);

  useEffect(() => {
    let timer;
    if (remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1000) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [remainingTime]);

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

  const getRemainingTime = () => {
    if (
      activeReservation &&
      activeReservation.reserve_date &&
      activeReservation.start_time &&
      activeReservation.end_date &&
      activeReservation.end_time
    ) {
      const start = new Date(
        `${new Date(activeReservation.reserve_date).toLocaleDateString(
          "en-CA"
        )}T${activeReservation.start_time}`
      );
      const end = new Date(
        `${new Date(activeReservation.end_date).toLocaleDateString("en-CA")}T${
          activeReservation.end_time
        }`
      );
      const now = new Date();
      const diffMs = end - start;
      const remainingMs = end - now;
      if (diffMs < 0) return "Invalid duration";
      if (remainingMs <= 0)
        return "Reservation has ended. But admin has not updated service as completed.";

      const totalMinutes = Math.floor(remainingMs / 60000);
      const days = Math.floor(totalMinutes / (24 * 60));
      const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
      const minutes = totalMinutes % 60;

      const parts = [];
      if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
      if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
      if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

      return parts.length > 0
        ? `${parts.join(" ")}`
        : "Less than a minute remaining";
    }
    return "";
  };

  const getDuration = () => {
    if (
      activeReservation &&
      activeReservation.reserve_date &&
      activeReservation.start_time &&
      activeReservation.end_date &&
      activeReservation.end_time
    ) {
      const start = new Date(
        `${new Date(activeReservation.reserve_date).toLocaleDateString(
          "en-CA"
        )}T${activeReservation.start_time}`
      );
      const end = new Date(
        `${new Date(activeReservation.end_date).toLocaleDateString("en-CA")}T${
          activeReservation.end_time
        }`
      );

      const diffMs = end - start;
      if (diffMs < 0) return "Invalid duration";

      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / (24 * 60));
      const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
      const minutes = totalMinutes % 60;

      return (
        <div className="text-center">
          <div className="fw-bold">
            {days} day{days !== 1 ? "s" : ""} {hours} hour
            {hours !== 1 ? "s" : ""}
          </div>
          <small className="text-muted">
            {minutes} minute{minutes !== 1 ? "s" : ""}
          </small>
        </div>
      );
    }
    return "";
  };

  const getProgressPercentage = () => {
    if (remainingTime <= 0) return 100;
    if (duration <= 0) return 0;
    return Math.max(
      0,
      Math.min(100, 100 - Math.floor((remainingTime / duration) * 100))
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return { bg: "bg-success", text: "text-success", icon: FiCheckCircle };
      case "Ongoing":
        return { bg: "bg-primary", text: "text-primary", icon: FiPlayCircle };
      case "Pending":
        return { bg: "bg-warning", text: "text-warning", icon: FiAlertCircle };
      default:
        return {
          bg: "bg-secondary",
          text: "text-secondary",
          icon: FiAlertCircle,
        };
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return "bg-success";
    if (percentage >= 75) return "bg-warning";
    return "bg-primary";
  };


  if (isLoading) {
    return (
      <div className="container mt-5 mb-5 vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "4rem", height: "4rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3 text-muted">
            Loading reservation information...
          </h5>
        </div>
      </div>
    );
  }

  const statusConfig = activeReservation
    ? getStatusColor(activeReservation.status_name)
    : getStatusColor("Unknown");
  const StatusIcon = statusConfig.icon;

  return (
    <div className="container mt-4 mb-5">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center mb-3">
            <div>
              <h1 className="mb-1 main-title fw-bold" style={{}}>
                Service Overview
              </h1>
              <p className="text-muted mb-0 fs-6">
                Track your reservation status and progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ backgroundColor: "#eeeeeeff" }}
          >
            <div className="card-body text-dark text-center py-4">
              <div className="text-dark small text-uppercase">
                Reservation ID
              </div>
              <div className="fs-2 fw-bold text-primary">
                {activeReservation ? activeReservation.reservation_id : "---"}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ backgroundColor: "#c2ffe4ff" }}
          >
            <div className="card-body text-dark text-center py-4">
              <div className="text-dark small text-uppercase">
                <FiClock size={16} className="me-1" />
                Start Time
              </div>
              <div className="fs-5 fw-bold">
                {activeReservation ? (
                  <>
                    <div>
                      {new Date(
                        activeReservation.reserve_date
                      ).toLocaleDateString("en-CA")}
                    </div>
                    <small className="opacity-75">
                      {formatTime12Hour(activeReservation.start_time)}
                    </small>
                  </>
                ) : (
                  "---"
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div
              className="card-body text-dark text-center py-4"
              style={{ backgroundColor: "#bee4ffff" }}
            >
              <div className="text-dark small text-uppercase">
                <FiClock size={16} className="me-1" />
                End Time
              </div>
              <div className="fs-5 fw-bold">
                {activeReservation ? (
                  <>
                    <div>
                      {new Date(activeReservation.end_date).toLocaleDateString(
                        "en-CA"
                      )}
                    </div>
                    <small className="opacity-75">
                      {formatTime12Hour(activeReservation.end_time)}
                    </small>
                  </>
                ) : (
                  "---"
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div
            className="card shadow-sm border-0 h-100"
            style={{ backgroundColor: "#ffb9b9ff" }}
          >
            <div className="card-body text-dark text-center py-4">
              <div className="small text-uppercase">Total Duration</div>
              <div className="fs-5 fw-bold">
                {getDuration() !== "" ? getDuration() : "---"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Reservation Details */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-4">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <MdNotes size={28} />
                </div>
                <div>
                  <h4 className="mb-1 fw-bold">Service Details</h4>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              {/* Status and Vehicle Info */}
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div
                    className="d-flex align-items-center p-3 rounded-3"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <div className="me-3">
                      <StatusIcon size={24} className={statusConfig.text} />
                    </div>
                    <div>
                      <small className="text-muted text-uppercase fw-semibold">
                        Current Status
                      </small>
                      <div>
                        <span
                          className={`badge ${statusConfig.bg} fs-6 px-3 py-2`}
                        >
                          {activeReservation
                            ? activeReservation.status_name
                            : "Loading..."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div
                    className="d-flex align-items-center p-3 rounded-3"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <div className="me-3">
                      <FaCarAlt size={24} className="text-dark" />
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted text-uppercase fw-semibold">
                        Vehicle
                      </small>
                      <div className="d-flex align-items-center">
                        <span className="fw-bold fs-5 me-2">
                          {activeReservation
                            ? activeReservation.vehicle_id
                            : "--"}
                        </span>
                        {activeReservation && (
                          <button
                            className="btn btn-outline-primary btn-sm border-0 p-1"
                            onClick={() =>
                              navigate(
                                `/myaccount/vehicle-info/${activeReservation.vehicle_id}`
                              )
                            }
                            title="View vehicle details"
                          >
                            <CiCircleInfo size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Type and Notes */}
              <div className="row g-4 mb-4">
                <div className="col-12">
                  <div
                    className="p-3 rounded-3"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <div className="row">
                      <div className="col-md-6">
                        <small className="text-muted text-uppercase fw-semibold">
                          Service Type
                        </small>
                        <div className="fw-bold fs-5 text-dark">
                          {activeReservation
                            ? activeReservation.service_name
                            : "--"}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted text-uppercase fw-semibold">
                          Additional Notes
                        </small>
                        <div className="text-dark">
                          {activeReservation?.notes || "No additional notes"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mt-4">
                <div className="d-flex align-items-center mb-3">
                  <FaBarsProgress size={20} className="text-dark me-2" />
                  <h5 className="mb-0 fw-bold">Service Progress</h5>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Remaining Time</span>
                    {activeReservation?.status_name === "Ongoing" && (
                      <span className="badge bg-light text-dark">
                        {getProgressPercentage()}% Complete
                      </span>
                    )}
                  </div>

                  <div
                    className="alert alert-light border-0 mb-3"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    {activeReservation ? (
                      activeReservation.status_name === "Ongoing" ? (
                        <div className="text-dark fw-medium">
                          {getRemainingTime()}
                        </div>
                      ) : activeReservation.status_name === "Completed" ? (
                        <div className="text-success fw-medium">
                          Service completed successfully
                        </div>
                      ) : activeReservation.status_name === "Pending" ? (
                        <div className="text-warning fw-medium">
                          Service has not started yet
                        </div>
                      ) : (
                        <div className="text-danger fw-medium">
                          Service was cancelled
                        </div>
                      )
                    ) : (
                      "Loading status..."
                    )}
                  </div>

                  {activeReservation &&
                    (activeReservation.status_name === "Ongoing" ? (
                      <div className="progress" style={{ height: "12px" }}>
                        <motion.div
                          className={`progress-bar progress-bar-striped progress-bar-animated ${getProgressBarColor(
                            getProgressPercentage()
                          )}`}
                          role="progressbar"
                          initial={{ width: "0%" }}
                          animate={{ width: `${getProgressPercentage()}%` }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                    ) : (
                      activeReservation.status_name === "Completed" && (
                        <div className="progress" style={{ height: "12px" }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: "100%" }}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      )
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        {/* <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-4">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FiMessageCircle size={24} className="text-primary" />
                </div>
                <div>
                  <h4 className="mb-1 fw-bold">Admin Messages</h4>
                  <p className="text-muted mb-0 small">Communication updates</p>
                </div>
              </div>
            </div>

            <div className="card-body p-0" style={{ maxHeight: "400px" }}>
              <div className="overflow-auto h-100 px-4 pb-4">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`py-2 px-3 mb-3 rounded-3 shadow-sm ${
                        msg.role === "1"
                          ? "bg-white border border-primary border-opacity-25"
                          : "border"
                      }`}
                      style={
                        msg.role !== "1" ? { backgroundColor: "#e3f2fd" } : {}
                      }
                    >
                      <div className="d-flex align-items-center mb-2">
                        <div className="me-2">
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center ${
                              msg.role === "1" ? "bg-primary" : "bg-info"
                            }`}
                            style={{ width: "24px", height: "24px" }}
                          >
                            <FiUser size={12} className="text-white" />
                          </div>
                        </div>
                        <small className="text-muted">
                          {new Date(msg.created_at)
                            .toLocaleString("en-GB", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            .toUpperCase()}
                        </small>
                      </div>
                      <div className="text-dark">{msg.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <FiMessageCircle size={48} className="text-muted mb-3" />
                    <p className="text-muted mb-0">
                      No messages from admin yet
                    </p>
                    <small className="text-muted">
                      Updates will appear here when available
                    </small>
                  </div>
                )}
              </div>
            </div>
            <div className="card-footer bg-white border-0 p-3">
              <form onSubmit={handleSendMessage} className="d-flex">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Type your message..."
                  onKeyDown={handleKeyPress}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  ref={inputRef}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={newMessage.trim() === ""}
                >
                  Send
                </button>
              </form>
              
            </div>
          </div>
        </div> */}
        <AdminChatbox reservationId={reservationID}/>
      </div>
    </div>
  );
};

export default ReservationInfo;
