import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./styles/Dashboard.css";
import BASE_URL, { BASE_IMAGES_URL } from "../config.js";

const VehicleInfo = () => {
  const { id } = useParams();
  const [vehicleData, setVehicleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/fetchVehicleData?licensePlate=${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setVehicleData(data.vehicleData);
        setServiceRecords(data.serviceRecords);
        setIsLoading(false);
        console.log("Vehicle data fetched successfully:", data);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
        setIsLoading(false);
      }
    };

    fetchVehicleData();
  }, [id]);

  return (
    <div
      className="container mt-5 bg-transparent"
      style={{ minHeight: "100vh" }}
    >
      <div className="row">
        <div className="col-md-12">
          <h2
            className="text-darkblue mb-3 fw-bold"
            style={{ fontSize: "40px" }}
          >
            Vehicle Information
          </h2>

          <div className="card mb-3 p-4">
            {vehicleData ? (
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 d-flex justify-content-center">
                    <img
                      src={`${BASE_IMAGES_URL}${vehicleData.imgpath}`}
                      style={{
                        height: "250px",
                        width: "auto",
                        objectFit: "cover",
                      }}
                      alt="Vehicle"
                      className="img-fluid rounded"
                    />
                  </div>
                  <div className="col-md-8">
                    <form>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">License Plate</label>
                          <input
                            type="text"
                            className="form-control"
                            value={vehicleData.license_plate}
                            readOnly
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Vehicle Type</label>
                          <input
                            type="text"
                            className="form-control"
                            value={vehicleData.vehicle_type}
                            readOnly
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Make(Brand)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={vehicleData.vehicle_brand}
                            readOnly
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Model</label>
                          <input
                            type="text"
                            className="form-control"
                            value={vehicleData.model}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Year</label>
                          <input
                            type="number"
                            className="form-control"
                            value={vehicleData.make_year}
                            readOnly
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Color</label>
                          <input
                            type="text"
                            className="form-control"
                            value={vehicleData.color}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Transmission Type
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={vehicleData.transmission_type}
                            readOnly
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Fuel Type</label>
                          <input
                            type="text"
                            className="form-control"
                            value={vehicleData.fuel_type}
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-danger">
                          Update
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-body text-center">
                <p className="text-muted">Loading vehicle data...</p>
              </div>
            )}
          </div>

          <h2
            className="text-darkblue mt-4 mb-2 fw-bold"
            style={{ fontSize: "30px" }}
          >
            Service Records : {vehicleData ? vehicleData.license_plate : "----"}
          </h2>
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Res ID</th>
                      <th>Service Type</th>
                      <th>Description</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Final amount</th>
                      <th>Payment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          <div
                            className="spinner-border text-primary mt-4"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : serviceRecords && serviceRecords.length > 0 ? (
                      serviceRecords.map((record) => (
                        <tr key={record.reservation_id}>
                          <td>{record.reservation_id}</td>
                          <td>{record.service_name}</td>
                          <td>{record.service_description}</td>
                          <td>
                            {new Date(record.reserve_date).toLocaleDateString()}
                          </td>
                          <td>
                            {new Date(record.end_date).toLocaleDateString()}
                          </td>
                          <td>Rs. {record.final_amount}</td>
                          <td>
                            {record.is_paid ? (
                              <span className="badge bg-success">Paid</span>
                            ) : (
                              <span className="badge bg-danger">Not Paid</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => setSelectedRecord(record)}
                            >
                              info
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No service records available.
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

      {/* Service Record Details Modal */}
      {selectedRecord && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Service Record Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRecord(null)}
                ></button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <tbody>
                    <tr>
                      <th>Reservation ID</th>
                      <td>{selectedRecord.reservation_id}</td>
                    </tr>
                    <tr>
                      <th>Service Name</th>
                      <td>{selectedRecord.service_name}</td>
                    </tr>
                    <tr>
                      <th>Description</th>
                      <td>{selectedRecord.service_description}</td>
                    </tr>
                    <tr>
                      <th>Reserve Date</th>
                      <td>
                        {new Date(
                          selectedRecord.reserve_date
                        ).toLocaleDateString("en-CA")}
                        {"   "}
                        {selectedRecord.start_time.substring(0, 5)}
                      </td>
                    </tr>
                    <tr>
                      <th>End Date</th>
                      <td>
                        {new Date(selectedRecord.end_date).toLocaleDateString(
                          "en-CA"
                        )}
                        {"   "}
                        {selectedRecord.end_time.substring(0, 5)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              
                <div className="table-responsive">
                  <table className="table table-bordered table-striped mt-3">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.payment_items && selectedRecord.payment_items.length > 0
                        ? selectedRecord.payment_items.map((service) => (
                            <tr key={service.id}>
                              <td>{service.description}</td>
                              <td>Rs. {service.price}</td>
                            </tr>
                          ))
                        : (
                            <tr>
                              <td colSpan="2" className="text-center">
                                No services found.
                              </td>
                            </tr>
                          )}
                    </tbody>
                  </table>
                </div>

                <table className="table">
                  <tbody>
                    <tr>
                      <th>Service cost</th>
                      <td>Rs. {selectedRecord.service_cost}</td>
                    </tr>
                    <tr>
                      <th>Discount</th>
                      <td>Rs. {selectedRecord.discount}</td>
                    </tr>
                    <tr>
                      <th>Net amount</th>
                      <td>Rs. {selectedRecord.final_amount}</td>
                    </tr>
                    <tr>
                      <th>Is Paid</th>
                      <td>
                        {selectedRecord.is_paid ? (
                          <span className="badge bg-success">Paid</span>
                        ) : (
                          <span className="badge bg-danger">Not Paid</span>
                        )}
                      </td>
                    </tr>
                    {/* Add more fields if needed */}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRecord(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleInfo;
