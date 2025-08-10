import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import "./styles/Dashboard.css";


const VehicleRegister = () => {
  const [preview, setPreview] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleBrands, setVehicleBrands] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [profileUpdated, setProfileUpdated] = useState(true);
  const [transmissionTypes, setTransmissionTypes] = useState([]);
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

  const navigate = useNavigate();

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

    const loadFuelTypes = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/loadFuelTypes",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setFuelTypes(data);
        } else {
          const error = await response.json();
          console.error("Server error:", error);
        }
      } catch (err) {
        console.error("Network error:", err);
      }
    };

    const loadTransmissionTypes = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/loadTransmissionTypes",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setTransmissionTypes(data);
        } else {
          const error = await response.json();
          console.error("Server error:", error);
        }
      } catch (err) {
        console.error("Network error:", err);
      }
    };

    loadFuelTypes();
    loadTypes();
    loadBrands();
    loadTransmissionTypes();
  }, []);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/profileUpdated",
          {
            method: "GET",
            credentials: "include", // Include cookies in the request
          }
        );
        if (response.ok) {
          setProfileUpdated(true);
        } else {
          setProfileUpdated(false);
        }
      } catch (err) {
        console.error("Network error:", err);
      }
    };

    checkProfileStatus();
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
          body: submissionData,
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        toastr.success(result.message || "Vehicle registered successfully!");
        navigate("/myaccount/myvehicle");
      } else {
        const error = await response.json();
        if (error.message) {
          toastr.error(error.message);
        } else {
          toastr.error("Failed to register vehicle. Please try again.");
        }
      }
    } catch (err) {
      toastr.error(err.message || "Network error. Please try again.");
    }
  };

  return (
    <div className="container pt-3">
      <div>
        <h2 className="mb-4 text-darkblue">Vehicle Information Form</h2>

        {!profileUpdated && (
          <div className="alert alert-danger" role="alert">
            Update your profile information first to register a vehicle.
            <Link to="/myaccount/settings">Update profile</Link>
          </div>
        )}

        <div className="card p-4 rounded shadow-sm">
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
                  placeholder="e.g., CP-1234 or GPD-5678"
                  pattern="^[A-Z]{2,3}-\d{4}$"
                  onChange={handleChange}
                  required
                />
                <div className="form-text">
                  Format: 2 or 3 capital letters followed by dash and 4 digits
                  (e.g., CP-1234 or GPD-5678)
                </div>
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
                  <option value="" disabled selected>
                    Select Vehicle Type
                  </option>
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
                  <option value="" disabled selected>
                    Select Vehicle Brand
                  </option>
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
                  <option value="" disabled selected>
                    Select Transmission Type
                  </option>
                  {transmissionTypes.map((transmission) => (
                    <option
                      key={transmission.transmission_type_id}
                      value={transmission.transmission_type_id}
                    >
                      {transmission.transmission_type}
                    </option>
                  ))}
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
                  <option value="" disabled selected>
                    Select Fuel Type
                  </option>
                  {fuelTypes.map((fuel) => (
                    <option key={fuel.fuel_type_id} value={fuel.fuel_type_id}>
                      {fuel.fuel_type}
                    </option>
                  ))}
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
              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={!profileUpdated}
              >
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
    </div>
  );
};

export default VehicleRegister;
