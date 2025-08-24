import React, { useState } from "react";
import { Link } from "react-router-dom";
import images from "../Assets/assets";
import { MdDelete, MdDirectionsCar, MdCalendarToday, MdBrandingWatermark } from "react-icons/md";
import { IoMdInformationCircleOutline, IoMdClose } from "react-icons/io";
import { FaPlus, FaCar, FaExclamationTriangle } from "react-icons/fa";
import { useEffect } from "react";
import "./styles/Dashboard.css";
import BASE_URL from "../config";

const MyVehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    const loadAllUserVehicles = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadAllUserVehicles`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setVehicles(data);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };
    loadAllUserVehicles();
  }, []);

  const handleOpenDeleteModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedVehicle(null);
  };

  const deleteVehicle = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/deleteVehicle?licensePlate=${selectedVehicle.license_plate}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        setVehicles((prevVehicles) =>
          prevVehicles.filter(
            (vehicle) => vehicle.license_plate !== selectedVehicle.license_plate
          )
        );
        handleCloseDeleteModal();
      } else {
        console.error("Failed to delete vehicle");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  return (
    <div className="container px-4 py-4 bg-transparent" style={{ minHeight: "100vh" }}>
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <MdDirectionsCar className="text-darkblue me-3" size={48} />
              <div>
                <h1 className="mb-1 main-title" style={{ fontSize: "2.5rem" }}>
                  My Vehicles
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="row g-4">
        {isLoading ? (
          <div className="col-12">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
              <div className="text-center">
                <spinner className="spinner-border text-primary" role="status" style={{ width: "3.5rem", height: "3.5rem" }}>
                  <span className="visually-hidden">Loading...</span>
                </spinner>
                <h4 className="mt-3">Loading your vehicles...</h4>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Vehicle Cards */}
            {vehicles.map((vehicle) => (
              <div className="col-xl-3 col-lg-4 col-md-6" key={vehicle.license_plate}>
                <div className="card h-100 shadow-sm border-0 vehicle-card-hover">
                  {/* Vehicle Image */}
                  <div className="position-relative overflow-hidden" style={{ height: "220px" }}>
                    <img
                      src={`${vehicle.imgpath}`}
                      className="card-img-top w-100 h-100"
                      style={{ objectFit: "cover" }}
                      alt={`${vehicle.vehicle_brand} ${vehicle.model}`}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                      <span className="badge bg-primary px-3 py-2">
                        {vehicle.vehicle_type}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="card-body d-flex flex-column">
                    {/* License Plate */}
                    <div className="text-center mb-3">
                      <h4 className="card-title text-primary fw-bold mb-0">
                        {vehicle.license_plate}
                      </h4>
                    </div>
                    
                    {/* Vehicle Details */}
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <MdBrandingWatermark className="text-muted me-2" size={18} />
                        <span className="text-dark fw-medium">
                          {vehicle.vehicle_brand}
                        </span>
                      </div>
                      
                      <div className="d-flex align-items-center mb-2">
                        <FaCar className="text-muted me-2" size={16} />
                        <span className="text-muted">
                          {vehicle.model}
                        </span>
                      </div>
                      
                      <div className="d-flex align-items-center mb-3">
                        <MdCalendarToday className="text-muted me-2" size={16} />
                        <span className="text-muted">
                          {vehicle.make_year}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="d-grid gap-2">
                      <button
                        onClick={() =>
                          (window.location.href = `/myaccount/vehicle-info/${vehicle.license_plate}`)
                        }
                        className="btn btn-outline-primary"
                      >
                        <IoMdInformationCircleOutline className="me-2" size={18} />
                        View Details
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(vehicle)}
                        className="btn btn-outline-danger"
                      >
                        <MdDelete className="me-2" size={18} />
                        Remove Vehicle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Vehicle Card */}
            <div className="col-xl-3 col-lg-4 col-md-6">
              <Link to="/myaccount/add-vehicle" className="text-decoration-none">
                <div className="card h-100 border-2 border-dashed text-center vehicle-add-card">
                  <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                    <div className="mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                        <FaPlus className="text-primary" size={32} />
                      </div>
                    </div>
                    <h4 className="text-primary mb-2">Add New Vehicle</h4>
                    <p className="text-muted mb-0">
                      Register a new vehicle to your account
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Empty State */}
            {vehicles.length === 0 && (
              <div className="col-12">
                <div className="text-center py-5">
                  <div className="mb-4">
                    <FaCar className="text-muted" size={80} />
                  </div>
                  <h3 className="text-muted mb-3">No vehicles registered yet</h3>
                  <p className="text-muted mb-4">
                    Start by adding your first vehicle to get started
                  </p>
                  <Link to="/myaccount/add-vehicle" className="btn btn-primary btn-lg">
                    <FaPlus className="me-2" />
                    Add Your First Vehicle
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {selectedVehicle && showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center">
                  <div className="bg-danger bg-opacity-10 rounded-circle p-2 me-3">
                    <FaExclamationTriangle className="text-danger" size={24} />
                  </div>
                  <h5 className="modal-title fw-bold text-dark">Confirm Vehicle Removal</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseDeleteModal}
                ></button>
              </div>
              
              <div className="modal-body pt-2">
                <p className="text-muted mb-3">
                  Are you sure you want to remove this vehicle from your account?
                </p>
                
                <div className="bg-light rounded p-3 mb-3">
                  <div className="d-flex align-items-center">
                    <FaCar className="text-primary me-3" size={24} />
                    <div>
                      <h6 className="mb-1 fw-bold">{selectedVehicle.license_plate}</h6>
                      <p className="mb-0 text-muted small">
                        {selectedVehicle.vehicle_brand} {selectedVehicle.model} ({selectedVehicle.make_year})
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="alert alert-warning border-0 bg-warning bg-opacity-10">
                  <small className="text-danger">
                    <strong>Warning:</strong> This action cannot be undone. All data associated with this vehicle will be permanently removed.
                  </small>
                </div>
              </div>
              
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseDeleteModal}
                >
                  <IoMdClose className="me-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setVehicles((prevVehicles) =>
                      prevVehicles.filter(
                        (vehicle) =>
                          vehicle.license_plate !== selectedVehicle.license_plate
                      )
                    );
                    deleteVehicle(selectedVehicle.license_plate);
                  }}
                >
                  <MdDelete className="me-2" />
                  Remove Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .vehicle-card-hover {
          transition: all 0.3s ease;
        }
        
        .vehicle-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        
        .vehicle-add-card {
          transition: all 0.3s ease;
          border-color: #dee2e6;
        }
        
        .vehicle-add-card:hover {
          border-color: #0d6efd;
          background-color: #f8f9ff;
          transform: translateY(-2px);
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .bg-opacity-10 {
          background-color: rgba(13, 110, 253, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default MyVehicle;