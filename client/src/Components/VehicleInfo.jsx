import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BiLoaderAlt,
  BiCar,
  BiCalendar,
  BiEditAlt,
  BiCheckCircle,
  BiXCircle,
  BiReceipt,
} from "react-icons/bi";
import {
  MdOutlinePalette,
  MdOutlineSpeed,
  MdLocalGasStation,
  MdDateRange,
  MdPayment,
} from "react-icons/md";
import { AiOutlineFileText, AiOutlineEye } from "react-icons/ai";
import { FiSettings, FiTool } from "react-icons/fi";
import "./styles/Dashboard.css";
import BASE_URL, { BASE_IMAGES_URL } from "../config.js";
import toastr from "toastr";

const VehicleInfo = () => {
  const { id } = useParams();
  const [vehicleData, setVehicleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
        setEditedData(data.vehicleData);
        setIsLoading(false);
        console.log("Vehicle data fetched successfully:", data);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
        setIsLoading(false);
      }
    };

    fetchVehicleData();
  }, [id]);

  const handleEditToggle = () => {
    if (isEditing) {
      setVehicleData(editedData);
      // Save changes logic can be added here
      // For now, just toggle editing state
      if (editedData.license_plate.trim() === "") {
        toastr.error("License plate cannot be empty");
        return;
      }
      if (editedData.model.trim() === "") {
        toastr.error("Model cannot be empty");
        return;
      }
      if (editedData.color.trim() === "") {
        toastr.error("Color cannot be empty");
        return;
      }
      // Update vehicle data on the server
      const updateVehicleData = async () => {
        try {
          const response = await fetch(`${BASE_URL}/updateVehicleData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(editedData),
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              toastr.success("Vehicle details updated successfully");
              setVehicleData(editedData);
            } else {
              toastr.error(
                result.message || "Failed to update vehicle details"
              );
            }
          } else {
            toastr.error("Failed to update vehicle details");
          }
        } catch (error) {
          console.error("Error updating vehicle data:", error);
          toastr.error("An error occurred while updating vehicle details");
        }
      };
    }
    // Toggle editing state

    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredServiceRecords = serviceRecords.filter((record) => {
    const matchesSearch =
      record.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reservation_id.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && record.is_paid) ||
      (statusFilter === "unpaid" && !record.is_paid);
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mt-5" style={{ minHeight: "100vh" }}>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="text-center">
            <spinner className="spinner-border text-primary mb-3" role="status" style={{ width: "4rem", height: "4rem" }}>
              <span className="visually-hidden">Loading...</span>
            </spinner>
            <h4 className="text-muted">Loading vehicle information...</h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <div>
          <h2
            className="mb-1 fw-bold main-title"
            style={{ fontSize: "2.5rem" }}
          >
            Vehicle Information
          </h2>
          <p className="text-muted mb-0">
            {vehicleData
              ? `${vehicleData.vehicle_brand} ${vehicleData.model} • ${vehicleData.license_plate}`
              : "Loading..."}
          </p>
        </div>
      </div>

      {vehicleData ? (
        <>
          {/* Vehicle Details Card */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row">
                {/* Vehicle Image */}
                <div className="col-lg-4 mb-4 mb-lg-0">
                  <div className="position-relative">
                    <img
                      src={`${BASE_IMAGES_URL}${vehicleData.imgpath}`}
                      style={{
                        height: "280px",
                        width: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                      alt="Vehicle"
                    />
                  </div>
                </div>

                {/* Vehicle Details Form */}
                <div className="col-lg-8">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold text-dark mb-0">Vehicle Details</h4>
                    <button
                      type="button"
                      className={`btn ${
                        isEditing ? "btn-success" : "btn-outline-primary"
                      }`}
                      onClick={handleEditToggle}
                      style={{ borderRadius: "10px" }}
                    >
                      {isEditing ? (
                        <>
                          <BiCheckCircle size={16} className="me-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <BiEditAlt size={16} className="me-2" />
                          Edit Details
                        </>
                      )}
                    </button>
                  </div>

                  <form>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <BiCar className="me-2 text-dark" size={16} />
                          License Plate
                        </label>
                        <input
                          type="text"
                          className="form-control form-control"
                          value={
                            isEditing
                              ? editedData.license_plate
                              : vehicleData.license_plate
                          }
                          onChange={(e) =>
                            handleInputChange("license_plate", e.target.value)
                          }
                          readOnly={!isEditing}
                          style={{
                            borderRadius: "10px",
                            backgroundColor: !isEditing ? "#f8f9fa" : "white",
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <FiSettings className="me-2 text-dark" size={16} />
                          Vehicle Type
                        </label>
                        <input
                          type="text"
                          className="form-control form-control"
                          value={vehicleData.vehicle_type}
                          readOnly
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "#f8f9fa",
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          Brand
                        </label>
                        <input
                          type="text"
                          className="form-control form-control"
                          value={vehicleData.vehicle_brand}
                          readOnly
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "#f8f9fa",
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          Model
                        </label>
                        <input
                          type="text"
                          className="form-control form-control"
                          value={
                            isEditing ? editedData.model : vehicleData.model
                          }
                          onChange={(e) =>
                            handleInputChange("model", e.target.value)
                          }
                          readOnly={!isEditing}
                          style={{
                            borderRadius: "10px",
                            backgroundColor: !isEditing ? "#f8f9fa" : "white",
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <MdDateRange className="me-2 text-dark" size={16} />
                          Year
                        </label>
                        <input
                          type="number"
                          className="form-control form-control"
                          value={vehicleData.make_year}
                          readOnly
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "#f8f9fa",
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <MdOutlinePalette
                            className="me-2 text-dark"
                            size={16}
                          />
                          Color
                        </label>
                        <input
                          type="text"
                          className="form-control form-control"
                          value={
                            isEditing ? editedData.color : vehicleData.color
                          }
                          onChange={(e) =>
                            handleInputChange("color", e.target.value)
                          }
                          readOnly={!isEditing}
                          style={{
                            borderRadius: "10px",
                            backgroundColor: !isEditing ? "#f8f9fa" : "white",
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <MdOutlineSpeed
                            className="me-2 text-dark"
                            size={16}
                          />
                          Transmission
                        </label>
                        <input
                          type="text"
                          className="form-control form-control"
                          value={vehicleData.transmission_type}
                          readOnly
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "#f8f9fa",
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <MdLocalGasStation
                            className="me-2 text-dark"
                            size={16}
                          />
                          Fuel Type
                        </label>
                        <input
                          type="text"
                          className="form-control form-control"
                          value={vehicleData.fuel_type}
                          readOnly
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "#f8f9fa",
                          }}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Service Records Section */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="fw-bold mb-1">
                    <FiTool className="me-2 text-primary" />
                    Service History
                  </h4>
                  <p className="text-muted mb-0">
                    Complete service record for {vehicleData.license_plate}
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card-body border-bottom">
              <div className="row align-items-center">
                <div className="col-md-6 mb-2 mb-md-0">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by service or reservation ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid Only</option>
                    <option value="unpaid">Unpaid Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 fw-semibold ps-4">Res ID</th>
                      <th className="border-0 fw-semibold">Service</th>
                      <th className="border-0 fw-semibold">Description</th>
                      <th className="border-0 fw-semibold">Date Range</th>
                      <th className="border-0 fw-semibold">Amount</th>
                      <th className="border-0 fw-semibold">Payment</th>
                      <th className="border-0 fw-semibold pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServiceRecords.length > 0 ? (
                      filteredServiceRecords.map((record) => (
                        <tr key={record.reservation_id}>
                          <td className="ps-4 fw-semibold text-primary">
                            {record.reservation_id}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FiTool className="text-muted me-2" size={16} />
                              {record.service_name}
                            </div>
                          </td>
                          <td>
                            <span className="text-muted small">
                              {record.service_description}
                            </span>
                          </td>
                          <td>
                            <div className="small">
                              <div className="d-flex align-items-center mb-1">
                                <BiCalendar
                                  className="text-muted me-1"
                                  size={14}
                                />
                                <span>
                                  {new Date(
                                    record.reserve_date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="d-flex align-items-center">
                                <BiCalendar
                                  className="text-muted me-1"
                                  size={14}
                                />
                                <span>
                                  {new Date(
                                    record.end_date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="fw-semibold">
                            Rs.{" "}
                            {parseFloat(record.final_amount || 0).toFixed(2)}
                          </td>
                          <td>
                            {record.is_paid ? (
                              <span className="badge bg-success d-flex align-items-center w-fit">
                                <BiCheckCircle className="me-1" size={14} />
                                Paid
                              </span>
                            ) : (
                              <span className="badge bg-danger d-flex align-items-center w-fit">
                                <BiXCircle className="me-1" size={14} />
                                Unpaid
                              </span>
                            )}
                          </td>
                          <td className="pe-4">
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => setSelectedRecord(record)}
                              title="View details"
                              style={{ borderRadius: "8px" }}
                            >
                              <AiOutlineEye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="text-muted">
                            <FiTool size={48} className="mb-3 opacity-25" />
                            <h5>No service records found</h5>
                            <p className="mb-0">
                              {searchTerm || statusFilter !== "all"
                                ? "Try adjusting your search or filter criteria"
                                : "This vehicle hasn't had any services yet"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <BiXCircle size={64} className="text-danger mb-3" />
            <h4 className="text-muted">Vehicle not found</h4>
            <p className="text-muted">
              The requested vehicle could not be found or loaded.
            </p>
          </div>
        </div>
      )}

      {/* Service Record Details Modal */}
      {selectedRecord && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-xl modal-dialog-scrollable"
            role="document"
          >
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="modal-title fw-bold">
                    <BiReceipt className="me-2 text-primary" />
                    Service Record Details
                  </h5>
                  <p className="text-muted mb-0 small">
                    Reservation #{selectedRecord.reservation_id}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRecord(null)}
                ></button>
              </div>

              <div className="modal-body">
                {/* Service Overview */}
                <div className="card border-0 bg-light mb-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <h6 className="fw-semibold mb-3">
                          Service Information
                        </h6>
                        <div className="mb-2">
                          <strong>Service:</strong>{" "}
                          {selectedRecord.service_name}
                        </div>
                        <div className="mb-2">
                          <strong>Description:</strong>{" "}
                          {selectedRecord.service_description}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <h6 className="fw-semibold mb-3">Timeline</h6>
                        <div className="mb-2">
                          <BiCalendar className="text-primary me-2" size={16} />
                          <strong>Start:</strong>{" "}
                          {new Date(
                            selectedRecord.reserve_date
                          ).toLocaleDateString("en-CA")}{" "}
                          {selectedRecord.start_time.substring(0, 5)}
                        </div>
                        <div className="mb-2">
                          <BiCalendar className="text-primary me-2" size={16} />
                          <strong>End:</strong>{" "}
                          {new Date(selectedRecord.end_date).toLocaleDateString(
                            "en-CA"
                          )}{" "}
                          {selectedRecord.end_time.substring(0, 5)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Items */}
                {selectedRecord.payment_items &&
                  selectedRecord.payment_items.length > 0 && (
                    <div className="mb-4">
                      <h6 className="fw-semibold mb-3">
                        <AiOutlineFileText className="me-2 text-primary" />
                        Service Items
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>Service Description</th>
                              <th className="text-end">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedRecord.payment_items.map(
                              (service, index) => (
                                <tr key={service.id || index}>
                                  <td>{service.description}</td>
                                  <td className="text-end fw-semibold">
                                    Rs.{" "}
                                    {parseFloat(service.price || 0).toFixed(2)}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Payment Summary */}
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">
                      <MdPayment className="me-2 text-primary" />
                      Payment Summary
                    </h6>
                    <div className="row">
                      <div className="col-md-8">
                        <div className="d-flex justify-content-between py-2">
                          <span>Service Cost:</span>
                          <span className="fw-semibold">
                            Rs.{" "}
                            {parseFloat(
                              selectedRecord.service_cost || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between py-2 text-success">
                          <span>Discount:</span>
                          <span className="fw-semibold">
                            - Rs.{" "}
                            {parseFloat(selectedRecord.discount || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between py-2 fs-5">
                          <span className="fw-bold">Net Amount:</span>
                          <span className="fw-bold text-primary">
                            Rs.{" "}
                            {parseFloat(
                              selectedRecord.final_amount || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4 text-end">
                        <div className="mt-3">
                          <span className="text-muted small d-block mb-2">
                            Payment Status
                          </span>
                          {selectedRecord.is_paid ? (
                            <span className="badge bg-success fs-6 px-3 py-2">
                              <BiCheckCircle className="me-1" />
                              Paid
                            </span>
                          ) : (
                            <span className="badge bg-danger fs-6 px-3 py-2">
                              <BiXCircle className="me-1" />
                              Not Paid
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedRecord(null)}
                  style={{ borderRadius: "10px" }}
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
