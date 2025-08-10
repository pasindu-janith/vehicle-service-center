import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import images from "../assets/assets";

const PaymentInvoice = () => {
  const invoiceRef = useRef();

  const invoiceData = {
    id: "INV-20250621-001",
    date: "2025-06-21T18:30:00",
    customerName: "Pasindu Janith",
    items: [
      { description: "Vehicle Service Package A", qty: 1, rate: 3500 },
      { description: "Oil Change", qty: 1, rate: 1500 },
    ],
    total: 5000,
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

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-darkblue mb-1 fw-bold">Payment Invoice</h2>

        <div>
          {/* <button
            onClick={handlePrint}
            className="btn btn-outline-primary me-2"
          >
            Print Invoice
          </button> */}
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <img src={images.logo} style={{ width: "200px" }} />
          <div className="text-end">
            <h4 className="mb-0">Shan Auto Service Center</h4>
            <p className="mb-0">123 Main Street, Colombo</p>
            <p className="mb-0">Phone: +94 123 456 789</p>
            <p className="mb-0">Email:shanauto@gmail.com</p>
          </div>
        </div>

        <h4 className="mb-4">Thank you for your payment!</h4>

        <div>
          <strong>Invoice ID:</strong> {invoiceData.id}
        </div>
        <div>
          <strong>Reservation ID:</strong> 20
        </div>
        <div>
          <strong>Date:</strong> {new Date(invoiceData.date).toLocaleString()}
        </div>
        <div>
          <strong>Customer:</strong> {invoiceData.customerName}
        </div>

        <hr />

        <table className="table table-bordered mt-3">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>{item.qty}</td>
                <td>Rs. {item.rate.toFixed(2)}</td>
                <td>Rs. {(item.qty * item.rate).toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="4" className="text-end">
                <strong>Grand Total</strong>
              </td>
              <td>
                <strong>Rs. {invoiceData.total.toFixed(2)}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4">
          If you have any questions, contact support@shanauto.com
        </p>
      </div>
    </div>
  );
};

export default PaymentInvoice;
