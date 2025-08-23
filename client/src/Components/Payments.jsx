import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaClock,
  FaCar,
  FaCalendarAlt,
  FaSearch,
  FaDownload,
  FaEye
} from "react-icons/fa";
import { MdPayment, MdHistory } from "react-icons/md";
import { BiCalendar } from "react-icons/bi";
import "./styles/Dashboard.css";
import BASE_URL from "../config.js";

export const Payments = () => {
  const [paymentData, setPaymentData] = useState([]);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const loadServiceRecords = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/loadServiceRecordPayment`,
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
          
          // Mock completed payments for demonstration
          setCompletedPayments([
            {
              reservation_id: "R001",
              vehicle_id: "ABC-1234",
              service_name: "Oil Change & Filter",
              payment_date: "2025-01-15",
              final_amount: "5500.00",
              payment_method: "Credit Card",
              status: "Completed"
            },
            {
              reservation_id: "R002", 
              vehicle_id: "XYZ-5678",
              service_name: "Brake Service",
              payment_date: "2025-01-12",
              final_amount: "8750.00",
              payment_method: "Bank Transfer",
              status: "Completed"
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching service records:", error);
        setIsLoading(false);
      }
    };
    loadServiceRecords();
  }, []);

  const calculateTotalPending = () => {
    return paymentData.reduce((total, record) => total + parseFloat(record.final_amount || 0), 0);
  };

  const filteredPendingPayments = paymentData.filter(record =>
    record.vehicle_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.reservation_id?.toString().includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <span className="badge bg-success px-3 py-2"><FaCheckCircle className="me-1" size={12} />Completed</span>;
      case 'pending':
        return <span className="badge bg-warning text-dark px-3 py-2"><FaClock className="me-1" size={12} />Pending</span>;
      case 'failed':
        return <span className="badge bg-danger px-3 py-2"><FaExclamationCircle className="me-1" size={12} />Failed</span>;
      default:
        return <span className="badge bg-secondary px-3 py-2">Unknown</span>;
    }
  };

  return (
    <div className="container bg-transparent px-4 py-4" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <MdPayment className="text-darkblue me-3" size={40} />
              <div>
                <h1 className="fw-bold main-title mb-1" style={{ fontSize: '2.5rem' }}>
                  Payments
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm" style={{ backgroundColor: '#dc3545' }}>
            <div className="card-body text-white text-center p-4">
              <FaExclamationCircle size={32} className="mb-3" />
              <h6 className="card-title mb-2">Pending Payments</h6>
              <h3 className="fw-bold mb-1">{paymentData.length}</h3>
              <small className="opacity-75">Services awaiting payment</small>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm" style={{ backgroundColor: '#198754' }}>
            <div className="card-body text-white text-center p-4">
              <FaCheckCircle size={32} className="mb-3" />
              <h6 className="card-title mb-2">Completed Payments</h6>
              <h3 className="fw-bold mb-1">{completedPayments.length}</h3>
              <small className="opacity-75">Successfully processed</small>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0d6efd' }}>
            <div className="card-body text-white text-center p-4">
              <FaMoneyBillWave size={32} className="mb-3" />
              <h6 className="card-title mb-2">Pending Amount</h6>
              <h3 className="fw-bold mb-1">Rs. {calculateTotalPending().toLocaleString()}</h3>
              <small className="opacity-75">Total outstanding</small>
            </div>
          </div>
        </div>
        
      </div>

      {/* Pending Payments Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <FaCreditCard className="text-danger me-2" size={20} />
                  <h5 className="fw-bold mb-0 text-dark">Pending Payments</h5>
                  {paymentData.length > 0 && (
                    <span className="badge bg-danger ms-2">{paymentData.length}</span>
                  )}
                </div>
                
                {/* Search and Filter */}
                <div className="d-flex gap-2">
                  <div className="position-relative">
                    <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
                    <input
                      type="text"
                      className="form-control form-control-sm ps-5"
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '200px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-body p-0">
              {isLoading ? (
                <div className="text-center py-5">
                  <spinner className="spinner-border text-danger" role="status" style={{ width: "3.5rem", height: "3.5rem" }}>
                    <span className="visually-hidden">Loading...</span>
                  </spinner>
                  <h5 className="text-muted">Loading payment data...</h5>
                </div>
              ) : filteredPendingPayments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th scope="col" className="fw-bold text-dark px-4 py-3">Reservation ID</th>
                        <th scope="col" className="fw-bold text-dark py-3">Vehicle</th>
                        <th scope="col" className="fw-bold text-dark py-3">Service</th>
                        <th scope="col" className="fw-bold text-dark py-3">Start Date</th>
                        <th scope="col" className="fw-bold text-dark py-3">End Date</th>
                        <th scope="col" className="fw-bold text-dark py-3">Amount</th>
                        <th scope="col" className="fw-bold text-dark py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPendingPayments.map((record) => (
                        <tr key={record.reservation_id} className="border-bottom">
                          <td className="px-4 py-3">
                            <span className="fw-bold text-primary">#{record.reservation_id}</span>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <span className="fw-medium">{record.vehicle_id}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-dark">{record.service_name}</span>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <BiCalendar className="text-muted me-2" size={16} />
                              <span className="text-muted">
                                {new Date(record.reserve_date).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <BiCalendar className="text-muted me-2" size={16} />
                              <span className="text-muted">
                                {new Date(record.end_date).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="fw-bold text-danger fs-6">
                              Rs. {parseFloat(record.final_amount).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3">
                            <button
                              className="btn btn-danger btn-sm px-3"
                              onClick={() =>
                                navigate(
                                  `/myaccount/proceed-payment?resid=${record.reservation_id}`
                                )
                              }
                            >
                              <FaCreditCard className="me-1" size={14} />
                              Pay Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <FaCheckCircle className="text-success mb-3" size={64} />
                  <h4 className="text-muted mb-2">All payments up to date!</h4>
                  <p className="text-muted mb-0">You have no pending payments at this time.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <MdHistory className="text-success me-2" size={22} />
                  <h5 className="fw-bold mb-0 text-dark">Payment History</h5>
                  {completedPayments.length > 0 && (
                    <span className="badge bg-success ms-2">{completedPayments.length}</span>
                  )}
                </div>
                
                <button className="btn btn-outline-primary btn-sm">
                  <FaDownload className="me-1" size={14} />
                  Download Report
                </button>
              </div>
            </div>
            
            <div className="card-body p-0">
              {completedPayments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th scope="col" className="fw-bold text-dark px-4 py-3">Reservation ID</th>
                        <th scope="col" className="fw-bold text-dark py-3">Vehicle</th>
                        <th scope="col" className="fw-bold text-dark py-3">Service</th>
                        <th scope="col" className="fw-bold text-dark py-3">Payment Date</th>
                        <th scope="col" className="fw-bold text-dark py-3">Amount</th>
                        <th scope="col" className="fw-bold text-dark py-3">Method</th>
                        <th scope="col" className="fw-bold text-dark py-3">Status</th>
                        <th scope="col" className="fw-bold text-dark py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedPayments.map((record) => (
                        <tr key={record.reservation_id} className="border-bottom">
                          <td className="px-4 py-3">
                            <span className="fw-bold text-success">#{record.reservation_id}</span>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <FaCar className="text-muted me-2" size={16} />
                              <span className="fw-medium">{record.vehicle_id}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-dark">{record.service_name}</span>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <FaCalendarAlt className="text-muted me-2" size={14} />
                              <span className="text-muted">
                                {new Date(record.payment_date).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="fw-bold text-success fs-6">
                              Rs. {parseFloat(record.final_amount).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="text-muted">{record.payment_method}</span>
                          </td>
                          <td className="py-3">
                            {getStatusBadge(record.status)}
                          </td>
                          <td className="py-3">
                            <button className="btn btn-outline-primary btn-sm">
                              <FaEye className="me-1" size={12} />
                              Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <MdHistory className="text-muted mb-3" size={64} />
                  <h4 className="text-muted mb-2">No payment history yet</h4>
                  <p className="text-muted mb-0">Your completed payments will appear here once you make your first payment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        
        
        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
        }
        
        .badge {
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        
        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </div>
  );
};