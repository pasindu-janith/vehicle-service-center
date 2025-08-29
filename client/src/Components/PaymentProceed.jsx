import React, { useEffect, useState } from "react";
import {
  FaCreditCard,
  FaReceipt,
  FaUser,
  FaCalendarAlt,
  FaTools,
  FaMoneyBillWave,
  FaShieldAlt,
  FaArrowLeft,
  FaTag,
} from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { BiReceipt } from "react-icons/bi";
import { IoMdInformationCircle } from "react-icons/io";
import "bootstrap/dist/css/bootstrap.min.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import BASE_URL,{BASE_CLIENT_URL} from "../config.js";

const MERCHANT_ID = "1230724"; // Replace with your real merchant ID

const PaymentProceed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resid = searchParams.get("resid");
  const [userData, setUserData] = useState(null);
  const [reservationData, setReservationData] = useState(null);
  const [paymentItems, setPaymentItems] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Register your callbacks
    window.payhere.onCompleted = function (orderId) {
      console.log("Payment completed. OrderID:" + orderId);
      setIsProcessing(false);
      navigate(`/myaccount/payment-invoice/${orderId}`);
    };

    window.payhere.onDismissed = function () {
      console.log("Payment dismissed");
      setIsProcessing(false);
    };

    window.payhere.onError = function (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
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
          `${BASE_URL}/loadPaymentPageData?resid=${resid}`,
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
        setUserData(data.userData);
        setReservationData(data.reservationData);
        setPaymentItems(data.paymentItems);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPaymentPage();
  }, []);

  const handlePayment = async () => {
    if (!window.payhere) {
      alert("PayHere SDK not loaded.");
      return;
    }

    setIsProcessing(true);
    const amount = parseFloat(reservationData.final_amount).toFixed(2);

    try {
      const response = await fetch(`${BASE_URL}/pay-hash`, {
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
        return_url: `https://vehicle-service-center-client.vercel.app/myaccount/payment-invoice/${reservationData.reservation_id}`,
        cancel_url: `https://vehicle-service-center-client.vercel.app/myaccount/payment-failed`,
        notify_url: `https://vehicle-service-center-backend.onrender.com/api/v1/user/payhere-notify`,
        order_id: reservationData.reservation_id,
        items: reservationData.service_name,
        amount,
        currency: "LKR",
        hash,
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
    } catch (error) {
      console.error("Payment initialization error:", error);
      setIsProcessing(false);
    }
  };

  const formattedDate = reservationData
    ? new Date(reservationData.created_datetime).toLocaleString()
    : "";

  if (isLoading) {
    return (
      <div
        className="container-fluid d-flex justify-content-center align-items-center bg-transparent"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <spinner className="spinner-border text-primary mb-3" role="status" style={{ width: "4rem", height: "4rem" }}>
            <span className="visually-hidden">Loading...</span>
          </spinner>
          <h4 className="text-muted">Loading payment details...</h4>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container bg-transparent px-4 py-4"
      style={{ minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center">
                <MdPayment className="text-darkblue me-3" size={40} />
                <div>
                  <h1
                    className="fw-bold text-dark mb-1 main-title"
                    style={{ fontSize: "2.5rem" }}
                  >
                    Payment Checkout
                  </h1>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="d-flex align-items-center">
              <span className="badge bg-success px-3 py-2">
                <FaShieldAlt className="me-1" size={12} />
                Secure Payment
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Payment Card */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex align-items-center">
                <h4 className="fw-bold mb-0 text-dark">Payment Summary</h4>
              </div>
            </div>

            <div className="card-body p-4">
              {/* Reservation Details */}
              <div className="mb-4">
                <h5 className="text-dark fw-bold mb-3 d-flex align-items-center">
                  <IoMdInformationCircle
                    className="text-primary me-2"
                    size={20}
                  />
                  Reservation Information
                </h5>

                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="bg-light rounded p-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaReceipt className="text-muted me-2" size={16} />
                        <small className="text-muted fw-medium">
                          Reservation ID
                        </small>
                      </div>
                      <span className="fw-bold text-dark fs-5">
                        {reservationData?.reservation_id || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded p-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaReceipt className="text-muted me-2" size={16} />
                        <small className="text-muted fw-medium">
                          Vehicle
                        </small>
                      </div>
                      <span className="fw-medium text-dark">
                        {reservationData?.vehicle_id || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light rounded p-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaCalendarAlt className="text-muted me-2" size={16} />
                        <small className="text-muted fw-medium">
                          Created at
                        </small>
                      </div>
                      <span className="fw-medium text-dark">
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-light rounded p-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaUser className="text-muted me-2" size={16} />
                        <small className="text-muted fw-medium">Customer</small>
                      </div>
                      <span className="fw-medium text-dark">
                        {userData
                          ? `${userData.first_name} ${userData.last_name} (${userData.user_id})`
                          : "No name"}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="bg-light rounded p-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaTools className="text-muted me-2" size={16} />
                        <small className="text-muted fw-medium">
                          Service Type
                        </small>
                      </div>
                      <span className="fw-medium text-dark">
                        {reservationData?.service_name || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {reservationData?.service_description && (
                  <div className="mt-3">
                    <div className="bg-light rounded p-3">
                      <div className="d-flex align-items-center mb-2">
                        <IoMdInformationCircle
                          className="text-muted me-2"
                          size={16}
                        />
                        <small className="text-muted fw-medium">
                          Service Description
                        </small>
                      </div>
                      <p className="mb-0 text-dark">
                        {reservationData.service_description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Itemized Charges */}
              {paymentItems?.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-dark fw-bold mb-3 d-flex align-items-center">
                    <BiReceipt className="text-primary me-2" size={24} />
                    Service Charges
                  </h5>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr className="border-bottom">
                          <th className="fw-bold text-dark py-3">
                            Description
                          </th>
                          <th className="fw-bold text-dark py-3 text-end">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentItems.map((item, index) => (
                          <tr key={index} className="border-bottom">
                            <td className="py-3">
                              <div className="d-flex align-items-center">
                                <FaTag className="text-muted me-2" size={14} />
                                {item.description}
                              </div>
                            </td>
                            <td className="py-3 text-end fw-medium">
                              Rs. {parseFloat(item.price).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Breakdown */}
              <div className="bg-light rounded p-3">
                <div className="row">
                  <div className="col-md-8 offset-md-4">
                    <table className="table table-borderless mb-0">
                      <tbody>
                        <tr className="border-bottom">
                          <td className="py-2 text-muted">Service Cost:</td>
                          <td className="py-2 text-end fw-medium">
                            Rs.{" "}
                            {reservationData
                              ? parseFloat(
                                  reservationData.service_cost
                                ).toLocaleString()
                              : "0.00"}
                          </td>
                        </tr>
                        {reservationData?.discount > 0 && (
                          <tr className="border-bottom">
                            <td className="py-2 text-success">
                              <FaTag className="me-1" size={14} />
                              Discount:
                            </td>
                            <td className="py-2 text-end text-success fw-medium">
                              - Rs.{" "}
                              {reservationData
                                ? parseFloat(
                                    reservationData.discount
                                  ).toLocaleString()
                                : "0.00"}
                            </td>
                          </tr>
                        )}
                        <tr className="border-top pt-3">
                          <td className="py-3">
                            <h5 className="fw-bold text-dark mb-0">
                              Total Amount:
                            </h5>
                          </td>
                          <td className="py-3 text-end">
                            <h4 className="fw-bold text-primary mb-0">
                              Rs.{" "}
                              {reservationData
                                ? parseFloat(
                                    reservationData.final_amount
                                  ).toLocaleString()
                                : "0.00"}
                            </h4>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Actions Sidebar */}
        <div className="col-lg-4">
          {/* Payment Action Card */}
          <div className="card shadow-sm mb-4" style={{ borderColor: "#016ae2ff", borderRadius: "20px" }}>
            <div
              className="card-header text-white bg-primary" style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }}
            >
              <h5 className="fw-bold mb-0 d-flex align-items-center">
                Complete Payment
              </h5>
            </div>

            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FaMoneyBillWave className="text-primary" size={32} />
                </div>
                <h4 className="fw-bold text-primary mb-2">
                  Rs.{" "}
                  {reservationData
                    ? parseFloat(reservationData.final_amount).toLocaleString()
                    : "0.00"}
                </h4>
                <p className="text-muted mb-0">Amount to Pay</p>
              </div>

              <div className="d-grid gap-3">
                <button
                  className="btn btn-primary btn-lg fs-6"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Processing...</span>
                      </div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="me-2" size={18} />
                      Proceed Payment
                    </>
                  )}
                </button>

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate(-1)}
                  disabled={isProcessing}
                >
                  <FaArrowLeft className="me-2" size={14} />
                  Back to Payments
                </button>
              </div>

              <div
                className="alert alert-info border-0 mt-3"
                style={{ backgroundColor: "#e9ffe9ff" }}
              >
                <div className="d-flex align-items-start">
                  <div>
                    <small className="text-success fw-medium">
                      Secure Payment
                    </small>
                    <p className="mb-0 small text-muted">
                      Your payment is processed securely through PayHere. Your
                      card details are encrypted and protected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        

        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }

        .btn {
          transition: all 0.2s ease;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .bg-opacity-10 {
          background-color: rgba(13, 110, 253, 0.1) !important;
        }

        .alert {
          border-radius: 10px;
        }

        .badge {
          font-size: 0.75rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default PaymentProceed;
