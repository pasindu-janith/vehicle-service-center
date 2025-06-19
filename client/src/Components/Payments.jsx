import React from "react";

export const Payments = () => {
  return (
    <div
      className="container pt-3 bg-transparent"
      style={{ minHeight: "100vh" }}
    >
      <h1>Payments To Do</h1>
      <div className="card">
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Res ID</th>
                <th scope="col">Service</th>
                <th scope="col">Date</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>John Doe</td>
                <td>Oil Change</td>
                <td>$50</td>
                <td>Pending</td>
                <td>2024-06-10</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>Jane Smith</td>
                <td>Tire Replacement</td>
                <td>$120</td>
                <td>Paid</td>
                <td>2024-06-09</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td>Mike Johnson</td>
                <td>Brake Inspection</td>
                <td>$80</td>
                <td>Pending</td>
                <td>2024-06-08</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
