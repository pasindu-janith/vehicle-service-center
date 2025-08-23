import { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import images from "../assets/assets";
import { BASE_IMAGES_URL, BASE_URL } from "../config.js";

const Vehicle = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleOwner, setVehicleOwner] = useState(null);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [selectedRecordModal, setSelectedRecordModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(false);

  const tableRef = useRef(null);
  const dtInstance = useRef(null); // To store the DataTable instance

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadAllVehicles`, {
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

  const loadVehicleData = async (vehicleID) => {
    try {
      const response = await fetch(
        `${BASE_URL}/loadVehicleInfo?vehicleNumber=` + vehicleID
      );
      if (response.ok) {
        const jsonData = await response.json();
        setVehicleOwner(jsonData.vehicleOwner);
        setServiceRecords(jsonData.serviceRecords);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <section className="content">
      <div className="container-fluid pt-3">
        <h3>Vehicle</h3>
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Vehicles search</h3>
                <div className="card-tools">
                  <button
                    type="button"
                    className="btn btn-tool"
                    data-card-widget="collapse"
                  >
                    <i className="fas fa-minus" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-tool"
                    data-card-widget="remove"
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>
              </div>

              {/* /.card-header */}
              <div className="card-body">
                <table
                  id="example2"
                  ref={tableRef}
                  className="table table-bordered table-hover"
                >
                  <thead>
                    <tr>
                      <th>License</th>
                      <th>Brand</th>
                      <th>Model</th>
                      <th>Type</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length > 0 ? (
                      tableData.map((row) => (
                        <tr key={row.license_plate}>
                          <td>{row.license_plate}</td>
                          <td>{row.vehicle_brand}</td>
                          <td>{row.model}</td>
                          <td>{row.vehicle_type}</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedVehicle(row);
                                loadVehicleData(row.license_plate);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No ongoing services found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* /.card-body */}
            </div>
            {/* /.card */}
          </div>
          <div className="col-md-6">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Vehicle Details</h3>
              </div>
              {/* /.card-header */}
              {/* form start */}
              <form>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-7 col-12">
                      <img
                        src={`${BASE_IMAGES_URL}${
                          selectedVehicle ? selectedVehicle.imgpath : images.car
                        }`}
                        style={{
                          height: "200px",
                          width: "auto",
                          objectFit: "cover",
                        }}
                        alt="Select Vehicle"
                        className="img-fluid rounded"
                      />
                    </div>
                    <div className="col-md-5">
                      <div className="form-group">
                        <label htmlFor="vehicleno">Vehicle Number</label>
                        <input
                          type="text"
                          className="form-control"
                          id="vehicleno"
                          value={selectedVehicle?.license_plate || ""}
                          name="vehicleno"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <input
                          type="text"
                          value={selectedVehicle?.vehicle_type || ""}
                          className="form-control"
                          id="type"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="brand">Brand</label>
                        <input
                          type="text"
                          className="form-control"
                          value={selectedVehicle?.vehicle_brand || ""}
                          id="brand"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="modal">Model</label>
                    <input
                      type="text"
                      value={selectedVehicle?.model || ""}
                      className="form-control"
                      id="modal"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Color</label>
                    <input
                      type="text"
                      value={selectedVehicle?.color || ""}
                      className="form-control"
                      id="exampleInputPassword1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">
                      Manufacture year
                    </label>
                    <input
                      type="text"
                      value={selectedVehicle?.make_year || ""}
                      className="form-control"
                      id="exampleInputPassword1"
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="brand">Transmission</label>
                        <input
                          type="text"
                          value={selectedVehicle?.transmission_type || ""}
                          className="form-control"
                          id="exampleInputEmail1"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="brand">Fuel</label>
                        <input
                          type="text"
                          className="form-control"
                          value={selectedVehicle?.fuel_type || ""}
                          id="exampleInputEmail1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* /.card-body */}
                <div className="card-footer">
                  <button type="reset" className="btn btn-primary">
                    Reset
                  </button>
                </div>
              </form>
            </div>
            {/* /.card */}
          </div>
          <div className="container">
            <div className="card">
              <div className="card-header bg-primary">Owner Details</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <img src={images.profile} className="col-12" />
                  </div>
                  <div className="col-md-9">
                    <table className="table">
                      <tr>
                        <td>Full Name</td>
                        <td>
                          {vehicleOwner
                            ? vehicleOwner.first_name +
                              " " +
                              vehicleOwner.last_name
                            : "N/A"}
                        </td>
                      </tr>

                      <tr>
                        <td>NIC</td>
                        <td>{vehicleOwner?.nicno || "N/A"}</td>
                      </tr>
                      <tr>
                        <td>Mobile Number</td>
                        <td>{vehicleOwner?.mobile_no || "N/A"}</td>
                      </tr>
                      <tr>
                        <td>Email</td>
                        <td>{vehicleOwner?.email || "N/A"}</td>
                      </tr>
                      <tr>
                        <td>Address</td>
                        <td>
                          {vehicleOwner
                            ? vehicleOwner.address_line1 +
                              ", " +
                              vehicleOwner.address_line2 +
                              ", " +
                              vehicleOwner.address_line3
                            : "N/A"}
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container-fluid">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Service Records</h3>
              </div>
              <div className="card-body">
                <table
                  id="example1"
                  className="table table-bordered table-hover"
                >
                  <thead>
                    <tr>
                      <th>Res ID</th>
                      <th>Service</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRecords.length > 0 ? (
                      serviceRecords.map((record) => (
                        <tr key={record.reservation_id}>
                          <td>{record.reservation_id}</td>
                          <td>{record.service_name}</td>
                          <td>
                            {new Date(record.reserve_date).toLocaleDateString(
                              "en-CA"
                            )}
                            {"  "}
                            {record.start_time.substring(0, 5)}
                          </td>
                          <td>
                            {new Date(record.end_date).toLocaleDateString(
                              "en-CA"
                            )}
                            {"  "}
                            {record.end_time.substring(0, 5)}
                          </td>
                          <td>{record.service_description}</td>
                          <td>{record.final_amount}</td>
                          <td>
                            {record.is_paid ? (
                              <span className="badge bg-success">Paid</span>
                            ) : (
                              <span className="badge bg-danger">Pending</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => {
                                setSelectedRecord(record);
                                setSelectedRecordModal(true);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No service records found.
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
      {/* Modal for Service Record Details */}
      {selectedRecordModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-lg modal-dialog-scrollable"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Service Record Details</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setSelectedRecordModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Reservation ID:</strong>
                      </td>
                      <td>{selectedRecord.reservation_id}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Vehicle:</strong>
                      </td>
                      <td>
                        {selectedVehicle.license_plate}{" "}
                        {selectedVehicle.vehicle_brand} {selectedVehicle.model}{" "}
                        {selectedVehicle.vehicle_type}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Service Name:</strong>
                      </td>
                      <td>{selectedRecord.service_name}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>From:</strong>
                      </td>
                      <td>
                        {new Date(
                          selectedRecord.reserve_date
                        ).toLocaleDateString("en-CA")}{" "}
                        {selectedRecord.start_time?.substring(0, 5)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>To:</strong>
                      </td>
                      <td>
                        {new Date(selectedRecord.end_date).toLocaleDateString(
                          "en-CA"
                        )}{" "}
                        {selectedRecord.end_time?.substring(0, 5)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Description:</strong>
                      </td>
                      <td>{selectedRecord.service_description}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Payment Status:</strong>
                      </td>
                      <td>{selectedRecord.is_paid ? "Paid" : "Pending"}</td>
                    </tr>
                  </tbody>
                </table>

                {selectedRecord.payment_items?.length > 0 && (
                  <table className="table table-bordered mt-3">
                    <thead>
                      <tr>
                        <th>Service Name</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.payment_items.map((service) => (
                        <tr key={service.id}>
                          <td>{service.description}</td>
                          <td>{service.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <table
                  style={{
                    width: "100%",
                    fontSize: "1.25rem",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "left", padding: "4px 8px" }}>
                        <strong>Service Cost:</strong>
                      </td>
                      <td style={{ textAlign: "right", padding: "4px 8px" }}>
                        Rs. {selectedRecord.service_cost}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "left", padding: "4px 8px" }}>
                        <strong>Discount:</strong>
                      </td>
                      <td style={{ textAlign: "right", padding: "4px 8px" }}>
                        Rs. {selectedRecord.discount}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "left", padding: "4px 8px" }}>
                        <strong>Net Amount:</strong>
                      </td>
                      <td style={{ textAlign: "right", padding: "4px 8px" }}>
                        Rs. {selectedRecord.final_amount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRecordModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Vehicle;
