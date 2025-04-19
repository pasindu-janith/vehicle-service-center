import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VehicleRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
    repassword: "",
    fname: "",
    lname: "",
  });

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="container pt-3 vh-100">
      <div>
        <h2 className="mb-4">Vehicle Information Form</h2>
        <form>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="licensePlate" className="form-label">
                Vehicle Registration Number
              </label>
              <input
                type="text"
                className="form-control"
                id="licensePlate"
                placeholder="Enter License Plate"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="make" className="form-label">
                Make (Brand)
              </label>
              <select className="form-select" id="make" name="make">
                <option value="">Select a brand</option>
                <option value="toyota">Toyota</option>
                <option value="honda">Honda</option>
                <option value="ford">Ford</option>
                <option value="nissan">Nissan</option>
                {/* Add more options as needed */}
              </select>
            </div>

            <div className="col-md-6">
              <label htmlFor="model" className="form-label">
                Model
              </label>
              <input
                type="text"
                className="form-control"
                id="model"
                placeholder="e.g., Corolla, Civic"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="year" className="form-label">
                Year of Manufacture
              </label>
              <input
                type="number"
                className="form-control"
                id="year"
                placeholder="e.g., 2022"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="vin" className="form-label">
                Chassis (VIN) Number
              </label>
              <input
                type="text"
                className="form-control"
                id="vin"
                placeholder="Enter VIN"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="engineNumber" className="form-label">
                Engine Number
              </label>
              <input
                type="text"
                className="form-control"
                id="engineNumber"
                placeholder="Enter Engine Number"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="transmission" className="form-label">
                Transmission Type
              </label>
              <select className="form-select" id="transmission" required>
                <option value>Select Transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="fuelType" className="form-label">
                Fuel Type
              </label>
              <select className="form-select" id="fuelType" required>
                <option value>Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button type="reset" className="btn btn-secondary">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRegister;
