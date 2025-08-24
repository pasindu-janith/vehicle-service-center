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
import toastr from "toastr";
import { BASE_URL } from "../config.js";
import EndReservationModal from "./EndReservationModal.jsx";

const Reservations = () => {
  const [startDateTimeFilter, setStartDateTimeFilter] = useState(new Date());
  const [endDateTimeFilter, setEndDateTimeFilter] = useState(null);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [startReservationModal, setStartReservationModal] = useState(false);
  const [editReservationModal, setEditReservationModal] = useState(false);
  const [endReservationModal, setEndReservationModal] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isEditting, setIsEditting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [cancelReservationConfirmation, setCancelReservationConfirmation] =
    useState(false);
  // const [extraItems, setExtraItems] = useState([]);
  // const [extraItem, setExtraItem] = useState({ description: "", price: "" });
  const tableRef = useRef(null);
  const dtInstance = useRef(null); // To store the DataTable instance
  // const [serviceCost, setServiceCost] = useState("");
  // const [serviceDiscount, setServiceDiscount] = useState("0.00");
  // const [finalAmount, setFinalAmount] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadAllReservations`);
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

  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadServiceTypes`, {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setServiceTypes(data);
        }
      } catch (error) {
        console.error("Error loading service types:", error);
      }
    };
    loadServiceTypes();
  }, []);

  const filterDataLoad = async () => {
    const serviceType = document.getElementById("serviceType").value;
    const vehicleNumber = document.getElementById("vehicleNumber").value;
    // setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/filterReservationData?serviceType=${serviceType}&
        vehicleNumber=${vehicleNumber}&startDateTime=${startDateTimeFilter.toLocaleString()}&
        endDateTime=${endDateTimeFilter.toLocaleString()}`,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTableData(data);
      }
    } catch (error) {
      console.error("Error loading filtered data:", error);
    }
  };

  const startReservation = async () => {
    if (!selectedReservation) return;
    setIsStarting(true);
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
        const updatedData = await response.json();
        setTableData((prevData) =>
          prevData.map((row) =>
            row.reservation_id === selectedReservation.reservation_id
              ? { ...row, ...updatedData, reservation_id: row.reservation_id }
              : row
          )
        );
        setStartReservationModal(false);
        setSelectedReservation(null);
        setEndDateTime(null);
        toastr.success("Reservation started successfully");
      } else {
        const errorData = await response.json();
        console.error("Error starting reservation:", errorData);
      }
    } catch (error) {
      console.error("Error starting reservation:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCloseEndModal = () => {
    setSelectedReservation(null);
    setEndReservationModal(false);
  };

  const handleEndReservation = async (formData) => {
    if (!selectedReservation) return;
    setIsEnding(true);
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
        toastr.success("Reservation ended successfully");
      } else {
        const errorData = await response.json();
        console.error("Error ending reservation:", errorData);
      }
    } catch (error) {
      console.error("Error ending reservation:", error);
    } finally {
      setIsEnding(false);
    }
  };

  const editReservation = async () => {
    if (!selectedReservation) return;
    setIsEditting(true);
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
        toastr.success("Reservation edited successfully");
      } else {
        const errorData = await response.json();
        console.error("Error editing reservation:", errorData);
      }
    } catch (error) {
      console.error("Error editing reservation:", error);
    } finally {
      setIsEditting(false);
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
        toastr.success(
          `Reservation ${selectedReservation.reservation_id} cancelled`
        );
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

  return (
    <section className="content pt-2">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-secondary">
                Service Reservations(All)
              </div>
              {/* /.card-header */}
              <div className="card-body">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Filters</h3>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 col-12">
                        <label htmlFor="vehicleNumber">Vehicle Number</label>
                        <input
                          type="text"
                          id="vehicleNumber"
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label htmlFor="serviceType">Service type</label>
                          <select
                            className="form-control"
                            id="serviceType"
                            name="serviceType"
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              console.log(
                                "Selected service type:",
                                selectedValue
                              );
                            }}
                          >
                            <option value="0">All Types</option>
                            {serviceTypes.map((serviceType) => (
                              <option
                                key={serviceType.service_type_id}
                                value={serviceType.service_type_id}
                              >
                                {serviceType.service_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4 pt-3">
                        <label>Start Date-Time:</label>
                        <DateTimePicker
                          onChange={(date) => {
                            setStartDateTimeFilter(date);
                          }}
                          value={startDateTimeFilter}
                          maxDate={endDateTimeFilter}
                          className="datetimepick col-md-8 col-12"
                        />
                      </div>
                      <div className="col-md-4 pt-3">
                        <label>End Date-Time:</label>
                        <DateTimePicker
                          onChange={(date) => {
                            setEndDateTimeFilter(date);
                          }}
                          value={endDateTimeFilter}
                          minDate={startDateTimeFilter}
                          className="datetimepick col-md-8 col-12"
                        />
                      </div>
                      <div className="col-md-4 d-flex justify-content-end">
                        <button
                          className="btn btn-primary mt-3"
                          onClick={filterDataLoad}
                        >
                          Filter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
                        <th>Status</th>
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
                              {row.status_name === "Pending" ? (
                                <span className="badge bg-warning">
                                  {row.status_name}
                                </span>
                              ) : row.status_name === "Completed" ? (
                                <span className="badge bg-success">
                                  {row.status_name}
                                </span>
                              ) : row.status_name === "Ongoing" ? (
                                <span className="badge bg-info">
                                  {row.status_name}
                                </span>
                              ) : (
                                <span className="badge bg-danger">
                                  {row.status_name}
                                </span>
                              )}
                            </td>
                            <td>
                              {row.status_name === "Pending" ? (
                                <>
                                  <button
                                    className="btn btn-warning btn-sm mr-1"
                                    onClick={() => {
                                      setSelectedReservation(row),
                                        setStartReservationModal(true);
                                      setStartDateTime(new Date());
                                    }}
                                  >
                                    Start
                                  </button>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      setSelectedReservation(row),
                                        setEditReservationModal(true);
                                      setStartDateTime(new Date());
                                    }}
                                  >
                                    Edit
                                  </button>
                                  {/* <button className="btn btn-warning btn-sm me-2">
                                  Cancel
                                </button> */}
                                </>
                              ) : row.status_name === "Ongoing" ? (
                                <>
                                  <button
                                    className="btn btn-success btn-sm mr-1"
                                    onClick={() => {
                                      setSelectedReservation(row),
                                        setEndReservationModal(true);
                                      setEndDateTime(new Date());
                                    }}
                                  >
                                    End
                                  </button>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      setSelectedReservation(row),
                                        setEditReservationModal(true);
                                      const temp =
                                        row.reserve_date.split("T")[0] +
                                        " " +
                                        row.start_time;
                                      setStartDateTime(new Date(temp));
                                    }}
                                  >
                                    Edit
                                  </button>
                                </>
                              ) : row.status_name === "Completed" ? (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    setSelectedReservation(row);
                                  }}
                                >
                                  Info
                                </button>
                              ) : (
                                ""
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No reservations found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* /.card */}
          </div>
        </div>
      </div>
      {(startReservationModal || editReservationModal) &&
        selectedReservation && (
          <div
            className="modal fade show"
            id="reservationDetailsModal"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="startReservationModalLabel"
            aria-hidden="true"
            style={{ display: "block" }} // Only needed if you want to show the modal immediately
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="startReservationModalLabel">
                    {startReservationModal
                      ? "Start Reservation"
                      : "Edit Reservation"}
                  </h5>
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={() => {
                      setSelectedReservation(null),
                        setStartReservationModal(false);
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
                  {startReservationModal ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        startReservation();
                      }}
                      disabled={isStarting}
                    >
                      {isStarting ? "Starting..." : "Start now"}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary me-2"
                        onClick={() => {
                          // Handle start reservation logic here
                          editReservation();
                          setSelectedReservation(null);
                          setStartReservationModal(false);
                        }}
                        disabled={isEditting}
                      >
                        {isEditting ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          setCancelReservationConfirmation(true);
                        }}
                      >
                        Cancel Reservation
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-dismiss="modal"
                    onClick={() => {
                      setSelectedReservation(null),
                        setStartReservationModal(false);
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

      {/* End Reservation Modal - Now using the separate component */}
      <EndReservationModal
        isOpen={endReservationModal}
        selectedReservation={selectedReservation}
        endDateTime={endDateTime}
        setEndDateTime={setEndDateTime}
        startDateTime={startDateTime}
        onClose={handleCloseEndModal}
        onEndReservation={handleEndReservation}
        isEnding={isEnding}
      />

      {cancelReservationConfirmation && selectedReservation && (
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

export default Reservations;
