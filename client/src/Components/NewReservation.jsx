import React, { useEffect, useState } from "react";

const NewReservation = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceDescription, setServiceDescription] = useState("");

  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/loadServiceTypes",
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setServiceTypes(data);
          console.log("Service Types Loaded:", data);
        }
      } catch (error) {
        console.error("Error loading service types:", error);
      }
    };

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

    loadServiceTypes();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    console.log("Form Data Submitted:", data);
  };

  return (
    <div className="container pt-3 d-flex justify-content-center vh-100">
      <div className="card p-4 rounded shadow-sm col-md-6">
        <form onSubmit={handleSubmit}>
          <h4 className="mb-4">New Service Reservation</h4>
          {/* Vehicle Selection */}
          <div className="mb-3">
            <label htmlFor="vehicle" className="form-label">
              Select Your Vehicle <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="vehicle"
              name="vehicle"
              required
            >
              <option selected disabled value>
                Choose...
              </option>
              {vehicles.map((vehicle) => (
                <option
                  key={vehicle.license_plate}
                  value={vehicle.license_plate}
                >
                  {vehicle.license_plate} {vehicle.vehicle_brand}{" "}
                  {vehicle.model}
                </option>
              ))}
            </select>
          </div>
          {/* Service Type */}
          <div className="mb-3">
            <label htmlFor="serviceType" className="form-label">
              Service Type <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="serviceType"
              name="serviceType"
              required
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedService = serviceTypes.find(
                  (service) => service.service_type_id.toString() === selectedId
                );
                if (selectedService) {
                  setServiceDescription(selectedService.description);
                }
              }}
            >
              <option selected disabled value>
                Choose a service
              </option>
              {serviceTypes.map((service) => (
                <option
                  key={service.service_type_id}
                  value={service.service_type_id}
                  onChange={() => setServiceDescription(service.description)}
                >
                  {service.service_name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-muted small">{serviceDescription}</p>

          {/* Date Picker */}
          <div className="mb-3">
            <label htmlFor="serviceDate" className="form-label">
              Preferred Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              id="serviceDate"
              name="serviceDate"
              required
            />
          </div>
          {/* Time Picker */}
          <div className="mb-3">
            <label htmlFor="serviceTime" className="form-label">
              Preferred Time <span className="text-danger">*</span>
            </label>
            <input
              type="time"
              className="form-control"
              id="serviceTime"
              name="serviceTime"
              required
            />
          </div>
          {/* Notes */}
          <div className="mb-3">
            <label htmlFor="notes" className="form-label">
              Additional Notes
            </label>
            <textarea
              className="form-control"
              id="notes"
              name="notes"
              rows={3}
              placeholder="E.g. Request for pickup, explain specific issues..."
              defaultValue={""}
            />
          </div>
          {/* Submit Button */}
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Reserve Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReservation;
