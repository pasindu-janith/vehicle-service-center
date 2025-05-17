import { useEffect } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";

const Payment = () => {
  useEffect(() => {
    const $table = $("#example2");

    // Initialize the DataTable only if it's not already initialized
    if (!$.fn.DataTable.isDataTable($table)) {
      const table = $table.DataTable({
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: true,
        info: true,
        autoWidth: false,
        responsive: true,
      });
    }

    // Cleanup: Destroy only the DataTable instance, not the table element
    return () => {
      if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().destroy();
      }
    };
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
                >
                  <thead>
                    <tr>
                      <th>Service ID</th>
                      <th>Vehicle No</th>
                      <th>Service Name</th>
                      <th>Service Date</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th>Payment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>ABC123</td>
                      <td>Oil Change</td>
                      <td>2023-10-01</td>
                      <td>$50.00</td>
                      <td>Paid</td>
                      <td>Credit Card</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>XYZ456</td>
                      <td>Tire Rotation</td>
                      <td>2023-10-02</td>
                      <td>$30.00</td>
                      <td>Pending</td>
                      <td>Cash</td>
                    </tr>
                    {/* Add more rows as needed */}
                  </tbody>
                </table>
              </div>
              {/* /.card-body */}
            </div>
            {/* /.card */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Payment;
