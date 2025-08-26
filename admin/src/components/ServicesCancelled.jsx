import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import { BASE_URL } from "../config.js";
import toastr from "toastr";

const ServicesCancelled = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const dtInstance = useRef(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [restoreReservationConfirmation, setRestoreReservationConfirmation] =
    useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadCancelledServices`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
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

  const restoreReservation = async () => {
    if (!selectedReservation) return;
    try {
      const response = await fetch(`${BASE_URL}/restoreCancelledReservation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationID: selectedReservation.reservation_id,
        }),
      });
      if (response.ok) {
        // Refresh the table data after successful restoration
        const updatedData = tableData.filter(
          (item) => item.reservation_id !== selectedReservation.reservation_id
        );
        setTableData(updatedData);
        toastr.success(
          "Reservation restored successfully. Check pending services."
        );
      } else {
        console.error("Failed to restore reservation");
      }
    } catch (error) {
      console.error("Error restoring reservation:", error);
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
                                className="btn btn-success btn-sm mr-2"
                                onClick={() => {
                                  setSelectedReservation(row);
                                  setRestoreReservationConfirmation(true);
                                }}
                              >
                                Restore
                              </button>
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => {
                                  window.location.href = `/message?resid=${row.reservation_id}`;
                                }}
                              >
                                <i
                                  className="fa fa-envelope"
                                  aria-hidden="true"
                                ></i>
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
                  Restore Reservation
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
                Are you sure you want to restore this reservation?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    restoreReservation();
                    setRestoreReservationConfirmation(false);
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
                    setRestoreReservationConfirmation(false);
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
