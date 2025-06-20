import React, { useEffect } from "react";
import { FaCreditCard } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";


const MERCHANT_ID = "1230724"; // Replace with your real merchant ID

const PaymentProceed = () => {
  useEffect(() => {
    // Register your callbacks
    window.payhere.onCompleted = function (orderId) {
      console.log("Payment completed. OrderID:", orderId);
    };

    window.payhere.onDismissed = function () {
      console.log("Payment dismissed");
    };

    window.payhere.onError = function (error) {
      console.error("Payment error:", error);
    };
  }, []);

  const form = {
    reservationId: "RES123456",
    userId: "USR7890",
    userName: "Pasindu Janith",
    createdDatetime: "2025-06-19T12:15:00",
    serviceDescription: "Full vehicle diagnostic and oil change service",
    serviceCost: 5000,
    discount: 500,
    finalAmount: 4500,
  };

  const handlePayment = async () => {
    if (!window.payhere) {
      alert("PayHere SDK not loaded.");
      return;
    }
    const amount = parseFloat(form.finalAmount).toFixed(2);
    const response = await fetch("http://localhost:4000/api/v1/user/pay-hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        order_id: form.reservationId,
        amount: amount,
        currency: "LKR",
      }),
    });

    const { hash } = await response.json();

    const payment = {
      sandbox: true,
      merchant_id: MERCHANT_ID,
      return_url: "http://localhost:5173/myaccount/dashboard",
      cancel_url: "http://localhost:5173/myaccount/dashboard",
      notify_url: "https://your-backend.com/api/payhere-notify",
      order_id: form.reservationId,
      items: form.serviceDescription,
      amount,
      currency: "LKR",
      hash, // Hashcode generated from backend
      first_name: "Pasindu",
      last_name: "Janith",
      email: "pasindu@example.com",
      phone: "0771234567",
      address: "No. 1, Galle Road",
      city: "Colombo",
      country: "Sri Lanka",
    };

    window.payhere.startPayment(payment);
  };

  const formattedDate = new Date(form.createdDatetime).toLocaleString();

  return (
    <div
      className="container mt-5"
      style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: "16px" }}
    >
      <div className="card shadow-lg p-4 border-0">
        <h3 className="text-center mb-4 fw-bold" style={{ fontSize: "28px" }}>
          Payment Receipt
        </h3>

        <table className="table table-bordered table-striped align-middle">
          <tbody>
            <tr>
              <th style={{ width: "30%" }}>Reservation ID</th>
              <td>{form.reservationId}</td>
            </tr>
            <tr>
              <th>User ID</th>
              <td>{form.userId}</td>
            </tr>
            <tr>
              <th>User Name</th>
              <td>{form.userName}</td>
            </tr>
            <tr>
              <th>Date & Time</th>
              <td>{formattedDate}</td>
            </tr>
            <tr>
              <th>Service Description</th>
              <td>{form.serviceDescription}</td>
            </tr>
            <tr>
              <th>Service Cost</th>
              <td>Rs. {form.serviceCost.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Discount</th>
              <td>Rs. {form.discount.toFixed(2)}</td>
            </tr>
            <tr>
              <th className="fs-5 text-success">Final Amount</th>
              <td className="fs-3 fw-bold text-success">
                Rs. {form.finalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-end mt-4">
          <button
            className="btn btn-primary col-md-2 col-12 py-2"
            onClick={handlePayment}
          >
            <FaCreditCard className="me-2" />
            Proceed Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProceed;
