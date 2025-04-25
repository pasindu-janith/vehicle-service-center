import React from "react";

const NewReservation = () => {
  return (
    <div className="container pt-3 d-flex justify-content-center vh-100">
      <div className="card p-4 rounded shadow-sm col-md-6">
        <form className="">
          <h4 className="mb-4">New Service Reservation</h4>
          {/* Vehicle Selection */}
          <div className="mb-3">
            <label htmlFor="vehicle" className="form-label">
              Select Your Vehicle
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
              <option value="car-1">Toyota - ABC-1234</option>
              <option value="car-2">Honda - XYZ-5678</option>
            </select>
          </div>
          {/* Service Type */}
          <div className="mb-3">
            <label htmlFor="serviceType" className="form-label">
              Service Type
            </label>
            <select
              className="form-select"
              id="serviceType"
              name="serviceType"
              required
            >
              <option selected disabled value>
                Choose a service
              </option>
              <option value="oil-change">Oil Change</option>
              <option value="full-service">Full Service</option>
              <option value="engine-check">Engine Check</option>
              <option value="tire-change">Tire Change</option>
            </select>
          </div>
          {/* Date Picker */}
          <div className="mb-3">
            <label htmlFor="serviceDate" className="form-label">
              Preferred Date
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
              Preferred Time
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
