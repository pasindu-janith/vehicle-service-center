import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { BASE_URL } from "../config.js";

const ServicesCompleted = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const dtInstance = useRef(null); // To store the DataTable instance
  const [serviceRecordsModal, setServiceRecordsModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadCompletedServices`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const jsonData = await response.json();
          setTableData(jsonData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Only initialize or reinitialize DataTables if data is loaded
    if (!loading && tableData.length > 0) {
      const $table = $(tableRef.current);

      // Destroy existing instance before reinitializing
      if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().destroy();
      }

      dtInstance.current = $table.DataTable({
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: true,
        responsive: true,
      });
    }
  }, [tableData, loading]); // Re-run only when data is updated

  const proceedPayment = async () => {
    if (!selectedReservation) return;
    
    try {
      const response = await fetch(`${BASE_URL}/proceedCashPayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationId: selectedReservation.reservation_id,
          vehicleID: selectedReservation.license_plate,
          service_cost: selectedReservation.service_cost,
          discount: selectedReservation.discount,
          final_amount: selectedReservation.final_amount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTableData((prevData) =>
            prevData.map((item) =>
              item.reservation_id === selectedReservation.reservation_id
                ? { ...item, is_paid: true }
                : item
            )
          );
          setSelectedReservation(null);
          toastr.success("Payment marked as completed.");
        } else {
          toastr.error(data.message || "Failed to mark payment as completed.");
        }
      } else {
        toastr.error("Failed to mark payment as completed.");
      }
    } catch (error) {
      console.error("Error marking payment as completed:", error);
      toastr.error("An error occurred while processing the payment.");
    }
  }

  return (
    <section className="content pt-2">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-success">
                <h3 className="card-title">Completed Services</h3>
              </div>
              <div className="card-body">
                <table
                  ref={tableRef}
                  id="example2"
                  className="table table-bordered table-hover"
                >
                  <thead>
                    <tr>
                      <th>Res. ID</th>
                      <th>Vehicle No</th>
                      <th>Service Name</th>
                      <th>started</th>
                      <th>Ended</th>
                      <th>Payment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length > 0 ? (
                      tableData.map((row) => (
                        <tr key={row.reservation_id}>
                          <td>{row.reservation_id}</td>
                          <td>{row.license_plate}</td>
                          <td>{row.service_name}</td>
                          <td>
                            {new Date(row.reserve_date).toLocaleDateString(
                              "en-CA"
                            )}{" "}
                            {row.start_time?.substring(0, 5)}
                          </td>
                          <td>
                            {new Date(row.end_date).toLocaleDateString("en-CA")}{" "}
                            {row.end_time?.substring(0, 5)}
                          </td>
                          <td>
                            Rs.{row.final_amount}{" "}
                            {row.is_paid ? (
                              <span className="badge bg-success">OK</span>
                            ) : (
                              <span className="badge bg-danger">X</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setSelectedReservation(row);
                                setServiceRecordsModal(true);
                              }}
                            >
                              Show
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No completed services found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for Service Record Details */}
      {selectedReservation && serviceRecordsModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-lg modal-dialog-scrollable"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Service Record Details</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setServiceRecordsModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Reservation ID:</strong>
                      </td>
                      <td>{selectedReservation.reservation_id}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Vehicle:</strong>
                      </td>
                      <td>{selectedReservation.license_plate}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Service Name:</strong>
                      </td>
                      <td>{selectedReservation.service_name}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>From:</strong>
                      </td>
                      <td>
                        {new Date(
                          selectedReservation.reserve_date
                        ).toLocaleDateString("en-CA")}{" "}
                        {selectedReservation.start_time?.substring(0, 5)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>To:</strong>
                      </td>
                      <td>
                        {new Date(
                          selectedReservation.end_date
                        ).toLocaleDateString("en-CA")}{" "}
                        {selectedReservation.end_time?.substring(0, 5)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Description:</strong>
                      </td>
                      <td>{selectedReservation.service_description}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Payment:</strong>
                      </td>
                      <td>
                        {selectedReservation.is_paid ? (
                          <span>Paid</span>
                        ) : (
                          <span>Pending</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {selectedReservation.payment_items?.length > 0 && (
                  <table className="table table-bordered mt-3">
                    <thead>
                      <tr>
                        <th>Service Name</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReservation.payment_items.map((service) => (
                        <tr key={service.id}>
                          <td>{service.description}</td>
                          <td>{service.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <table
                  style={{
                    width: "100%",
                    fontSize: "1.25rem",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "left", padding: "4px 8px" }}>
                        <strong>Service Cost:</strong>
                      </td>
                      <td style={{ textAlign: "right", padding: "4px 8px" }}>
                        Rs. {selectedReservation.service_cost}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "left", padding: "4px 8px" }}>
                        <strong>Discount:</strong>
                      </td>
                      <td style={{ textAlign: "right", padding: "4px 8px" }}>
                        Rs. {selectedReservation.discount}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: "left", padding: "4px 8px" }}>
                        <strong>Net Amount:</strong>
                      </td>
                      <td style={{ textAlign: "right", padding: "4px 8px" }}>
                        Rs. {selectedReservation.final_amount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                {!selectedReservation.is_paid && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => setPaymentModal(true)}
                  >
                    Make Payment
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setServiceRecordsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedReservation && paymentModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-lg modal-dialog-scrollable"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Cash Payment for Reservation ID:{" "}
                  {selectedReservation.reservation_id}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setPaymentModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Please collect the payment of Rs.{" "}
                  {selectedReservation.final_amount} from the customer.
                </p>
                <p>
                  After collecting the payment, please mark this service as
                  paid.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    proceedPayment();
                    setPaymentModal(false);
                  }}
                >
                  Paid
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPaymentModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesCompleted;
