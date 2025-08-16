import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CiCircleInfo } from "react-icons/ci";
import BASE_URL from "../config.js";

const ReservationInfo = () => {
  const { resid: reservationID } = useParams();
  const navigate = useNavigate();
  const [activeReservation, setActiveReservation] = useState(null);
  const [messages, setMessages] = useState([]);
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
          setMessages(data.messages || []);
          console.log("Reservation data:", data.messages);

          // Fix: Access properties through data.reservationData
          const reservationData = data.reservationData;
          if (reservationData && reservationData.reserve_date && reservationData.start_time && 
              reservationData.end_date && reservationData.end_time) {
            
            const start = new Date(
              `${new Date(reservationData.reserve_date).toLocaleDateString("en-CA")}T${
                reservationData.start_time
              }`
            );
            const end = new Date(
              `${new Date(reservationData.end_date).toLocaleDateString("en-CA")}T${
                reservationData.end_time
              }`
            );
            const now = new Date();
            
            setRemainingTime(end - now);
            setDuration(end - start);
          }
        } else {
          navigate("/myaccount/reservations"); // Redirect to reservations page on error
        }
      } catch (error) {
        console.error("Error fetching reservation data:", error);
        navigate("/myaccount/reservations"); // Redirect to reservations page on error
      } finally {
        setIsLoading(false);
      }
    };
    loadReservationInfo();
  }, [reservationID, navigate]);

  const formatTime12Hour = (timeStr) => {
    if (!timeStr) return "";
    // Accepts "HH:mm" or "HH:mm:ss"
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
      if (days > 0) parts.push(`${days} day(s)`);
      if (hours > 0) parts.push(`${hours} hour(s)`);
      if (minutes > 0) parts.push(`${minutes} minute(s)`);

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
        <>
          {`${days} day(s) ${hours} hour(s)`}
          <br />
          {`${minutes} minute(s)`}
        </>
      );
    }
    return "";
  };

  // Fix: Calculate progress percentage properly
  const getProgressPercentage = () => {
    if (remainingTime <= 0) return 100;
    if (duration <= 0) return 0;
    return Math.max(0, Math.min(100, 100 - Math.floor((remainingTime / duration) * 100)));
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-darkblue mb-4 fw-bold" style={{ fontSize: "40px" }}>
        Reservation Information
      </h2>
      <div className="card shadow-sm border-0 p-2 mb-3">
        <div className="card-body">
          <div className="row text-center fs-5 fw-semibold">
            <div
              className="col-md-3 col-12 mb-3 mb-md-0"
              style={{
                borderRight: "1px solid grey",
              }}
            >
              <div className="text-muted">Reservation ID</div>
              <div className="fs-2 mt-2">
                {activeReservation
                  ? activeReservation.reservation_id
                  : "Loading.."}
              </div>
            </div>
            <div
              className="col-md-3 col-12 mb-3 mb-md-0"
              style={{
                borderRight: "1px solid grey",
              }}
            >
              <div className="text-muted small">Start Time</div>
              <div className="fs-3 mt-2">
                {activeReservation
                  ? new Date(activeReservation.reserve_date).toLocaleDateString(
                      "en-CA"
                    ) +
                    " " +
                    formatTime12Hour(activeReservation.start_time)
                  : ""}
              </div>
            </div>
            <div
              className="col-md-3 col-12"
              style={{
                borderRight: "1px solid grey",
              }}
            >
              <div className="text-muted small">End Time</div>
              <div className="fs-3 mt-2">
                {activeReservation
                  ? new Date(activeReservation.end_date).toLocaleDateString(
                      "en-CA"
                    ) +
                    " " +
                    formatTime12Hour(activeReservation.end_time)
                  : ""}
              </div>
            </div>
            <div className="col-md-3 col-12">
              <div className="text-muted small">Duration</div>
              <div className="fs-4 mt-2">
                {getDuration() !== "" ? getDuration() : "--"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-4">
        {/* Reservation Info */}
        <div className="col-lg-8">
          <div className="card shadow p-4">
            <table className="table table-borderless mb-0">
              <tbody>
                <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                  <th style={{ width: "30%" }}>Status</th>
                  <td>
                    {activeReservation ? (
                      <span
                        className={`badge ${
                          activeReservation.status_name === "Completed"
                            ? "bg-success"
                            : activeReservation.status_name === "Pending"
                            ? "bg-warning"
                            : activeReservation.status_name === "Ongoing"
                            ? "bg-primary"
                            : "bg-secondary"
                        }`}
                      >
                        {activeReservation.status_name}
                      </span>
                    ) : (
                      <span className="badge bg-secondary">Loading...</span>
                    )}
                  </td>
                </tr>
                <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                  <th>Vehicle</th>
                  <td>
                    {activeReservation ? (
                      <>
                        {activeReservation.vehicle_id}
                        <button
                          className="btn p-0 btn-outline-primary border-0 no-hover-bg bg-transparent ms-2 text-primary"
                          onClick={() =>
                            navigate(
                              `/myaccount/vehicle-info/${activeReservation.vehicle_id}`
                            )
                          }
                        >
                          <CiCircleInfo size={25}></CiCircleInfo>
                        </button>
                      </>
                    ) : (
                      "--"
                    )}
                  </td>
                </tr>
                <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                  <th>Service Type</th>
                  <td>
                    {activeReservation ? activeReservation.service_name : "--"}
                  </td>
                </tr>
                <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                  <th>Notes</th>
                  <td>
                    {activeReservation?.notes ? activeReservation.notes : "--"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Progress Bar */}
            <div className="mt-4">
              <h5 className="mb-2">Service Progress</h5>

              <strong>Remaining time</strong>
              <div className="text-muted mb-3">
                {activeReservation
                  ? activeReservation.status_name === "Ongoing"
                    ? getRemainingTime()
                    : activeReservation.status_name === "Completed"
                    ? "Service completed. "
                    : activeReservation.status_name === "Pending"
                    ? "Service has not started yet."
                    : "Service is cancelled by user or admin."
                  : "Loading..."}
              </div>

              {activeReservation ? (
                activeReservation.status_name === "Ongoing" ? (
                  <div className="progress" style={{ height: "30px" }}>
                    <div
                      className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{
                        width: `${getProgressPercentage()}%`,
                      }}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {getProgressPercentage()}%
                    </div>
                  </div>
                ) : activeReservation.status_name === "Completed" ? (
                  <>
                    <div className="progress" style={{ height: "30px" }}>
                      <div
                        className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{
                          width: `100%`,
                        }}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        100% - Completed
                      </div>
                    </div>
                  </>
                ) : (
                  ""
                )
              ) : (
                <div className="text-muted">Loading progress...</div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Chat Box */}
        <div className="col-lg-4">
          <div
            className="card shadow p-3 d-flex flex-column"
            style={{ height: "100%", maxHeight: "500px" }}
          >
            <h4 className="fw-bold mb-3">Admin Messages</h4>
            <div
              className="border rounded p-3 flex-grow-1 overflow-auto bg-light"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {messages.length > 0 ? (
                messages.map((msg) =>
                  msg.role == "1" && msg.message ? (
                    <div
                      key={msg.id}
                      className="bg-white border rounded shadow-sm p-2 mb-3"
                    >
                      <div className="text-muted small mb-1">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                      <div className="text-dark">{msg.message}</div>
                    </div>
                  ) : (
                    <div
                      key={msg.id}
                      className="border rounded shadow-sm p-2 mb-3"
                      style={{ backgroundColor: "#b0f3ffff" }}
                    >
                      <div className="text-muted small mb-1">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                      <div className="text-dark">{msg.message}</div>
                    </div>
                  )
                )
              ) : (
                <div className="text-muted">No messages from admin yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationInfo;