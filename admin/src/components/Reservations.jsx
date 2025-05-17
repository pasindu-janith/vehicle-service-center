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
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const tableRef = useRef(null);
  const dtInstance = useRef(null); // To store the DataTable instance

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
        `http://localhost:4000/api/v1/admin/filterReservationData?serviceType=${serviceType}&vehicleNumber=${vehicleNumber}&startDateTime=${startDateTime.toISOString()}&endDateTime=${endDateTime.toISOString()}`,
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
                          onChange={(date) => setStartDateTime(date)}
                          value={startDateTime}
                          maxDate={endDateTime}
                          className="datetimepick col-md-8 col-12"
                        />
                      </div>
                      <div className="col-md-4 pt-3">
                        <label>End Date-Time:</label>
                        <DateTimePicker
                          onChange={(date) => setEndDateTime(date)}
                          value={endDateTime}
                          minDate={startDateTime}
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
                      <th>Time start</th>
                      <th>Time due</th>
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
                          <td>{row.start_time}</td>
                          <td>{row.end_time}</td>
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
                                <button className="btn btn-warning btn-sm mr-1">
                                  Start
                                </button>
                                <button className="btn btn-primary btn-sm">
                                  Edit
                                </button>
                                {/* <button className="btn btn-warning btn-sm me-2">
                                  Cancel
                                </button> */}
                              </>
                            ) : row.status_name === "Ongoing" ? (
                              <>
                                <button className="btn btn-success btn-sm mr-1">
                                  End
                                </button>
                                <button className="btn btn-primary btn-sm">
                                  Edit
                                </button>
                              </>
                            ) : row.status_name === "Completed" ? (
                              <button className="btn btn-primary btn-sm">
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
            {/* /.card */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservations;
