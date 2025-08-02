import React, { useEffect, useState } from "react";
import { FaCreditCard } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSearchParams } from "react-router-dom";

const MERCHANT_ID = "1230724"; // Replace with your real merchant ID

const PaymentProceed = () => {
  const [searchParams] = useSearchParams();
  const resid = searchParams.get("resid");
  const [userData, setUserData] = useState(null);
  const [reservationData, setReservationData] = useState(null);
  const [paymentItems, setPaymentItems] = useState(null);

  useEffect(() => {
    // Register your callbacks
    window.payhere.onCompleted = function (orderId) {
      console.log("Payment completed. OrderID:", orderId);
      window.location.href =
        "http://localhost:5173/myaccount/payment-success?resid=" + orderId;
    };

    window.payhere.onDismissed = function () {
      console.log("Payment dismissed");
    };

    window.payhere.onError = function (error) {
      console.error("Payment error:", error);
    };
  }, []);

  useEffect(() => {
    const loadPaymentPage = async () => {
      if (!window.payhere) {
        alert("PayHere SDK not loaded.");
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/user/loadPaymentPageData?resid=${resid}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setUserData(data.userData); // Assuming the response contains user data
        setReservationData(data.reservationData); // Assuming the response contains reservation data
        setPaymentItems(data.paymentItems); // Assuming the response contains payment items
        // Assuming you want to set the fetched data to the form
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    };
    loadPaymentPage();
  }, []);

  //Once click on proceed payment button, this function will be called
  const handlePayment = async () => {
    if (!window.payhere) {
      alert("PayHere SDK not loaded.");
      return;
    }
    const amount = parseFloat(reservationData.final_amount).toFixed(2);
    const response = await fetch("http://localhost:4000/api/v1/user/pay-hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        order_id: reservationData.reservation_id,
        amount: amount,
        currency: "LKR",
      }),
    });

    const { hash } = await response.json();

    const payment = {
      sandbox: true,
      merchant_id: MERCHANT_ID,
      return_url: "http://localhost:5173/myaccount/payment-success",
      cancel_url: "http://localhost:5173/myaccount/payment-failed",
      notify_url: "https://your-backend.com/api/payhere-notify",
      order_id: reservationData.reservation_id,
      items: reservationData.service_name,
      amount,
      currency: "LKR",
      hash, // Hashcode generated from backend
      first_name: userData?.first_name || "No name",
      last_name: userData?.last_name || "No name",
      email: userData?.email || "",
      phone: userData?.mobile_no || "",
      address: userData
        ? userData.address_line1 + " " + userData.address_line2
        : "",
      city: userData?.address_line3 || "",
      country: "Sri Lanka",
    };

    window.payhere.startPayment(payment);
  };

  const formattedDate = reservationData
    ? new Date(reservationData.created_datetime).toLocaleString()
    : "";

  return (
    <div
      className="container mt-5"
      style={{ fontFamily: "'Segoe UI', sans-serif", fontSize: "16px" }}
    >
      <div className="card shadow-lg p-4 border-0">
        <h3 className="text-center mb-4 fw-bold" style={{ fontSize: "28px" }}>
          Payment Receipt
        </h3>

        <div className="container my-4">
          <div className="card shadow border-0">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Payment Summary</h4>
            </div>
            <div className="card-body">
              {/* Reservation & Service Details */}
              <h5 className="text-secondary mb-3">Reservation Information</h5>
              <table className="table table-bordered align-middle">
                <tbody>
                  <tr>
                    <th style={{ width: "30%" }}>Reservation ID</th>
                    <td>
                      {reservationData ? reservationData.reservation_id : ""}
                    </td>
                  </tr>
                  <tr>
                    <th>User ID</th>
                    <td>{userData ? userData.user_id : ""}</td>
                  </tr>
                  <tr>
                    <th>User Name</th>
                    <td>
                      {userData
                        ? userData.first_name + " " + userData.last_name
                        : "No name"}
                    </td>
                  </tr>
                  <tr>
                    <th>Date & Time</th>
                    <td>{formattedDate}</td>
                  </tr>
                  <tr>
                    <th>Service Description</th>
                    <td>
                      {reservationData
                        ? reservationData.service_description
                        : ""}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Item Breakdown */}
              {paymentItems?.length > 0 && (
                <>
                  <h5 className="text-secondary mt-4 mb-3">Itemized Charges</h5>
                  <table className="table table-striped table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "60%" }}>Description</th>
                        <th style={{ width: "40%" }}>Price (Rs.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentItems.map((item, index) => (
                        <tr key={index}>
                          <td>{item.description}</td>
                          <td>Rs. {parseFloat(item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Totals */}
              <div className="row mt-4">
                <div className="col-md-6 offset-md-6">
                  <table className="table table-borderless text-end">
                    <tbody>
                      <tr>
                        <th>Service Cost:</th>
                        <td>
                          Rs.{" "}
                          {reservationData
                            ? reservationData.service_cost.toFixed(2)
                            : "0.00"}
                        </td>
                      </tr>
                      <tr>
                        <th>Discount:</th>
                        <td>
                          Rs.{" "}
                          {reservationData
                            ? reservationData.discount.toFixed(2)
                            : "0.0"}
                        </td>
                      </tr>
                      <tr className="table-success">
                        <th className="fs-5">Final Amount:</th>
                        <td className="fs-4 fw-bold text-success">
                          Rs.{" "}
                          {reservationData
                            ? reservationData.final_amount.toFixed(2)
                            : "0.00"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

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
