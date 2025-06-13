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
  const tableRef = useRef(null);
  const dtInstance = useRef(null); // To store the DataTable instance

  const handleDateTimeChange = (date) => {
    if (date) {
      // Create ISO string without timezone conversion
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      return localDateTime;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/admin/loadAllReservations"
        );
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
        const response = await fetch(
          "http://localhost:4000/api/v1/user/loadServiceTypes",
          {
            method: "GET",
          }
        );
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

    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/admin/filterReservationData?serviceType=${serviceType}&vehicleNumber=${vehicleNumber}&startDateTime=${startDateTimeFilter.toLocaleString()}&endDateTime=${endDateTimeFilter.toLocaleString()}`,
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
    const startTime = startDateTime.toISOString();
    const endTime = endDateTime ? endDateTime.toISOString() : null;
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/admin/startReservation?reservationId=${selectedReservation.reservation_id}&startDateTime=${startTime.toLocaleString()}&endDateTime=${endTime.toLocaleString()}`,
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
              ? { ...row, ...updatedData }
              : row
          )
        );
        setStartReservationModal(false);
        setSelectedReservation(null);
      } else {
        const errorData = await response.json();
        console.error("Error starting reservation:", errorData);
      }
    } catch (error) {
      console.error("Error starting reservation:", error);
    }
  };

  const endReservation = async () => {
    if (!selectedReservation) return;
    const endTime = endDateTime ? endDateTime.toISOString() : null;
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/admin/endReservation?reservationId=${selectedReservation.reservation_id}&endTime=${endTime.toLocaleString()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reservationId: selectedReservation.reservation_id,
            endTime: endTime,
          }),
        }
      );
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

  const handleRowClick = (row) => {
    setSelectedReservation(row);
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
                            alert(startDateTimeFilter);
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
                            alert(endDateTimeFilter);
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
                                    }}
                                  >
                                    Start
                                  </button>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      setSelectedReservation(row),
                                        setEditReservationModal(true);
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
                                    }}
                                  >
                                    End
                                  </button>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                      setSelectedReservation(row),
                                        setEditReservationModal(true);
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
                    >
                      Start Now
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary me-2"
                        onClick={() => {
                          // Handle start reservation logic here
                          console.log(
                            "Starting reservation for:",
                            selectedReservation
                          );
                          setStartReservationModal(false);
                        }}
                      >
                        Edit
                      </button>
                      <button className="btn btn-danger">
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
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {endReservationModal && selectedReservation && (
        <div
          className="modal fade show"
          id="endReservationModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="endReservationModalLabel"
          aria-hidden="true"
          style={{ display: "block" }} // Only needed if you want to show the modal immediately
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="endReservationModalLabel">
                  End Reservation
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    setSelectedReservation(null), setEndReservationModal(false);
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body d-flex align-items-center">
                <div className="col-md-12 col-12">
                  <div className="form-group">
                    <div className="row">
                      <div className="col-md-6">
                        <label htmlFor="">Reservation ID</label>
                        <input
                          type="text"
                          className="form-control mb-3"
                          id="reservationIdEnd"
                          value={selectedReservation.reservation_id}
                          readOnly
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="">Vehicle Number</label>
                        <input
                          type="text"
                          className="form-control mb-3"
                          id="vehicleNumberEnd"
                          value={selectedReservation.vehicle_id}
                          readOnly
                        />
                      </div>
                      <div className="col-md-6">
                        {" "}
                        <label htmlFor="">Service Type</label>
                        <input
                          type="text"
                          className="form-control mb-3"
                          value={selectedReservation.service_name}
                          readOnly
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="">End time</label>
                        <DateTimePicker
                          onChange={(date) => setEndDateTime(date)}
                          value={new Date()}
                          minDate={startDateTime}
                          className="datetimepick col-12 mb-3"
                        />
                      </div>
                      <div className="col-md-12">
                        <label htmlFor="">Service Details</label>
                        <textarea
                          className="form-control mb-3"
                          rows="3"
                          placeholder="Enter any notes or comments here..."
                        ></textarea>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="">Service Cost</label>
                        <input
                          type="number"
                          className="form-control mb-3"
                          placeholder="Enter service cost"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    endReservation();
                  }}
                >
                  End now
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
