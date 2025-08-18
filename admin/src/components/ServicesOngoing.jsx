import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css"; // Required for the clock UI
import "./styles/datetime.css";
import { BASE_URL } from "../config.js";
import EndReservationModal from "./EndReservationModal"; // Import the new component
import ProgressModal from "./ProgressModal"; // Import the progress modal component

const ServicesOngoing = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editReservationModal, setEditReservationModal] = useState(false);
  const [endReservationModal, setEndReservationModal] = useState(false);
  const [progressModal, setProgressModal] = useState(false);
  const [cancelReservationConfirmation, setCancelReservationConfirmation] = useState(false);
  const tableRef = useRef(null);
  const dtInstance = useRef(null); // To store the DataTable instance

  const [progressData, setProgressData] = useState({
    duration: "0h 0m",
    remaining: "0h 0m",
    percentage: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadOngoingServices`);
        if (response.ok) {
          const jsonData = await response.json();
          setTableData(jsonData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Only initialize or reinitialize DataTables if data is loaded
    if (!loading && tableData.length > 0) {
      const $table = $(tableRef.current);

      // Destroy existing instance before reinitializing
      if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().destroy();
      }

      dtInstance.current = $table.DataTable({
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: true,
        responsive: true,
      });
    }
  }, [tableData, loading]); // Re-run only when data is updated

  const handleEndReservation = async (formData) => {
    try {
      const response = await fetch(`${BASE_URL}/endReservation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        setTableData((prevData) =>
          prevData.map((row) =>
            row.reservation_id === selectedReservation.reservation_id
              ? { ...row, ...updatedData }
              : row
          )
        );
        setEndReservationModal(false);
        setSelectedReservation(null);
      } else {
        const errorData = await response.json();
        console.error("Error ending reservation:", errorData);
      }
    } catch (error) {
      console.error("Error ending reservation:", error);
    }
  };

  const editReservation = async () => {
    if (!selectedReservation) return;
    const startTime = startDateTime.toISOString();
    const endTime = endDateTime ? endDateTime.toISOString() : null;
    try {
      const response = await fetch(
        `${BASE_URL}/editReservation?reservationId=${
          selectedReservation.reservation_id
        }&startDateTime=${startTime.toLocaleString()}&endDateTime=${endTime.toLocaleString()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const updatedData = await response.json();
        setTableData((prevData) =>
          prevData.map((row) =>
            row.reservation_id === selectedReservation.reservation_id
              ? { ...row, ...updatedData, reservation_id: row.reservation_id }
              : row
          )
        );
        setEditReservationModal(false);
        setSelectedReservation(null);
        setEndDateTime(null);
      } else {
        const errorData = await response.json();
        console.error("Error editing reservation:", errorData);
      }
    } catch (error) {
      console.error("Error editing reservation:", error);
    }
  };

  const cancelReservation = async () => {
    if (!selectedReservation) return;
    try {
      const response = await fetch(`${BASE_URL}/cancelReservation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancelReason: document.getElementById("cancelReason").value || "",
          reservationID: selectedReservation.reservation_id,
          vehicleNumber: selectedReservation.vehicle_id,
        }),
      });
      if (response.ok) {
        selectedReservation.status_name = "Cancelled";
        setSelectedReservation(null);
        setEditReservationModal(false);
      } else {
        const errorData = await response.json();
        console.error("Error canceling reservation:", errorData);
      }
    } catch (error) {
      console.error("Error canceling reservation:", error);
    }
  };

  const handleCloseEndModal = () => {
    setSelectedReservation(null);
    setEndReservationModal(false);
  };

  const handleCloseProgressModal = () => {
    setProgressModal(false);
  };

  return (
    <section className="content pt-2">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary">
                <h3 className="card-title">Ongoing Services</h3>
              </div>
              <div className="card-body">
                <table
                  ref={tableRef}
                  id="example2"
                  className="table table-bordered table-hover"
                >
                  <thead>
                    <tr>
                      <th>Res. ID</th>
                      <th>Vehicle No</th>
                      <th>Service Name</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Description</th>
                      <th>Controls</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length > 0 ? (
                      tableData.map((row) => (
                        <tr key={row.reservation_id}>
                          <td>{row.reservation_id}</td>
                          <td>{row.vehicle_id}</td>
                          <td>{row.service_name}</td>
                          <td>
                            {new Date(row.reserve_date).toLocaleDateString("en-CA")}
                            {"  "}
                            {row.start_time.substring(0, 5)}
                          </td>
                          <td>
                            {new Date(row.end_date).toLocaleDateString("en-CA")}{" "}
                            {row.end_time.substring(0, 5)}
                          </td>
                          <td>{row.notes}</td>
                          <td>
                            <button
                              className="btn btn-success btn-sm mr-1"
                              onClick={() => {
                                setSelectedReservation(row);
                                setEndReservationModal(true);
                                setEndDateTime(new Date());
                              }}
                            >
                              End
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedReservation(row);
                                setEditReservationModal(true);
                                const temp =
                                  row.reserve_date.split("T")[0] + " " + row.start_time;
                                setStartDateTime(new Date(temp));
                              }}
                            >
                              Edit
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => {
                                setSelectedReservation(row);
                                setProgressModal(true);
                              }}
                            >
                              View Progress
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No ongoing services found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End Reservation Modal - Now using the separate component */}
      <EndReservationModal
        isOpen={endReservationModal}
        selectedReservation={selectedReservation}
        endDateTime={endDateTime}
        setEndDateTime={setEndDateTime}
        startDateTime={startDateTime}
        onClose={handleCloseEndModal}
        onEndReservation={handleEndReservation}
      />

      {/* Progress Modal - Now using the separate component */}
      <ProgressModal
        isOpen={progressModal}
        selectedReservation={selectedReservation}
        onClose={handleCloseProgressModal}
      />

      {editReservationModal && selectedReservation && (
        <div
          className="modal fade show"
          id="reservationDetailsModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="startReservationModalLabel"
          aria-hidden="true"
          style={{ display: "block" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="startReservationModalLabel">
                  Edit Reservation
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    setSelectedReservation(null);
                    setEditReservationModal(false);
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body d-flex align-items-center">
                <div className="col-md-8 col-12">
                  <div className="form-group">
                    <label htmlFor="">Reservation ID</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      id="reservationId"
                      value={selectedReservation.reservation_id}
                      readOnly
                    />
                    <label htmlFor="vehicleNumber">Vehicle Number</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      id="vehicleNumber"
                      value={selectedReservation.vehicle_id}
                      readOnly
                    />
                    <label htmlFor="serviceType">Service Type</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      value={selectedReservation.service_name}
                      readOnly
                    />

                    <label htmlFor="startTimeModal">Start time</label>
                    <DateTimePicker
                      onChange={(date) => setStartDateTime(date)}
                      value={startDateTime}
                      className="datetimepick col-12 mb-3"
                    />
                    <label htmlFor="">End time</label>
                    <DateTimePicker
                      onChange={(date) => setEndDateTime(date)}
                      value={endDateTime}
                      minDate={startDateTime}
                      className="datetimepick col-12 mb-3"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary me-2"
                  onClick={() => {
                    editReservation();
                    setSelectedReservation(null);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setCancelReservationConfirmation(true);
                  }}
                >
                  Cancel Reservation
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={() => {
                    setSelectedReservation(null);
                    setEditReservationModal(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cancelReservationConfirmation && selectedReservation && (
        <div
          className="modal fade show"
          id="cancelReservationConfirmation"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="cancelReservationConfirmationLabel"
          aria-hidden="true"
          style={{ display: "block" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="cancelReservationConfirmationLabel">
                  Cancel Reservation
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    setCancelReservationConfirmation(false);
                    setSelectedReservation(null);
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to cancel this reservation?
                <label htmlFor="cancelReason">Cancellation message</label>
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Enter cancellation reason (optional)"
                  id="cancelReason"
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    cancelReservation();
                    setCancelReservationConfirmation(false);
                    setSelectedReservation(null);
                  }}
                >
                  Yes, Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={() => {
                    setCancelReservationConfirmation(false);
                  }}
                >
                  No, Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesOngoing;