import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  FaDownload, 
  FaPrint, 
  FaCheckCircle, 
  FaReceipt, 
  FaCalendarAlt,
  FaUser,
  FaCar,
  FaTools,
  FaMoneyBillWave,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaFileInvoiceDollar,
  FaShare,
  FaCopy
} from "react-icons/fa";
import { MdVerifiedUser, MdPayment } from "react-icons/md";
import { BiLoaderAlt, BiReceipt } from "react-icons/bi";
import { useSearchParams, useNavigate } from "react-router-dom";
import images from "../assets/assets";
import BASE_URL from "../config.js";

const PaymentInvoice = () => {
  const invoiceRef = useRef();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resid = searchParams.get("resid");
  
  const [invoiceData, setInvoiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Mock data - replace with actual API call
  const mockInvoiceData = {
    id: "INV-20250621-001",
    reservationId: resid || "R-2025-001", 
    date: new Date().toISOString(),
    customerName: "Pasindu Janith",
    customerEmail: "pasindu@example.com",
    customerPhone: "+94 77 123 4567",
    vehicleInfo: {
      licensePlate: "ABC-1234",
      brand: "Toyota",
      model: "Corolla",
      year: "2020"
    },
    serviceInfo: {
      name: "Premium Service Package",
      description: "Complete vehicle maintenance and inspection",
      technicianName: "Kasun Perera",
      serviceDate: "2025-01-20",
      completedDate: new Date().toISOString()
    },
    items: [
      { description: "Engine Oil Change (Synthetic)", qty: 1, rate: 2500, category: "Maintenance" },
      { description: "Oil Filter Replacement", qty: 1, rate: 800, category: "Parts" },
      { description: "Brake Fluid Top-up", qty: 1, rate: 500, category: "Fluids" },
      { description: "Vehicle Inspection", qty: 1, rate: 1200, category: "Service" },
    ],
    subtotal: 5000,
    discount: 500,
    tax: 0,
    total: 4500,
    paymentMethod: "Credit Card",
    paymentStatus: "Completed",
    transactionId: "TXN-" + Date.now(),
    paidDate: new Date().toISOString()
  };

  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setInvoiceData(mockInvoiceData);
          setIsLoading(false);
        }, 1500);
        
        // Replace with actual API call
        // const response = await fetch(`${BASE_URL}/getInvoice?resid=${resid}`);
        // const data = await response.json();
        // setInvoiceData(data);
        // setIsLoading(false);
      } catch (error) {
        console.error("Error loading invoice:", error);
        setIsLoading(false);
      }
    };
    
    loadInvoiceData();
  }, [resid]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const input = invoiceRef.current;
      const canvas = await html2canvas(input, { 
        scale: 2,
        logging: false,
        useCORS: true
      });
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

      pdf.save(`invoice-${invoiceData.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const copyInvoiceLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <BiLoaderAlt className="text-primary mb-3 spinning" size={60} />
          <h4 className="text-muted">Generating your invoice...</h4>
          <p className="text-muted">Please wait while we prepare your payment receipt</p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <FaFileInvoiceDollar className="text-muted mb-3" size={64} />
          <h4 className="text-muted">Invoice not found</h4>
          <p className="text-muted mb-4">The requested invoice could not be loaded.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/myaccount/payments')}
          >
            <FaArrowLeft className="me-2" />
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-outline-secondary me-3"
                onClick={() => navigate('/myaccount/payments')}
              >
                <FaArrowLeft size={16} />
              </button>
              <div className="d-flex align-items-center">
                <BiReceipt className="text-success me-3" size={40} />
                <div>
                  <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2.5rem' }}>
                    Payment Invoice
                  </h1>
                  <p className="text-muted mb-0">
                    Invoice #{invoiceData.id}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary"
                onClick={copyInvoiceLink}
                title="Copy Invoice Link"
              >
                <FaShare size={16} />
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <BiLoaderAlt className="spinning" size={16} />
                ) : (
                  <FaPrint size={16} />
                )}
              </button>
              <button 
                className="btn btn-success"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <BiLoaderAlt className="me-2 spinning" size={16} />
                ) : (
                  <FaDownload className="me-2" size={16} />
                )}
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="alert alert-success border-0 shadow-sm">
            <div className="d-flex align-items-center">
              <FaCheckCircle className="text-success me-3" size={32} />
              <div>
                <h5 className="fw-bold mb-1 text-success">Payment Successful!</h5>
                <p className="mb-0 text-dark">
                  Your payment has been processed successfully. Thank you for your business!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="card border-0 shadow-sm">
            <div 
              ref={invoiceRef}
              className="card-body p-5 bg-white"
              style={{ fontSize: "14px", lineHeight: "1.6" }}
            >
              {/* Company Header */}
              <div className="row mb-5">
                <div className="col-md-6">
                  <img 
                    src={images.logo} 
                    alt="Shan Auto Service"
                    style={{ height: "60px", maxWidth: "200px" }}
                    className="mb-3"
                  />
                  <div>
                    <h3 className="fw-bold text-primary mb-2">Shan Auto Service Center</h3>
                    <div className="text-muted">
                      <div className="d-flex align-items-center mb-1">
                        <FaMapMarkerAlt className="me-2" size={12} />
                        <span>123 Main Street, Colombo 07, Sri Lanka</span>
                      </div>
                      <div className="d-flex align-items-center mb-1">
                        <FaPhone className="me-2" size={12} />
                        <span>+94 11 234 5678</span>
                      </div>
                      <div className="d-flex align-items-center mb-1">
                        <FaEnvelope className="me-2" size={12} />
                        <span>contact@shanauto.lk</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <FaGlobe className="me-2" size={12} />
                        <span>www.shanauto.lk</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 text-md-end">
                  <div className="bg-primary text-white p-4 rounded">
                    <h2 className="fw-bold mb-3">INVOICE</h2>
                    <div className="mb-2">
                      <strong>Invoice #: </strong>{invoiceData.id}
                    </div>
                    <div className="mb-2">
                      <strong>Date: </strong>{new Date(invoiceData.date).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Status: </strong>
                      <span className="badge bg-success ms-1">PAID</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Service Info */}
              <div className="row mb-5">
                <div className="col-md-6">
                  <div className="bg-light p-4 rounded">
                    <h5 className="fw-bold text-primary mb-3 d-flex align-items-center">
                      <FaUser className="me-2" size={18} />
                      Bill To
                    </h5>
                    <div className="mb-2">
                      <strong>{invoiceData.customerName}</strong>
                    </div>
                    <div className="mb-2 text-muted">
                      <FaEnvelope className="me-2" size={12} />
                      {invoiceData.customerEmail}
                    </div>
                    <div className="text-muted">
                      <FaPhone className="me-2" size={12} />
                      {invoiceData.customerPhone}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="bg-light p-4 rounded">
                    <h5 className="fw-bold text-primary mb-3 d-flex align-items-center">
                      <FaCar className="me-2" size={18} />
                      Vehicle Information
                    </h5>
                    <div className="mb-2">
                      <strong>{invoiceData.vehicleInfo.licensePlate}</strong>
                    </div>
                    <div className="mb-2 text-muted">
                      {invoiceData.vehicleInfo.brand} {invoiceData.vehicleInfo.model}
                    </div>
                    <div className="text-muted">
                      Year: {invoiceData.vehicleInfo.year}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="row mb-5">
                <div className="col-12">
                  <div className="bg-light p-4 rounded">
                    <h5 className="fw-bold text-primary mb-3 d-flex align-items-center">
                      <FaTools className="me-2" size={18} />
                      Service Details
                    </h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>Service: </strong>{invoiceData.serviceInfo.name}
                        </div>
                        <div className="mb-2">
                          <strong>Description: </strong>{invoiceData.serviceInfo.description}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>Technician: </strong>{invoiceData.serviceInfo.technicianName}
                        </div>
                        <div className="mb-2">
                          <strong>Service Date: </strong>{new Date(invoiceData.serviceInfo.serviceDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="table-responsive mb-5">
                <table className="table table-bordered">
                  <thead className="table-primary">
                    <tr>
                      <th className="fw-bold">#</th>
                      <th className="fw-bold">Description</th>
                      <th className="fw-bold">Category</th>
                      <th className="fw-bold text-center">Qty</th>
                      <th className="fw-bold text-end">Rate (Rs.)</th>
                      <th className="fw-bold text-end">Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="text-muted">{index + 1}</td>
                        <td>{item.description}</td>
                        <td>
                          <span className="badge bg-secondary">{item.category}</span>
                        </td>
                        <td className="text-center">{item.qty}</td>
                        <td className="text-end">{item.rate.toLocaleString()}</td>
                        <td className="text-end fw-medium">{(item.qty * item.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment Summary */}
              <div className="row">
                <div className="col-md-7">
                  <div className="bg-light p-4 rounded">
                    <h6 className="fw-bold text-primary mb-3 d-flex align-items-center">
                      <MdPayment className="me-2" size={18} />
                      Payment Information
                    </h6>
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-2">
                          <strong>Method:</strong>
                        </div>
                        <div className="mb-2">
                          <strong>Transaction ID:</strong>
                        </div>
                        <div className="mb-2">
                          <strong>Reservation ID:</strong>
                        </div>
                        <div>
                          <strong>Payment Date:</strong>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="mb-2">{invoiceData.paymentMethod}</div>
                        <div className="mb-2 text-muted small">{invoiceData.transactionId}</div>
                        <div className="mb-2">#{invoiceData.reservationId}</div>
                        <div>{new Date(invoiceData.paidDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-5">
                  <div className="bg-primary text-white p-4 rounded">
                    <table className="table table-borderless text-white mb-0">
                      <tbody>
                        <tr>
                          <td className="pb-2">Subtotal:</td>
                          <td className="pb-2 text-end">Rs. {invoiceData.subtotal.toLocaleString()}</td>
                        </tr>
                        {invoiceData.discount > 0 && (
                          <tr>
                            <td className="pb-2 text-warning">Discount:</td>
                            <td className="pb-2 text-end text-warning">- Rs. {invoiceData.discount.toLocaleString()}</td>
                          </tr>
                        )}
                        {invoiceData.tax > 0 && (
                          <tr>
                            <td className="pb-2">Tax:</td>
                            <td className="pb-2 text-end">Rs. {invoiceData.tax.toLocaleString()}</td>
                          </tr>
                        )}
                        <tr className="border-top border-light pt-3">
                          <td className="pt-3">
                            <h5 className="fw-bold mb-0">Total Amount:</h5>
                          </td>
                          <td className="pt-3 text-end">
                            <h4 className="fw-bold mb-0">Rs. {invoiceData.total.toLocaleString()}</h4>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="row mt-5 pt-4 border-top">
                <div className="col-md-6">
                  <h6 className="fw-bold text-primary mb-2">Terms & Conditions</h6>
                  <ul className="text-muted small mb-0">
                    <li>Payment is due within 30 days of service completion</li>
                    <li>All services come with a 90-day warranty</li>
                    <li>Original parts warranty as per manufacturer terms</li>
                  </ul>
                </div>
                
                <div className="col-md-6 text-md-end">
                  <h6 className="fw-bold text-primary mb-2">Thank You!</h6>
                  <p className="text-muted small mb-2">
                    For any questions about this invoice, contact us at:
                  </p>
                  <p className="text-muted small mb-0">
                    <strong>support@shanauto.lk</strong> | <strong>+94 11 234 5678</strong>
                  </p>
                </div>
              </div>

              {/* Verification Footer */}
              <div className="text-center mt-4 pt-4 border-top">
                <div className="d-inline-flex align-items-center bg-success text-white px-4 py-2 rounded">
                  <MdVerifiedUser className="me-2" size={20} />
                  <span className="fw-medium">VERIFIED PAYMENT - INVOICE DIGITALLY SIGNED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media print {
          .container-fluid {
            padding: 0 !important;
            background-color: white !important;
          }
          
          .btn, .alert, .row:first-child {
            display: none !important;
          }
          
          .card {
            box-shadow: none !important;
            border: none !important;
          }
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .btn {
          transition: all 0.2s ease;
        }
        
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        
        .table th {
          border-color: #dee2e6 !important;
        }
        
        .table td {
          border-color: #dee2e6 !important;
        }
        
        .badge {
          font-size: 0.75rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default PaymentInvoice;