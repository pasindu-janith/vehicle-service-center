import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import DateTimePicker from "react-datetime-picker";
import { BASE_URL } from "../config.js";

const ServicesCancelled = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const dtInstance = useRef(null); // To store the DataTable instance
  const [endDateTime, setEndDateTime] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [restoreReservationConfirmation, setRestoreReservationConfirmation] =
    useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadCancelledServices`);
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

  const startReservation = async () => {
    if (!selectedReservation) return;
    const startTime = startDateTime.toISOString();
    const endTime = endDateTime ? endDateTime.toISOString() : null;
    try {
      const response = await fetch(
        `${BASE_URL}/startReservation?reservationId=${
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
        setTableData((prevData) =>
          prevData.filter(
            (row) => row.reservation_id !== selectedReservation.reservation_id
          )
        );
        
        setSelectedReservation(null);
        setEndDateTime(null);
      } else {
        const errorData = await response.json();
        console.error("Error starting reservation:", errorData);
      }
    } catch (error) {
      console.error("Error starting reservation:", error);
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
      } else {
        const errorData = await response.json();
        console.error("Error canceling reservation:", errorData);
      }
    } catch (error) {
      console.error("Error canceling reservation:", error);
    }
  };

  return (
    <section className="content pt-2">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-danger">
                <h3 className="card-title">Cancelled Services</h3>
              </div>
              <div className="card-body">
                <div className="table-responsive">
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
                        <th>Start</th>
                        <th>End</th>
                        <th>Description</th>
                        <th>Controls</th>
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
                              {new Date(row.reserve_date).toLocaleDateString(
                                "en-CA"
                              )}
                              {"  "}
                              {row.start_time.substring(0, 5)}
                            </td>
                            <td>
                              {new Date(row.end_date).toLocaleDateString(
                                "en-CA"
                              )}{" "}
                              {row.end_time.substring(0, 5)}
                            </td>
                            <td>{row.notes}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm me-2"
                                onClick={() => {
                                  setSelectedReservation(row);
                                  setRestoreReservationConfirmation(true);
                                }}
                              >
                                Restore
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
      </div>


      {restoreReservationConfirmation && selectedReservation && (
        <div
          className="modal fade show"
          id="cancelReservationConfirmation"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="cancelReservationConfirmationLabel"
          aria-hidden="true"
          style={{ display: "block" }} // Only needed if you want to show the modal immediately
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5
                  className="modal-title"
                  id="cancelReservationConfirmationLabel"
                >
                  Cancel Reservation
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    setRestoreReservationConfirmation(false);
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
                  Yes, Restore
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

export default ServicesCancelled;