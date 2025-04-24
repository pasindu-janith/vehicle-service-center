import { useState, useEffect } from "react";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

const VehicleRegister = () => {
  const [preview, setPreview] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleBrands, setVehicleBrands] = useState([]);
  const [formData, setFormData] = useState({
    licensePlate: "",
    vehicleType: "",
    make: "",
    model: "",
    color: "",
    year: "",
    transmission: "",
    fuelType: "",
    vehicleImage: null,
  });

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/loadVehicleTypes",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setVehicleTypes(data);
        } else {
          const error = await response.json();
          console.error("Server error:", error);
        }
      } catch (err) {
        console.error("Network error:", err);
        alert("Something went wrong!");
      }
    };

    const loadBrands = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/loadVehicleBrands",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setVehicleBrands(data);
        } else {
          const error = await response.json();
          console.error("Server error:", error);
        }
      } catch (err) {
        console.error("Network error:", err);
        alert("Something went wrong!");
      }
    };

    loadTypes();
    loadBrands();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);

      setFormData((prev) => ({
        ...prev,
        vehicleImage: file,
      }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data for sending (e.g., to backend)
    const submissionData = new FormData();
    Object.keys(formData).forEach((key) => {
      submissionData.append(key, formData[key]);
    });

    // Just for demo: show values in console
    console.log("Form submitted:");
    try {
      const response = await fetch(
        "http://localhost:4000/api/v1/user/register-vehicle",
        {
          method: "POST",
          body: submissionData, //FormData includes the image file
        }
      );

      if (response.ok) {
        const result = await response.json();
        toastr.success("Vehicle registered successfully!");
      } else {
        const error = await response.json();
        console.error("Server error:", error);
        toastr.error("Failed to submit. Please try again.");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="container pt-3">
      <div>
        <h2 className="mb-4">Vehicle Information Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="licensePlate" className="form-label">
                Vehicle Registration Number
              </label>
              <input
                type="text"
                className="form-control"
                id="licensePlate"
                name="licensePlate"
                placeholder="Enter License Plate"
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="vehicleType" className="form-label">
                Vehicle Type
              </label>
              <select
                className="form-select"
                id="vehicleType"
                onChange={handleSelectChange}
              >
                {vehicleTypes.map((type) => (
                  <option
                    key={type.vehicle_type_id}
                    value={type.vehicle_type_id}
                  >
                    {type.vehicle_type}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="make" className="form-label">
                Make (Brand)
              </label>
              <select
                className="form-select"
                id="make"
                onChange={handleSelectChange}
              >
                {vehicleBrands.map((brand) => (
                  <option
                    key={brand.vehicle_brand_id}
                    value={brand.vehicle_brand_id}
                  >
                    {brand.vehicle_brand}
                  </option>
                ))}
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
                name="model"
                onChange={handleChange}
                placeholder="e.g., Corolla, Civic"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="color" className="form-label">
                Color
              </label>
              <input
                type="text"
                className="form-control"
                id="color"
                name="color"
                onChange={handleChange}
                placeholder="eg., Red, Blue"
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
                name="year"
                onChange={handleChange}
                placeholder="e.g., 2022"
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="transmission" className="form-label">
                Transmission Type
              </label>
              <select
                className="form-select"
                id="transmission"
                onChange={handleSelectChange}
                required
              >
                <option value>Select Transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="fuelType" className="form-label">
                Fuel Type
              </label>
              <select
                className="form-select"
                id="fuelType"
                onChange={handleSelectChange}
                required
              >
                <option value>Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="vehicleImage" className="form-label">
                Upload Vehicle Image
              </label>
              <input
                type="file"
                className="form-control"
                id="vehicleImage"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {preview && (
                <div className="mt-3">
                  <p className="form-text">Preview:</p>
                  <img
                    className="img-thumbnail"
                    style={{ maxWidth: "200px", height: "auto" }}
                    src={preview}
                    alt="Vehicle Preview"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="btn btn-primary me-2">
              Submit
            </button>
            <button
              type="reset"
              onClick={() => setPreview(null)}
              className="btn btn-secondary"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRegister;
