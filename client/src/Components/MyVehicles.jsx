import React from "react";
import { Link } from "react-router-dom";
import images from "../Assets/assets";
import { MdDelete } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";

const MyVehicle = () => {
  return (
    <div
      className="container pt-3 vh-100"
      style={{ backgroundColor: "#f4f4f4" }}
    >
      <h2 className="mb-3">My Vehicles</h2>
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <img src={images.toyota} className="card-img-top" alt="..." />
            <div className="card-body">
              <h5 className="card-title">KW-5467</h5>
              <table className="table table-borderless table-sm">
                <tr>
                  <td>Model</td>
                  <td>Toyota Yaris 2016</td>
                </tr>
                <tr>
                  <td>Category</td>
                  <td>Car</td>
                </tr>
                <tr>
                  <td>Color</td>
                  <td>White</td>
                </tr>
              </table>
              <a href="#" className="btn btn-primary mt-1 me-1">
                <IoMdInformationCircleOutline size={20}/> More info
              </a>
              <a href="#" className="btn btn-primary mt-1 me-1">
                Service records
              </a>
              <a href="#" className="btn btn-danger mt-1 me-1">
                <MdDelete size={20} />
                Delete vehicle
              </a>
            </div>
          </div>
        </div>

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
    </div>
  );
};

export default MyVehicle;
