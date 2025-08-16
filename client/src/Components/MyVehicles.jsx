import React, { useState } from "react";
import { Link } from "react-router-dom";
import images from "../Assets/assets";
import { MdDelete } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useEffect } from "react";
import "./styles/Dashboard.css";
import { BASE_URL, BASE_IMAGES_URL } from "../config.js";

const MyVehicle = () => {
  // Example vehicle data (later you can fetch from database)

  const [vehicles, setVehicles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

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
      }
    };
    loadAllUserVehicles();
  }, []);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

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
    <div
      className="container pt-3 bg-transparent"
      style={{ minHeight: "100vh" }}
    >
      <h2 className="text-darkblue mb-3 fw-bold" style={{ fontSize: "40px" }}>
        My vehicles
      </h2>

      <div className="row">
        {isLoading ? (
          <div className="col-md-12 pt-4 text-center">
            <div className="spinner-border text-primary mt-4" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {vehicles.map((vehicle) => (
              <div className="col-md-3" key={vehicle.license_plate}>
                <div className="card mb-3 shadow-lg vehicle-card">
                  <img
                    src={`${BASE_IMAGES_URL}${vehicle.imgpath}`}
                    style={{ height: "300px", objectFit: "contain" }}
                    className="card-img-top"
                    alt="..."
                  />
                  <div className="card-body">
                    <h3 className="card-title">{vehicle.license_plate}</h3>
                    <p>
                      {vehicle.vehicle_brand} {vehicle.model}{" "}
                      {vehicle.make_year}
                      {" | "}
                      {vehicle.vehicle_type}
                    </p>
                    <button
                      onClick={() =>
                        (window.location.href = `/myaccount/vehicle-info/${vehicle.license_plate}`)
                      }
                      className="btn btn-primary mt-1 me-1"
                    >
                      <IoMdInformationCircleOutline size={20} /> More info
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(vehicle)}
                      className="btn btn-danger mt-1 me-1"
                    >
                      <MdDelete size={20} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add vehicle card */}
            <div className="col-md-3 pb-3">
              <div className="card h-100" style={{ border: "1px dashed grey" }}>
                {vehicles.length === 0 && (
                  <p className="text-center mt-4 mb-3">No vehicles added yet</p>
                )}
                <div className="card-body d-flex justify-content-center align-items-center">
                  <Link
                    to="/myaccount/add-vehicle"
                    className="text-decoration-none"
                  >
                    <h1 className="text-center">+</h1>
                    <p className="text-center">Add Vehicle</p>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedVehicle && showDeleteModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => handleCloseDeleteModal()}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete the vehicle{" "}
                  <strong>{selectedVehicle.license_plate}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleCloseDeleteModal()}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setVehicles((prevVehicles) =>
                      prevVehicles.filter(
                        (vehicle) =>
                          vehicle.license_plate !==
                          selectedVehicle.license_plate
                      )
                    );
                    deleteVehicle(selectedVehicle.license_plate);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVehicle;
