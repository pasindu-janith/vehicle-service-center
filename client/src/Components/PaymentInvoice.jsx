import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import images from "../assets/assets";
import { BiReceipt } from "react-icons/bi";
import BASE_URL from "../config";
import { useParams } from "react-router-dom";

const PaymentInvoice = () => {
  const { resid } = useParams();
  const invoiceRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [reservationData, setReservationData] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const loadInvoice = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/loadInvoiceData?resid=${resid}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.invoiceData && data.completedService) {
            setInvoiceData(data.invoiceData);
            setReservationData(data.completedService);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };
    loadInvoice();
  }, []);

  const handleDownload = async () => {
    const input = invoiceRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let position = 0;

    if (imgHeight < pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    } else {
      // Multi-page logic
      let heightLeft = imgHeight;

      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        position -= pdfHeight;

        if (heightLeft > 0) {
          pdf.addPage();
        }
      }
    }

    pdf.save("invoice-" + invoiceData.invoice_id + ".pdf");
  };

  if (isLoading) {
    return (
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-3">Generating Invoice...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-darkblue mb-1 fw-bold">
          <BiReceipt className="text-success" />
          Payment Invoice
        </h2>

        <div>
          <button onClick={handleDownload} className="btn btn-outline-success">
            Download Invoice
          </button>
        </div>
      </div>

      <div
        ref={invoiceRef}
        className="p-4 border rounded bg-white"
        style={{ fontSize: "14px" }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <img
            src={images.logo}
            style={{ width: "200px" }}
            alt="Company Logo"
          />
          <div className="text-end">
            <h4 className="mb-0 text-primary">Shan Auto Service Center</h4>
            <p className="mb-0">123 Main Street, Colombo</p>
            <p className="mb-0">Phone: +94 123 456 789</p>
            <p className="mb-0">Email: shanauto@gmail.com</p>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-6">
            <h5 className="text-success mb-3">Invoice Information</h5>
            <div className="mb-2">
              <strong>Invoice ID:</strong> {invoiceData.invoice_id}
            </div>
            <div className="mb-2">
              <strong>Invoice Date:</strong>{" "}
              {new Date(invoiceData.created_datetime).toLocaleDateString()}
            </div>
            <div className="mb-2">
              <strong>Invoice Time:</strong>{" "}
              {new Date(invoiceData.created_datetime).toLocaleTimeString()}
            </div>
            <div className="mb-2">
              <strong>Payment:</strong> {invoiceData.payment_method}
            </div>
          </div>

          <div className="col-6">
            <h5 className="text-info mb-3">Customer Information</h5>
            <div className="mb-2">
              <strong>Customer ID:</strong> {invoiceData.customer_id}
            </div>
            <div className="mb-2">
              <strong>Customer:</strong>{" "}
              {`${invoiceData.first_name} ${invoiceData.last_name}`}
            </div>
            <div className="mb-2">
              <strong>Email:</strong> {invoiceData.email}
            </div>
            <div className="mb-2">
              <strong>Phone:</strong> {invoiceData.mobile_no}
            </div>
          </div>
        </div>

        {/* Reservation Details */}
        <div className="mb-4">
          <h5 className="text-primary mb-3">Reservation Details</h5>
          <div className="row">
            <div className="col-6">
              <div className="mb-2">
                <strong>Reservation ID:</strong>{" "}
                {reservationData.reservation_id}
              </div>
              <div className="mb-2">
                <strong>Vehicle Number:</strong> {reservationData.license_plate}
              </div>
              <div className="mb-2">
                <strong>Vehicle Model:</strong>{" "}
                {reservationData.vehicle_brand +
                  " " +
                  reservationData.model +
                  " (" +
                  reservationData.make_year +
                  ")" +
                  " - " +
                  reservationData.vehicle_type}
              </div>
            </div>
            <div className="col-6">
              <div className="mb-2">
                <strong>Service Date:</strong>{" "}
                {new Date(reservationData.end_date).toLocaleDateString()}
              </div>
              <div className="mb-2">
                <strong>Service Type:</strong> {reservationData.service_name}
              </div>
              <div className="mb-2">
                <strong>Service Description:</strong>{" "}
                {reservationData.service_description}
              </div>
            </div>
          </div>
        </div>

        <hr />

        {/* Service Charges Table */}
        <h5 className="text-primary mb-3">Service Charges</h5>
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "5%" }}>#</th>
              <th style={{ width: "75%" }}>Service Description</th>
              <th style={{ width: "20%" }}>Total (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {reservationData.payment_items.map((service, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{service.description}</td>
                <td className="text-end">{service.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Cost Summary */}
        <div className="row justify-content-end">
          <div className="col-md-6">
            <table className="table table-borderless">
              <tbody>
                <tr>
                  <td className="text-end">
                    <strong>Subtotal:</strong>
                  </td>
                  <td className="text-end">Rs. {invoiceData.service_cost}</td>
                </tr>
                <tr>
                  <td className="text-end">
                    <strong>Discount:</strong>
                  </td>
                  <td className="text-end text-success">
                    - Rs. {invoiceData.discount}
                  </td>
                </tr>
                {invoiceData.tax > 0 && (
                  <tr>
                    <td className="text-end">
                      <strong>Tax:</strong>
                    </td>
                    <td className="text-end">
                      Rs. {invoiceData.tax.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="table-primary">
                  <td className="text-end">
                    <strong>Grand Total:</strong>
                  </td>
                  <td className="text-end">
                    <strong>Rs. {invoiceData.final_amount.toFixed(2)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr />

        {/* Payment Status */}
        <div className="text-center mb-3">
          <h4 className="text-success mb-3">
            ✓ Payment Completed Successfully
          </h4>
          <p className="mb-0">
            Thank you for choosing Shan Auto Service Center!
          </p>
        </div>

        {/* Footer */}
        <div className="row mt-4">
          <div className="col-6">
            <small className="text-muted">
              <strong>Terms & Conditions:</strong>
              <br />
              • All services are guaranteed for 30 days
              <br />
              • Parts warranty as per manufacturer
              <br />• Payment is non-refundable
            </small>
          </div>
          <div className="col-6 text-end">
            <small className="text-muted">
              For any queries, contact us at:
              <br />
              <strong>support@shanauto.com</strong>
              <br />
              <strong>+94 123 456 789</strong>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInvoice;
