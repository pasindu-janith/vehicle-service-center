import React, { useState } from "react";
import DateTimePicker from "react-datetime-picker";

const EndReservationModal = ({
  isOpen,
  selectedReservation,
  endDateTime,
  setEndDateTime,
  startDateTime,
  onClose,
  onEndReservation
}) => {
  const [extraItems, setExtraItems] = useState([]);
  const [extraItem, setExtraItem] = useState({ description: "", price: "" });
  const [serviceCost, setServiceCost] = useState("");
  const [serviceDiscount, setServiceDiscount] = useState("0.00");
  const [finalAmount, setFinalAmount] = useState("");

  const handleAddExtraItem = () => {
    const price = parseFloat(extraItem.price);
    if (
      extraItem.description.trim() !== "" &&
      !isNaN(price) &&
      price >= 0
    ) {
      const updatedItems = [...extraItems, extraItem];
      setExtraItems(updatedItems);
      setExtraItem({ description: "", price: "" });

      // Recalculate service cost
      const itemTotal = updatedItems.reduce(
        (sum, item) => sum + parseFloat(item.price || 0),
        0
      );
      const discount = parseFloat(serviceDiscount) || 0;
      setServiceCost(itemTotal.toFixed(2));
      setFinalAmount((itemTotal - discount).toFixed(2));
    }
  };

  const handleServiceCostChange = (value) => {
    const val = value.replace(/[^0-9.]/g, "");
    setServiceCost(val);
    const cost = parseFloat(val) || 0;
    const discount = parseFloat(serviceDiscount) || 0;
    setFinalAmount((cost - discount).toFixed(2));
  };

  const handleServiceDiscountChange = (value) => {
    const val = value.replace(/[^0-9.]/g, "");
    setServiceDiscount(val);
    const cost = parseFloat(serviceCost) || 0;
    const discount = parseFloat(val) || 0;
    setFinalAmount((cost - discount).toFixed(2));
  };

  const handleEndReservation = () => {
    const formData = {
      reservationId: selectedReservation.reservation_id,
      vehicleNumber: selectedReservation.vehicle_id,
      completedDateTime: endDateTime.toLocaleString(),
      serviceCost: parseFloat(serviceCost) || 0,
      serviceDiscount: parseFloat(serviceDiscount) || 0,
      finalAmount: parseFloat(finalAmount) || 0,
      notes: document.getElementById("serviceDetails")?.value || "",
      extraItems: extraItems,
    };
    
    onEndReservation(formData);
  };

  if (!isOpen || !selectedReservation) return null;

  return (
    <div
      className="modal fade show"
      id="endReservationModal"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="endReservationModalLabel"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="endReservationModalLabel">
              End Reservation
            </h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          
          <div className="modal-body d-flex align-items-center">
            <div className="col-md-12 col-12">
              <div className="form-group">
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="">Reservation ID</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      id="reservationIdEnd"
                      value={selectedReservation.reservation_id}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="">Vehicle Number</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      id="vehicleNumberEnd"
                      value={selectedReservation.vehicle_id}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="">Service Type</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      value={selectedReservation.service_name}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="">End time</label>
                    <DateTimePicker
                      onChange={(date) => setEndDateTime(date)}
                      value={endDateTime}
                      minDate={startDateTime}
                      className="datetimepick col-12 mb-3"
                    />
                  </div>
                  <div className="col-md-12">
                    <label htmlFor="">Service Details</label>
                    <textarea
                      className="form-control mb-3"
                      rows="3"
                      id="serviceDetails"
                      placeholder="Enter any notes or comments here..."
                    ></textarea>
                  </div>

                  <div className="col-md-12">
                    <label>Add Extra Services</label>
                    <div className="row mb-2">
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Description"
                          value={extraItem.description}
                          onChange={(e) =>
                            setExtraItem({
                              ...extraItem,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Price"
                          inputMode="decimal"
                          value={extraItem.price}
                          onChange={(e) =>
                            setExtraItem({
                              ...extraItem,
                              price: e.target.value.replace(/[^0-9.]/g, ""),
                            })
                          }
                        />
                      </div>
                      <div className="col-md-2">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={handleAddExtraItem}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Display Added Items */}
                    {extraItems.length > 0 && (
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Description</th>
                            <th>Price (Rs.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extraItems.map((item, index) => (
                            <tr key={index}>
                              <td>{item.description}</td>
                              <td>{parseFloat(item.price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="">Service Cost</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Enter service cost"
                      value={serviceCost}
                      onChange={(e) => handleServiceCostChange(e.target.value)}
                      inputMode="decimal"
                      pattern="^\d+(\.\d{0,2})?$"
                    />
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="">Service Discount</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Enter service discount"
                      value={serviceDiscount}
                      onChange={(e) => handleServiceDiscountChange(e.target.value)}
                      inputMode="decimal"
                      pattern="^\d+(\.\d{0,2})?$"
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="">Final Amount</label>
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Final amount"
                      value={finalAmount}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-success"
              onClick={handleEndReservation}
            >
              End now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndReservationModal;