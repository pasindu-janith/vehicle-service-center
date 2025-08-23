import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import images from "../assets/assets";
import { BiLoaderAlt, BiReceipt } from "react-icons/bi";

const PaymentInvoice = () => {
  const invoiceRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const invoiceData = {
    id: "INV-20250621-001",
    date: "2025-06-21T18:30:00",
    customerName: "Pasindu Janith",
    customerEmail: "pasindu.janith@gmail.com",
    customerPhone: "+94 77 123 4567",
    reservationDetails: {
      reservationId: "RSV-20250621-020",
      vehicleNumber: "CAR-1234",
      vehicleModel: "Toyota Prius",
      serviceDate: "2025-06-21T09:00:00",
      serviceType: "Full Service Package",
      mechanic: "John Silva",
      serviceStatus: "Completed",
    },
    services: [
      {
        description: "Vehicle Service Package A",
        qty: 1,
        rate: 3500,
        category: "Service",
      },
      {
        description: "Oil Change (Synthetic)",
        qty: 1,
        rate: 1500,
        category: "Service",
      },
      {
        description: "Air Filter Replacement",
        qty: 1,
        rate: 800,
        category: "Parts",
      },
      {
        description: "Brake Fluid Top-up",
        qty: 1,
        rate: 500,
        category: "Service",
      },
    ],
    subtotal: 6300,
    discount: 300,
    discountPercentage: 5,
    tax: 0, // Assuming no tax for auto service
    total: 6000,
  };

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

    pdf.save("invoice-" + invoiceData.id + ".pdf");
  };

  if (isLoading) {
    return (
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
      >
        <div className="text-center">
          <spinner className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </spinner>
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
              <strong>Invoice ID:</strong> {invoiceData.id}
            </div>
            <div className="mb-2">
              <strong>Invoice Date:</strong>{" "}
              {new Date(invoiceData.date).toLocaleDateString()}
            </div>
            <div className="mb-2">
              <strong>Invoice Time:</strong>{" "}
              {new Date(invoiceData.date).toLocaleTimeString()}
            </div>
          </div>

          <div className="col-6">
            <h5 className="text-info mb-3">Customer Information</h5>
            <div className="mb-2">
              <strong>Customer:</strong> {invoiceData.customerName}
            </div>
            <div className="mb-2">
              <strong>Email:</strong> {invoiceData.customerEmail}
            </div>
            <div className="mb-2">
              <strong>Phone:</strong> {invoiceData.customerPhone}
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
                {invoiceData.reservationDetails.reservationId}
              </div>
              <div className="mb-2">
                <strong>Vehicle Number:</strong>{" "}
                {invoiceData.reservationDetails.vehicleNumber}
              </div>
              <div className="mb-2">
                <strong>Vehicle Model:</strong>{" "}
                {invoiceData.reservationDetails.vehicleModel}
              </div>
            </div>
            <div className="col-6">
              <div className="mb-2">
                <strong>Service Date:</strong>{" "}
                {new Date(
                  invoiceData.reservationDetails.serviceDate
                ).toLocaleDateString()}
              </div>
              <div className="mb-2">
                <strong>Service Type:</strong>{" "}
                {invoiceData.reservationDetails.serviceType}
              </div>
              <div className="mb-2">
                <strong>Service Description:</strong>{" "}
                {invoiceData.reservationDetails.mechanic}
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
            {invoiceData.services.map((service, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{service.description}</td>
                <td className="text-end">
                  {(service.qty * service.rate).toFixed(2)}
                </td>
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
                  <td className="text-end">
                    Rs. {invoiceData.subtotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="text-end">
                    <strong>
                      Discount ({invoiceData.discountPercentage}%):
                    </strong>
                  </td>
                  <td className="text-end text-success">
                    - Rs. {invoiceData.discount.toFixed(2)}
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
                    <strong>Rs. {invoiceData.total.toFixed(2)}</strong>
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
