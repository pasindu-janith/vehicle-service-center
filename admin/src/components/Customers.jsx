import { useEffect } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
const Customers = () => {
  useEffect(() => {
    const $table = $("#example2");

    // Initialize the DataTable only if it's not already initialized
    if (!$.fn.DataTable.isDataTable($table)) {
      const table = $table.DataTable({
        paging: true,
        lengthChange: false,
        searching: true,
        ordering: false,
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
                <form action="">
                  <div className="input-group">
                    <input
                      type="search"
                      className="form-control form-control-md"
                      placeholder="Type your keywords here"
                    />
                    <div className="input-group-append">
                      <button type="submit" className="btn btn-md btn-default">
                        <i className="fa fa-search" />
                      </button>
                    </div>
                  </div>
                </form>

                <table
                  id="example2"
                  className="table table-bordered table-hover"
                >
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Name</th>
                      <th>NIC</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Trident</td>
                      <td>Internet Explorer 4.0</td>
                      <td>Win 95+</td>
                      <td>
                        <button className="btn btn-primary">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Trident</td>
                      <td>Internet Explorer 5.0</td>
                      <td>Win 95+</td>
                      <td>
                        <button className="btn btn-primary">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Trident</td>
                      <td>Internet Explorer 5.5</td>
                      <td>Win 95+</td>
                      <td>
                        <button className="btn btn-primary">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Trident</td>
                      <td>Internet Explorer 6</td>
                      <td>Win 98+</td>
                      <td>
                        <button className="btn btn-primary">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Trident</td>
                      <td>Internet Explorer 7</td>
                      <td>Win XP SP2+</td>
                      <td>
                        <button className="btn btn-primary">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Trident</td>
                      <td>AOL browser (AOL desktop)</td>
                      <td>Win XP</td>
                      <td>
                        <button className="btn btn-primary">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Firefox 1.0</td>
                      <td>Win 98+ / OSX.2+</td>
                      <td>
                        <button className="btn btn-primary">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Firefox 1.5</td>
                      <td>Win 98+ / OSX.2+</td>
                      <td>
                        <button className="btn btn-primary">View</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Firefox 2.0</td>
                      <td>Win 98+ / OSX.2+</td>
                      <td>
                        <button className="btn btn-primary">View</button>
                      </td>
                    </tr>
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
                        <label htmlFor="exampleInputEmail1">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          placeholder="Saman"
                        />
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          placeholder="Perera"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">NIC</label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputPassword1"
                      placeholder="2002200022002"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">
                      Address Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputPassword1"
                      placeholder="315/A/1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Street</label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputPassword1"
                      placeholder="School Lane"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">City</label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputPassword1"
                      placeholder="Mahara"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="exampleInputEmail1"
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Mobile No</label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputPassword1"
                      placeholder="+94702686207"
                    />
                  </div>
                  <label>Registered Since: 2023/04/13</label>
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
                      <th scope="col">Vehicle Number</th>
                      <th scope="col">Type</th>
                      <th scope="col">Color</th>
                      <th scope="col">Model</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                      <td><button className="btn btn-primary">View</button></td>
                    </tr>
                    <tr>
                      <td>1</td>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                      <td><button className="btn btn-primary">View</button></td>
                    </tr>
                    <tr>
                      <td>1</td>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                      <td><button className="btn btn-primary">View</button></td>
                    </tr>
                    <tr>
                      <td>1</td>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                      <td><button className="btn btn-primary">View</button></td>
                    </tr>
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
