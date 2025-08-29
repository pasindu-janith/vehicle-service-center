import { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { BASE_URL } from "../config.js";

const Dashboard = () => {
  const [pendingReservationsToday, setPendingReservationsToday] = useState(0);
  const [pendingReservationsAll, setPendingReservationsAll] = useState(0);
  const [startedServicesToday, setStartedServicesToday] = useState(0);
  const [completedReservations, setCompletedReservations] = useState(0);
  const [ongoingReservations, setOngoingReservations] = useState(0);
  const [paymentsDoneToday, setPaymentsDoneToday] = useState(0);
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [donutData, setDonutData] = useState(null);
  const [donutDataOngoing, setDonutDataOngoing] = useState(null);
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

  const loadPendingServicesCounts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/loadPendingServicesCounts`);
      if (response.ok) {
        const jsonData = await response.json();
        if (jsonData) {
          const donutDataPending = {
            labels: jsonData.pendingServices.map(
              (service) => service.service_name
            ),
            datasets: [
              {
                data: jsonData.pendingServices.map((service) =>
                  Number(service.pending_count)
                ),
                backgroundColor: [
                  "#f56954",
                  "#00a65a",
                  "#f39c12",
                  "#00c0ef",
                  "#3c8dbc",
                  "#d2d6de",
                  "#9b59b6",
                  "#16a085",
                  "#e74c3c",
                  "#2ecc71",
                ].slice(0, jsonData.pendingServices.length),
              },
            ],
          };

          const donutDataOngoing = {
            labels: jsonData.ongoingServices.map(
              (service) => service.service_name
            ),
            datasets: [
              {
                data: jsonData.ongoingServices.map((service) =>
                  Number(service.ongoing_count)
                ),
                backgroundColor: [
                  "#f56954",
                  "#00a65a",
                  "#f39c12",
                  "#00c0ef",
                  "#3c8dbc",
                  "#d2d6de",
                  "#9b59b6",
                  "#16a085",
                  "#e74c3c",
                  "#2ecc71",
                ].slice(0, jsonData.ongoingServices.length),
              },
            ],
          };

          setDonutData(donutDataPending);
          setDonutDataOngoing(donutDataOngoing);
          console.log("Pending Services Data:", donutDataPending);
          console.log("Ongoing Services Data:", donutDataOngoing);
        } else {
          console.error("No data received for services");
        }
      } else {
        console.error("Failed to fetch pending/ongoing services counts");
      }
    } catch (error) {
      console.error("Error initializing donut chart:", error);
    }
  };

  useEffect(() => {
    // Fetch pending services first
    loadPendingServicesCounts();
  }, []);
  useEffect(() => {
    if (!donutData || !donutDataOngoing) return;

    const canvasPending = document.getElementById("donutChart");
    const canvasOngoing = document.getElementById("donutChart1");
    if (!canvasPending || !canvasOngoing) return;

    const ctxPending = canvasPending.getContext("2d");
    const ctxOngoing = canvasOngoing.getContext("2d");

    const donutOptions = {
      maintainAspectRatio: false,
      responsive: true,
    };

    // Create both charts
    const pendingChart = new Chart(ctxPending, {
      type: "doughnut",
      data: donutData,
      options: donutOptions,
    });

    const ongoingChart = new Chart(ctxOngoing, {
      type: "doughnut",
      data: donutDataOngoing,
      options: donutOptions,
    });

    // Cleanup both
    return () => {
      pendingChart.destroy();
      ongoingChart.destroy();
    };
  }, [donutData, donutDataOngoing]);

  useEffect(() => {
    const canvas = document.getElementById("barChart");
    if (!canvas) return;
    const barChartCanvas = canvas.getContext("2d");

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

    const barChart = new Chart(barChartCanvas, {
      type: "bar",
      data: barChartData,
      options: barChartOptions,
    });

    return () => {
      barChart.destroy();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadDashboardCounts`);
        if (response.ok) {
          const jsonData = await response.json();
          if (jsonData) {
            setPendingReservationsToday(jsonData.pendingToday);
            setPendingReservationsAll(jsonData.pending);
            setStartedServicesToday(jsonData.startedToday);
            setCompletedReservations(jsonData.completed);
            setOngoingReservations(jsonData.ongoing);
            setRegisteredUsers(jsonData.registeredUsers);
            setPaymentsDoneToday(jsonData.todayPayments);
          } else {
            console.error("No data received");
          }
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
                  <h3>{pendingReservationsToday}</h3>
                  <p>Pending Reservations (Today)</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{pendingReservationsAll}</h3>
                  <p>Pending Reservations(All)</p>
                </div>
              </div>
            </div>
            {/* ./col */}
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{completedReservations}</h3>
                  <p>Completed Reservations (Today)</p>
                </div>
              </div>
            </div>
            {/* ./col */}
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{ongoingReservations}</h3>
                  <p>Ongoing Reservations(All)</p>
                </div>
              </div>
            </div>
            {/* ./col */}
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{startedServicesToday}</h3>
                  <p>Stared Services(Today)</p>
                </div>
              </div>
            </div>

            {/* ./col */}
            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{paymentsDoneToday}</h3>
                  <p>Payments Done(Today)</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-6">
              {/* small box */}
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{registeredUsers}</h3>
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
              {/* DONUT CHART */}
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Ongoing Services</h3>
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
                    id="donutChart1"
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
            <div className="col-md-6">
              {/* DONUT CHART */}
              <div className="card card-primary">
                <div className="card-header">
                  <h3 className="card-title">Pending Services</h3>
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
