import React, { useState } from "react";
import { Link } from "react-router-dom";
import images from "../Assets/assets";
import { MdDelete } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";

const MyVehicle = () => {
  // Example vehicle data (later you can fetch from database)
  const vehicles = [
    {
      id: 1,
      number: "KW-5467",
      model: "Toyota Yaris 2016",
      category: "Car",
      color: "White",
      image: images.toyota,
      serviceRecords: [
        { date: "2024-04-01", type: "Oil Change", center: "ABC Service Center", cost: "Rs. 7500" },
        { date: "2024-01-10", type: "Brake Service", center: "DEF Auto", cost: "Rs. 12000" },
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
        { date: "2024-03-15", type: "Tire Replacement", center: "XYZ Tyres", cost: "Rs. 20000" },
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
    <div className="container pt-3 vh-100" style={{ backgroundColor: "#f4f4f4" }}>
      <h2 className="mb-3">My Vehicles</h2>

      <div className="row">
        {vehicles.map((vehicle) => (
          <div className="col-md-3" key={vehicle.id}>
            <div className="card mb-3">
              <img src={vehicle.image} className="card-img-top" alt="..." />
              <div className="card-body">
                <h5 className="card-title">{vehicle.number}</h5>
                <table className="table table-borderless table-sm">
                  <tbody>
                    <tr>
                      <td>Model</td>
                      <td>{vehicle.model}</td>
                    </tr>
                    <tr>
                      <td>Category</td>
                      <td>{vehicle.category}</td>
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

                <button onClick={() => handleOpenModal(vehicle)} className="btn btn-primary mt-1 me-1">
                  Service records
                </button>

                <a href="#" className="btn btn-danger mt-1 me-1">
                  <MdDelete size={20} /> Delete vehicle
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Add vehicle card */}
        <div className="col-md-3">
          <div className="card h-100" style={{ border: "1px dashed grey" }}>
            <div className="card-body d-flex justify-content-center align-items-center">
              <Link to="/myaccount/add-vehicle" className="text-decoration-none">
                <h1 className="text-center">+</h1>
                <p className="text-center">Add Vehicle</p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Service Records Modal */}
      {showModal && selectedVehicle && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Service Records - {selectedVehicle.number}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
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
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
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

export default MyVehicle;
