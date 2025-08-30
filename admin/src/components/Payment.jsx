import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import { BASE_URL } from "../config";

const Payment = () => {
  const [tableData, setTableData] = useState([]);
  // const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const dtInstance = useRef(null);
  const [activeReservation, setActiveReservation] = useState(null);

  useEffect(() => {
    // Only initialize or reinitialize DataTables if data is loaded
    if (tableData.length > 0) {
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
  }, [tableData]); // Re-run only when data is updated

  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadPaymentPageData`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTableData(data);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      }
    };
    loadPaymentData();
  }, []);
  return (
    <section className="content pt-2">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-success">
                <h4>Payment and Invoicing</h4>
              </div>
              {/* /.card-header */}
              <div className="card-body">
                <table
                  id="example2"
                  className="table table-bordered table-hover"
                  ref={tableRef}
                >
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Res ID</th>
                      <th>Customer</th>
                      <th>Vehicle No</th>
                      <th>Service</th>
                      <th>Service Date</th>
                      <th>Amount</th>
                      <th>Pay Method</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item) => (
                      <tr key={item.invoice_id}>
                        <td>{item.invoice_id}</td>
                        <td>{item.reservation_id}</td>
                        <td>{item.customer_id}</td>
                        <td>{item.vehicle_id}</td>
                        <td>{item.service_name}</td>
                        <td>{item.end_date.split("T")[0]}</td>
                        <td>{item.final_amount}</td>
                        <td>{item.payment_method || "Pending"}</td>
                        <td>
                          <button
                            className="btn btn-info btn-sm"
                            title="View Details"
                            onClick={() => setActiveReservation(item)}
                          >
                            <i className="fas fa-info-circle"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {activeReservation && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Invoice Details - ID {activeReservation.invoice_id}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setActiveReservation(null)}
                >
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Reservation ID</th>
                      <td>{activeReservation.reservation_id}</td>
                    </tr>
                    <tr>
                      <th>Customer</th>
                      <td>
                        {activeReservation.customer_id +
                          " - " +
                          activeReservation.first_name +
                          " " +
                          activeReservation.last_name}
                      </td>
                    </tr>
                    <tr>
                      <th>Customer NIC</th>
                      <td>{activeReservation.nicno}</td>
                    </tr>
                    <tr>
                      <th>Vehicle No</th>
                      <td>{activeReservation.vehicle_id}</td>
                    </tr>
                    <tr>
                      <th>Service</th>
                      <td>{activeReservation.service_name}</td>
                    </tr>
                    <tr>
                      <th>Invoice Date</th>
                      <td>
                        {activeReservation.created_datetime
                          ? new Date(activeReservation.end_date)
                              .toISOString()
                              .split("T")[0]
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <th>Payment</th>
                      <td colSpan="2" className="p-0">
                        <table className="table mb-0">
                          <tbody>
                            <tr>
                              <td>Service Cost</td>
                              <td>{activeReservation.service_cost}</td>
                            </tr>
                            <tr>
                              <td>Discount</td>
                              <td>{activeReservation.discount}</td>
                            </tr>
                            <tr>
                              <td>Final Amount</td>
                              <td>{activeReservation.final_amount}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <th>Payment Method</th>
                      <td>{activeReservation.payment_method || "Pending"}</td>
                    </tr>
                    <tr>
                      <th>Card Holder Name</th>
                      <td>{activeReservation.card_holder_name || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Card No</th>
                      <td>{activeReservation.card_no || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Card Expiry</th>
                      <td>{activeReservation.card_expiry || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Payment;
