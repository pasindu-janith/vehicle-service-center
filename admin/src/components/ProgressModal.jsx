import React, { useEffect, useState } from "react";

const ProgressModal = ({ isOpen, selectedReservation, onClose }) => {
  const [progressData, setProgressData] = useState({
    duration: "0h 0m",
    remaining: "0h 0m",
    percentage: 0,
  });

  // Calculate progress based on reservation times
  const calculateProgress = () => {
    const now = new Date();
    const startTime = new Date(
      `${new Date(selectedReservation.reserve_date).toLocaleDateString(
        "en-CA"
      )}T${selectedReservation.start_time}`
    ); // force UTC
    const endTime = new Date(
      `${new Date(selectedReservation.end_date).toLocaleDateString("en-CA")}T${
        selectedReservation.end_time
      }`
    );

    // For display only (to check timezone)
    console.log(
      "Start Time:",
      startTime.toLocaleString(),
      "End Time:",
      endTime.toLocaleString(),
      "Now:",
      now.toLocaleString()
    );

    // Time calculations (in ms)
    const totalMs = endTime - startTime;
    const passedMs = now - startTime;
    const remainingMs = endTime - now;

    console.log(
      "Total (ms):",
      totalMs,
      "Passed (ms):",
      passedMs,
      "Remaining (ms):",
      remainingMs
    );

    // Calculate percentage
    let percentage = 0;
    if (totalMs > 0) {
      percentage = Math.max(0, Math.min(100, (passedMs / totalMs) * 100));
    }

    // Format time helper function
    const formatTime = (ms) => {
      if (ms <= 0) return "0h 0m";
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };

    // Calculate total duration
    const duration = formatTime(totalMs);

    // Calculate remaining time
    const remaining = remainingMs > 0 ? formatTime(remainingMs) : "0h 0m";

    return {
      duration,
      remaining,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
    };
  };

  // Update progress data when modal opens or reservation changes
  useEffect(() => {
    if (isOpen && selectedReservation) {
      // Combine date and time for start
      const startDateTime = `${
        selectedReservation.reserve_date.split("T")[0]
      } ${selectedReservation.start_time}`;
      // Combine date and time for end
      const endDateTime = `${selectedReservation.end_date.split("T")[0]} ${
        selectedReservation.end_time
      }`;

      const newProgressData = calculateProgress(startDateTime, endDateTime);
      setProgressData(newProgressData);

      // Set up interval to update progress every minute
      const interval = setInterval(() => {
        const updatedProgressData = calculateProgress(
          startDateTime,
          endDateTime
        );
        setProgressData(updatedProgressData);
      }, 60000); // Update every minute

      // Clean up interval when modal closes or component unmounts
      return () => clearInterval(interval);
    }
  }, [isOpen, selectedReservation]);

  // Don't render if modal is not open or no reservation selected
  if (!isOpen || !selectedReservation) return null;

  // Determine progress bar color based on percentage
  const getProgressBarColor = (percentage) => {
    if (percentage < 30) return "bg-danger";
    if (percentage < 70) return "bg-warning";
    return "bg-success";
  };

  // Determine if service is overdue
  const isOverdue =
    progressData.percentage >= 100 && progressData.remaining === "0h 0m";

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h4 className="modal-title fw-bold fs-3">Service Progress</h4>
          </div>

          <div className="modal-body p-4">
            {/* Reservation Details */}
            <div className="mb-3">
              <h5 className="text-center mb-3">
                {selectedReservation.service_name} -{" "}
                {selectedReservation.vehicle_id}
              </h5>
              <p className="text-center text-muted mb-3">
                Reservation ID: {selectedReservation.reservation_id}
              </p>
            </div>

            {/* Progress Statistics */}
            <div className="row text-center fs-5 fw-semibold mb-4">
              <div className="col border-end">
                <p className="text-muted mb-1">Total Duration</p>
                <p className="fs-4 text-dark">{progressData.duration}</p>
              </div>
              <div className="col border-end">
                <p className="text-muted mb-1">Remaining</p>
                <p
                  className={`fs-4 ${isOverdue ? "text-danger" : "text-dark"}`}
                >
                  {isOverdue ? "Overdue!" : progressData.remaining}
                </p>
              </div>
              <div className="col">
                <p className="text-muted mb-1">Progress</p>
                <p
                  className={`fs-4 ${
                    progressData.percentage >= 100
                      ? "text-danger"
                      : "text-success"
                  }`}
                >
                  {progressData.percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress mt-3" style={{ height: "20px" }}>
              <div
                className={`progress-bar progress-bar-striped progress-bar-animated ${getProgressBarColor(
                  progressData.percentage
                )}`}
                role="progressbar"
                style={{ width: `${Math.min(100, progressData.percentage)}%` }}
                aria-valuenow={progressData.percentage}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>

            {/* Service Times */}
            <div className="mt-4">
              <div className="row">
                <div className="col-6">
                  <small className="text-muted">Start Time:</small>
                  <p className="mb-1">
                    {new Date(
                      selectedReservation.reserve_date
                    ).toLocaleDateString("en-CA")}{" "}
                    {selectedReservation.start_time.substring(0, 5)}
                  </p>
                </div>
                <div className="col-6">
                  <small className="text-muted">End Time:</small>
                  <p className="mb-1">
                    {new Date(selectedReservation.end_date).toLocaleDateString(
                      "en-CA"
                    )}{" "}
                    {selectedReservation.end_time.substring(0, 5)}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-3 text-center">
              {isOverdue ? (
                <span className="badge bg-danger fs-6 p-2">
                  ⚠️ Service is overdue!
                </span>
              ) : progressData.percentage < 25 ? (
                <span className="badge bg-info fs-6 p-2">
                  🚀 Service just started
                </span>
              ) : progressData.percentage > 75 ? (
                <span className="badge bg-warning fs-6 p-2">
                  ⏰ Service nearing completion
                </span>
              ) : (
                <span className="badge bg-success fs-6 p-2">
                  ✅ Service in progress
                </span>
              )}
            </div>

            {/* Notes if available */}
            {selectedReservation.notes && (
              <div className="mt-3">
                <small className="text-muted">Notes:</small>
                <p className="text-secondary">{selectedReservation.notes}</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
