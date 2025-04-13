import React, { useEffect, useState } from "react";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-responsive-dt";
import "datatables.net-buttons-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css"; // Required for the clock UI
import "./styles/datetime.css";
const Reservations = () => {
  const [startDateTime, setStartDateTime] = useState();
  const [endDateTime, setEndDateTime] = useState();
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
              <div className="card-header bg-secondary">
                <h4>Service Reservations</h4>
              </div>
              {/* /.card-header */}
              <div className="card-body">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Filters</h3>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 col-12">
                        <label htmlFor="">Vehicle Number</label>
                        <input type="text" className="form-control" />
                      </div>
                      <div className="col-md-6 col-12">
                        <div className="form-group">
                          <label htmlFor="exampleFormControlSelect1">
                            Vehicle type
                          </label>
                          <select
                            className="form-control"
                            id="exampleFormControlSelect1"
                          >
                            <option>All</option>
                            <option>1-Car</option>
                            <option>2-Van</option>
                            <option>3-Lorry</option>
                            <option>4-Bike</option>
                            <option>5-Jeep</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4 pt-3">
                        <label>Start Date-Time:</label>
                        <DateTimePicker
                          onChange={setStartDateTime}
                          value={startDateTime}
                          className="datetimepick col-md-8 col-12"
                        />
                      </div>
                      <div className="col-md-4 pt-3">
                        <label>End Date-Time:</label>
                        <DateTimePicker
                          onChange={setEndDateTime}
                          value={endDateTime}
                          minDate={startDateTime}
                          className="datetimepick col-md-8 col-12"
                        />
                      </div>
                      <div className="col-md-4 d-flex justify-content-end">
                        <button className="btn btn-primary mt-3">Filter</button>
                      </div>
                    </div>
                  </div>
                </div>
                <table
                  id="example2"
                  className="table table-bordered table-hover"
                >
                  <thead>
                    <tr>
                      <th>Service ID</th>
                      <th>Vehicle No</th>
                      <th>Time start</th>
                      <th>Time due</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Trident</td>
                      <td>Internet Explorer 4.0</td>
                      <td>Win 95+</td>
                      <td> 4</td>
                      <td>X</td>
                    </tr>
                    <tr>
                      <td>Trident</td>
                      <td>Internet Explorer 5.0</td>
                      <td>Win 95+</td>
                      <td>5</td>
                      <td>C</td>
                    </tr>
                    <tr>
                      <td>Trident</td>
                      <td>Internet Explorer 5.5</td>
                      <td>Win 95+</td>
                      <td>5.5</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Trident</td>
                      <td>Internet Explorer 6</td>
                      <td>Win 98+</td>
                      <td>6</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Trident</td>
                      <td>Internet Explorer 7</td>
                      <td>Win XP SP2+</td>
                      <td>7</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Trident</td>
                      <td>AOL browser (AOL desktop)</td>
                      <td>Win XP</td>
                      <td>6</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Firefox 1.0</td>
                      <td>Win 98+ / OSX.2+</td>
                      <td>1.7</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Firefox 1.5</td>
                      <td>Win 98+ / OSX.2+</td>
                      <td>1.8</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Firefox 2.0</td>
                      <td>Win 98+ / OSX.2+</td>
                      <td>1.8</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Firefox 3.0</td>
                      <td>Win 2k+ / OSX.3+</td>
                      <td>1.9</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Camino 1.0</td>
                      <td>OSX.2+</td>
                      <td>1.8</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Camino 1.5</td>
                      <td>OSX.3+</td>
                      <td>1.8</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Netscape 7.2</td>
                      <td>Win 95+ / Mac OS 8.6-9.2</td>
                      <td>1.7</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Netscape Browser 8</td>
                      <td>Win 98SE+</td>
                      <td>1.7</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Netscape Navigator 9</td>
                      <td>Win 98+ / OSX.2+</td>
                      <td>1.8</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Mozilla 1.0</td>
                      <td>Win 95+ / OSX.1+</td>
                      <td>1</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Mozilla 1.1</td>
                      <td>Win 95+ / OSX.1+</td>
                      <td>1.1</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Mozilla 1.2</td>
                      <td>Win 95+ / OSX.1+</td>
                      <td>1.2</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Mozilla 1.3</td>
                      <td>Win 95+ / OSX.1+</td>
                      <td>1.3</td>
                      <td>A</td>
                    </tr>
                    <tr>
                      <td>Gecko</td>
                      <td>Mozilla 1.4</td>
                      <td>Win 95+ / OSX.1+</td>
                      <td>1.4</td>
                      <td>A</td>
                    </tr>
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

export default Reservations;
