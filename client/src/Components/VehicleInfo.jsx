import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./styles/Dashboard.css";

const VehicleInfo = () => {
  const { id } = useParams();
  console.log("Vehicle ID from URL:", id);
  const [vehicleData, setVehicleData] = useState(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/user/fetchVehicleData?licensePlate=${id}`,
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
        setVehicleData(data);
        console.log("Vehicle data fetched successfully:", data);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    };

    fetchVehicleData();
  });

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
                      src={`http://localhost:4000${vehicleData.imgpath}`}
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

          <div className="card">
            <div className="card-header">
              <h4>Service Records</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfo;
