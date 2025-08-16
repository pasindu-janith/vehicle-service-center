import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import { BASE_URL } from "../config.js";

const Customers = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const tableRef = useRef(null);
  const dtInstance = useRef(null); // To store the DataTable instance

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/loadAllCustomers`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const jsonData = await response.json();
          setTableData(jsonData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadCustomerVehicles = async (userID) => {
    try {
      const response = await fetch(
        `${BASE_URL}/loadCustomerVehicles?customerId=` +
          userID
      );
      if (response.ok) {
        const jsonData = await response.json();
        setCustomerVehicles(jsonData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only initialize or reinitialize DataTables if data is loaded
    if (!loading && tableData.length > 0) {
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
  }, [tableData, loading]); // Re-run only when data is updated

  return (
    <div className="content">
      <div className="container-fluid pt-3">
        <h3>Customers</h3>
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Customer search</h3>
                <div className="card-tools">
                  <button
                    type="button"
                    className="btn btn-tool"
                    data-card-widget="collapse"
                  >
                    <i className="fas fa-minus" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-tool"
                    data-card-widget="remove"
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>
              </div>

              {/* /.card-header */}
              <div className="card-body">
                <table
                  id="example2"
                  ref={tableRef}
                  className="table table-bordered table-hover"
                >
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Name</th>
                      <th>NIC</th>
                      <th>More</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length > 0 ? (
                      tableData.map((row) => (
                        <tr key={row.user_id}>
                          <td>{row.user_id}</td>
                          <td>{row.first_name + " " + row.last_name}</td>
                          <td>{row.nicno}</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedCustomer(row);
                                loadCustomerVehicles(row.user_id);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No ongoing services found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* /.card-body */}
            </div>
            {/* /.card */}
          </div>
          <div className="col-md-6">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Customer Details</h3>
              </div>
              {/* /.card-header */}
              {/* form start */}
              <form>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 col-12">
                      <div className="form-group">
                        <label htmlFor="fname">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="fname"
                          value={selectedCustomer?.first_name || ""}
                          placeholder="Saman"
                        />
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <div className="form-group">
                        <label htmlFor="lname">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="lname"
                          value={selectedCustomer?.last_name || ""}
                          placeholder="Perera"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="nicno">NIC</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nicno"
                      value={selectedCustomer?.nicno || ""}
                      placeholder="2002200022002"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="addressNumber">Address Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="addressNumber"
                      value={selectedCustomer?.address_line1 || ""}
                      placeholder="315/A/1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="street">Street</label>
                    <input
                      type="text"
                      className="form-control"
                      id="street"
                      value={selectedCustomer?.address_line2 || ""}
                      placeholder="School Lane"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      value={selectedCustomer?.address_line3 || ""}
                      placeholder="Mahara"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={selectedCustomer?.email || ""}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobNumber">Mobile No</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedCustomer?.mobile_no || ""}
                      id="mobNumber"
                      placeholder="+94702686207"
                    />
                  </div>
                  <label>
                    Registered Since:{" "}
                    {selectedCustomer?.registered_date.split("T")[0] || "N/A"}
                  </label>
                </div>
                {/* /.card-body */}
                <div className="card-footer">
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            </div>
            {/* /.card */}
          </div>
          <div className="container">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Customer's Vehicles</h3>
              </div>
              <div className="card-body">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Vehicle No.</th>
                      <th scope="col">Brand</th>
                      <th scope="col">Model</th>
                      <th scope="col">Type</th>
                      <th scope="col">Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerVehicles.length > 0 ? (
                      customerVehicles.map((vehicle) => (
                        <tr key={vehicle.license_plate}>
                          <td>{vehicle.license_plate}</td>
                          <td>{vehicle.vehicle_brand}</td>
                          <td>{vehicle.model}</td>
                          <td>{vehicle.vehicle_type}</td>
                          <td>{vehicle.color}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No vehicles found for this customer.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
