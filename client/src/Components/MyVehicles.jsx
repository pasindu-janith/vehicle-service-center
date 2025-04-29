import React, { useState } from "react";
import { Link } from "react-router-dom";
import images from "../Assets/assets";
import { MdDelete } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useEffect } from "react";

const MyVehicle = () => {
  // Example vehicle data (later you can fetch from database)

  const [vehicles, setVehicles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllUserVehicles = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/loadAllUserVehicles",
          {
            method: "GET",
            credentials: "include",
          }
        );
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

  const vehicles1 = [
    {
      id: 1,
      number: "KW-5467",
      model: "Toyota Yaris 2016",
      category: "Car",
      color: "White",
      image: images.toyota,
      serviceRecords: [
        {
          date: "2024-04-01",
          type: "Oil Change",
          center: "ABC Service Center",
          cost: "Rs. 7500",
        },
        {
          date: "2024-01-10",
          type: "Brake Service",
          center: "DEF Auto",
          cost: "Rs. 12000",
        },
      ],
    },
    {
      id: 2,
      number: "CP-1234",
      model: "Nissan March 2015",
      category: "Car",
      color: "Black",
      image: images.toyota, // You can change image
      serviceRecords: [
        {
          date: "2024-03-15",
          type: "Tire Replacement",
          center: "XYZ Tyres",
          cost: "Rs. 20000",
        },
      ],
    },
    // Add more vehicles if needed
  ];

  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleOpenModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVehicle(null);
  };

  return (
    <div
      className="container pt-3"
      style={{ backgroundColor: "#f4f4f4", minHeight: '100vh' }}
    >
      <h2 className="mb-3">My Vehicles</h2>

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
                <div className="card mb-3">
                  <img
                    src={`http://localhost:4000${vehicle.imgpath}`}
                    style={{ height: "300px", objectFit: "cover" }}
                    className="card-img-top"
                    alt="..."
                  />
                  <div className="card-body">
                    <h5 className="card-title">{vehicle.license_plate}</h5>
                    <table className="table table-borderless table-sm">
                      <tbody>
                        <tr>
                          <td>Model</td>
                          <td>
                            {vehicle.vehicle_brand} {vehicle.model}
                          </td>
                        </tr>
                        <tr>
                          <td>Category</td>
                          <td>{vehicle.vehicle_type}</td>
                        </tr>
                        <tr>
                          <td>Color</td>
                          <td>{vehicle.color}</td>
                        </tr>
                      </tbody>
                    </table>

                    <a href="#" className="btn btn-primary mt-1 me-1">
                      <IoMdInformationCircleOutline size={20} /> More info
                    </a>

                    <button
                      onClick={() => handleOpenModal(vehicle)}
                      className="btn btn-primary mt-1 me-1"
                    >
                      Service records
                    </button>

                    <button
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="btn btn-danger mt-1 me-1"
                    >
                      <MdDelete size={20} /> Delete vehicle
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add vehicle card */}
            <div className="col-md-3">
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

      {/* Service Records Modal */}
      {showModal && selectedVehicle && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Service Records - {selectedVehicle.number}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>

              <div className="modal-body">
                {selectedVehicle.serviceRecords.length > 0 ? (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Service Type</th>
                        <th>Service Center</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVehicle.serviceRecords.map((record, index) => (
                        <tr key={index}>
                          <td>{record.date}</td>
                          <td>{record.type}</td>
                          <td>{record.center}</td>
                          <td>{record.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No service records available for this vehicle.</p>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selectedVehicle && (
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
                  onClick={() => setSelectedVehicle(null)}
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
                  onClick={() => setSelectedVehicle(null)}
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
                    setSelectedVehicle(null);
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
