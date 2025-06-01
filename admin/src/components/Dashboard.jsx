import { useEffect, useState } from "react";
import Chart from "chart.js/auto";

const Dashboard = () => {
  const [pendingReservationsToday, setPendingReservationsToday] = useState(0);
  const [completedReservations, setCompletedReservations] = useState(0);
  const [ongoingReservations, setOngoingReservations] = useState(0);

  const getPreviousDates = (numDays) => {
    const dates = [];
    const today = new Date();

    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Format the date as "MMM DD"
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      dates.push(formattedDate);
    }

    return dates;
  };

  useEffect(() => {
    // Get the canvas element for the bar chart
    const canvas = document.getElementById("barChart");
    const barChartCanvas = canvas.getContext("2d");

    // Bar chart data
    const barChartData = {
      labels: getPreviousDates(10),
      datasets: [
        {
          label: "Started",
          backgroundColor: "rgba(60,141,188,0.9)",
          borderColor: "rgba(60,141,188,0.8)",
          data: [28, 48, 40, 19, 86, 27, 90, 50, 70, 30],
        },
        {
          label: "Completed",
          backgroundColor: "rgba(210,214,222,1)",
          borderColor: "rgba(210,214,222,1)",
          data: [65, 59, 80, 81, 56, 55, 40, 30, 20, 10],
        },
      ],
    };

    const canvas2 = document.getElementById("donutChart");
    const donutChartCanvas = canvas2.getContext("2d");

    const donutData = {
      labels: [
        "Washing",
        "Repair",
        "Tyre",
        "Interior",
        "Oil service",
        "Tune up",
      ],
      datasets: [
        {
          data: [700, 500, 400, 600, 300, 100],
          backgroundColor: [
            "#f56954",
            "#00a65a",
            "#f39c12",
            "#00c0ef",
            "#3c8dbc",
            "#d2d6de",
          ],
        },
      ],
    };
    var donutOptions = {
      maintainAspectRatio: false,
      responsive: true,
    };

    // Bar chart options
    const barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        x: {
          stacked: false,
        },
        y: {
          stacked: false,
          beginAtZero: true,
        },
      },
    };

    // Create a chart instance
    let barChart = new Chart(barChartCanvas, {
      type: "bar",
      data: barChartData,
      options: barChartOptions,
    });

    //Create pie or douhnut chart
    // You can switch between pie and douhnut using the method below.
    let donutChart = new Chart(donutChartCanvas, {
      type: "doughnut",
      data: donutData,
      options: donutOptions,
    });

    // Cleanup: Destroy the chart instance when the component unmounts or re-renders
    return () => {
      if (barChart) {
        barChart.destroy();
      }
      if (donutChart) {
        donutChart.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/admin/loadAllReservations"
        );
        if (response.ok) {
          const jsonData = await response.json();
          // setTableData(jsonData); // Uncomment and define setTableData if needed
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        // setLoading(false); // Uncomment and define setLoading if needed
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Dashboard</h1>
            </div>
            {/* /.col */}

            {/* /.col */}
          </div>
          {/* /.row */}
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>150</h3>
                  <p>Pending Reservations (Today)</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>150</h3>
                  <p>Pending Reservations(All)</p>
                </div>
              </div>
            </div>
            {/* ./col */}
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>12</h3>
                  <p>Completed Reservations (Today)</p>
                </div>
              </div>
            </div>
            {/* ./col */}
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>44</h3>
                  <p>Ongoing Reservations(All)</p>
                </div>
              </div>
            </div>
            {/* ./col */}
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>150</h3>
                  <p>Stared Services(Today)</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>
                    53<sup style={{ fontSize: 20 }}>%</sup>
                  </h3>
                  <p>Working rate (Current)</p>
                </div>
              </div>
            </div>
            {/* ./col */}

            {/* ./col */}
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>150</h3>
                  <p>Payments Done(Today)</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>150</h3>
                  <p>Registered Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* BAR CHART */}
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Service Order Progress</h3>
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
                <div className="card-body">
                  <div className="chart">
                    <canvas
                      id="barChart"
                      style={{
                        minHeight: 250,
                        height: 250,
                        maxHeight: 250,
                        maxWidth: "100%",
                      }}
                    />
                  </div>
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
            </div>
            <div className="col-md-6">
              {/* DONUT CHART */}
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Donut Chart</h3>
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
                <div className="card-body">
                  <canvas
                    id="donutChart"
                    style={{
                      minHeight: 250,
                      height: 250,
                      maxHeight: 250,
                      maxWidth: "100%",
                    }}
                  />
                </div>
                {/* /.card-body */}
              </div>
              {/* /.card */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
