import React, { useEffect } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import images from "../assets/assets";
const Vehicle = () => {
  useEffect(() => {
    const $table = $("#example2");
    const $table1 = $("#example1");

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
    if (!$.fn.DataTable.isDataTable($table1)) {
      const table1 = $table1.DataTable({
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
      if ($.fn.DataTable.isDataTable($table1)) {
        $table1.DataTable().destroy();
      }
    };
  }, []);
  return (
    <div className="content">
      <div className="container-fluid pt-3">
        <h3>Vehicle</h3>
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Vehicles search</h3>
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
                <h3 className="card-title">Vehicle Details</h3>
              </div>
              {/* /.card-header */}
              {/* form start */}
              <form>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-7 col-12">
                      <img src={images.car} className="col-12" />
                    </div>
                    <div className="col-md-5">
                      <div className="form-group">
                        <label htmlFor="vehicleno">Vehicle Number</label>
                        <input
                          type="text"
                          className="form-control"
                          id="vehicleno"
                          name="vehicleno"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Type</label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="brand">Brand</label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Model</label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputPassword1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Color</label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputPassword1"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">
                      Manufacture year
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputPassword1"
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="brand">Transmission</label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="brand">Fuel</label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* /.card-body */}
                <div className="card-footer">
                  <button type="reset" className="btn btn-primary">
                    Reset
                  </button>
                </div>
              </form>
            </div>
            {/* /.card */}
          </div>
          <div className="container">
            <div className="card">
              <div className="card-header bg-primary">Owner Details</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <img src={images.profile} className="col-12" />
                  </div>
                  <div className="col-md-9">
                    <table className="table">
                      <tr>
                        <td>Full Name</td>
                        <td>John Doe</td>
                      </tr>

                      <tr>
                        <td>NIC</td>
                        <td>2002200022002</td>
                      </tr>
                      <tr>
                        <td>Mobile Number</td>
                        <td>0775654433</td>
                      </tr>
                      <tr>
                        <td>Address</td>
                        <td>315/A/1, School Lane, Mahara</td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container-fluid">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Service Records</h3>
              </div>
              <div className="card-body">
                <table
                  id="example1"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicle;
