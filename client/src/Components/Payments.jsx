import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Dashboard.css";

export const Payments = () => {
  const [paymentData, setPaymentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    const loadSerivceRecords = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/loadServiceRecordPayment",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Service records fetched successfully:", data);
          setPaymentData(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching service records:", error);
      }
    };
    loadSerivceRecords();
  }, []);

  return (
    <div
      className="container pt-3 bg-transparent"
      style={{ minHeight: "100vh" }}
    >
      <h2 className="text-darkblue mb-3 fw-bold">Payments to do</h2>
      <div className="card mb-4">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th scope="col">Res ID</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Service</th>
                  <th scope="col">Start Date</th>
                  <th scope="col">End Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <div
                        className="spinner-border text-primary mt-4"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : paymentData.length > 0 ? (
                  paymentData.map((record) => (
                    <tr key={record.reservation_id}>
                      <td>{record.reservation_id}</td>
                      <td>{record.vehicle_id}</td>
                      <td>{record.service_name}</td>
                      <td>
                        {new Date(record.reserve_date).toLocaleDateString()}
                      </td>
                      <td>{new Date(record.end_date).toLocaleDateString()}</td>
                      <td>Rs. {record.final_amount}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            navigate(
                              `/myaccount/proceed-payment?resid=${record.reservation_id}`
                            )
                          }
                        >
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No payments to do.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h2 className="text-darkblue mb-3 fw-bold">Payments done</h2>
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th scope="col">Res ID</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Service</th>
                  <th scope="col">Payment Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Payment Method</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <div
                        className="spinner-border text-primary mt-4"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : paymentData.length > 0 ? (
                  paymentData.map((record) => (
                    <tr key={record.reservation_id}>
                      <td>{record.reservation_id}</td>
                      <td>{record.vehicle_id}</td>
                      <td>{record.service_name}</td>
                      <td>
                        {new Date(record.reserve_date).toLocaleDateString()}
                      </td>
                      <td>{new Date(record.end_date).toLocaleDateString()}</td>
                      <td>Rs. {record.final_amount}</td>
                    </tr>
                  ))
                ) : ( */}
                  <tr>
                    <td colSpan="7" className="text-center">
                      No payments done.
                    </td>
                  </tr>
                {/* )} */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
