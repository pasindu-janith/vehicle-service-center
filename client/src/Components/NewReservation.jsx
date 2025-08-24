import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toastr from "toastr";
import BASE_URL from "../config";

const NewReservation = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceDuration, setServiceDuration] = useState(0);
  const [formData, setFormData] = useState({
    vehicle: "",
    serviceType: "",
    serviceDate: null,
    serviceTime: null,
    serviceEndTime: "",
    notes: "",
  });

  const navigate = useNavigate();
  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/loadServiceTypes`,
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setServiceTypes(data);
        }
      } catch (error) {
        console.error("Error loading service types:", error);
      }
    };

    const loadAllUserVehicles = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/loadAllUserVehicles`,
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
        }
      } catch (error) {
        console.log(error);
      }
    };
    loadAllUserVehicles();
    loadServiceTypes();
  }, []);

  const calculateEndTime = (value) => {
    const startTime = new Date(`1970-01-01T${value}`);
    const endTime = new Date(startTime.getTime() + serviceDuration * 60000);

    // Format to HH:mm:ss
    const formattedEndTime = endTime.toTimeString().slice(0, 5);

    setFormData((prev) => ({
      ...prev,
      serviceEndTime: formattedEndTime,
    }));
  };

  const handleSelectChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
    const data = {
      vehicleID: formData.vehicle,
      serviceType: formData.serviceType,
      serviceDate: formData.serviceDate,
      serviceEndTime: formData.serviceEndTime,
      serviceStartTime: formData.serviceTime,
      note: formData.notes,
    };

    try {
      const response = await fetch(
        `${BASE_URL}/createReservation`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (response.ok) {
        toastr.success("Reservation created successfully!");
        setIsSubmitting(false);
        navigate("/myaccount/reservations");
      } else {
        const errorData = await response.json();
        toastr.error(errorData.message || "Failed to create reservation.");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="container pt-3 d-flex justify-content-center">
      <div className="card p-4 rounded shadow-sm col-md-6 col-12">
        <form onSubmit={handleSubmit}>
          <h3 className="mb-4 text-darkblue fw-bold">New Service Reservation</h3>
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
              onChange={handleSelectChange}
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
                  setServiceDuration(selectedService.duration);
                }
                handleSelectChange(e);
              }}
            >
              <option selected disabled value>
                Choose a service
              </option>
              {serviceTypes.map((service) => (
                <option
                  key={service.service_type_id}
                  value={service.service_type_id}
                >
                  {service.service_name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-muted small">{serviceDescription}</p>

          <div className="mb-3">
            <label htmlFor="serviceDate" className="form-label">
              Preferred Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              id="serviceDate"
              name="serviceDate"
              value={formData.serviceDate || ""}
              min={new Date().toISOString().split("T")[0]} // Disable previous days
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  serviceDate: value,
                }));
              }}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="serviceTime" className="form-label">
              Preferred Time <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="serviceTime"
              name="serviceTime"
              required
              onChange={(e) => {
                const value = e.target.value;
                if (value !== "") {
                  setFormData((prev) => ({
                    ...prev,
                    serviceTime: value,
                  }));
                  calculateEndTime(value); // pass the new value directly
                }
              }}
            >
              <option selected disabled value>
                Choose a time
              </option>
              {Array.from({ length: (18 - 8) * 4 }, (_, index) => {
                const hours = 8 + Math.floor(index / 4);
                const minutes = (index % 4) * 15;
                const time = `${hours.toString().padStart(2, "0")}:${minutes
                  .toString()
                  .padStart(2, "0")}:00`;
                return (
                  <option key={time} value={time}>
                    {time.slice(0, 5)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Service Description */}
          <div className="mb-3">
            <label htmlFor="serviceDescription" className="form-label">
              Service End Time (Approximated)
            </label>
            <input
              type="text"
              className="form-control"
              id="serviceEndTime"
              name="serviceEndTime"
              disabled
              value={formData.serviceEndTime}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  serviceEndTime: e.target.value,
                }));
              }}
            />
             <p className="text-muted small">Service end time can be varied based on the workshop workload.</p>
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
              value={formData.notes}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }));
              }}
            />
          </div>
          {/* Submit Button */}
          <div className="d-grid">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              Reserve Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReservation;
