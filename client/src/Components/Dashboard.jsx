import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaTools,
  FaClipboardList,
  FaCalendar,
} from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./styles/Dashboard.css";
import { useUser } from "../Context/UserContext";

const Dashboard = () => {
  const { user } = useUser();
  // Sample notifications
  const notifications = [
    {
      id: 1,
      message: "Reminder: Your vehicle is due for an oil change in 3 days.",
      type: "reminder",
    },
    {
      id: 2,
      message: "Special Offer: 20% off on all tire services this week!",
      type: "offer",
    },
    {
      id: 3,
      message: "Important: Your last service invoice is pending payment.",
      type: "alert",
    },
  ];

  const [events, setEvents] = useState([]);

  const [pendingServices, setPendingServices] = useState(0);
  const [ongoingServices, setOngoingServices] = useState(0);
  useEffect(() => {
    const loadReservations = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/v1/user/loadAllUserReservations",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Normalize date to 'YYYY-MM-DD'
            var countPending = 0;
            var countOngoing = 0;
            const formattedEvents = data.reduce((acc, item) => {
              const date = item.reserve_date.split("T")[0];
              const title =
                item.vehicle_id +
                  " " +
                  item.service_name +
                  " at " +
                  item.start_time || "Reserved";
              if (item.status_name === "Pending") {
                countPending++;
              }
              if (item.status_name === "Ongoing") {
                countOngoing++;
              }
              const existingEvent = acc.find((event) => event.date === date);
              if (existingEvent) {
                existingEvent.title += `, ${title}`;
              } else {
                acc.push({ date, title });
              }
              return acc;
            }, []);

            setEvents(formattedEvents);
            setPendingServices(countPending);
            setOngoingServices(countOngoing);
          }
        }
      } catch (error) {
        console.error("Error loading reservations:", error);
      }
    };
    loadReservations();
  }, []);

  // const events = [
  //   { date: "2025-04-20", title: "Oil Change Appointment" },
  //   { date: "2025-04-22", title: "Tire Replacement" },
  //   { date: "2025-04-25", title: "Brake Inspection" },
  // ];

  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const isEventDay = (date) => {
    return events.some((event) => event.date === formatDate(date));
  };

  const handleDateClick = (date) => {
    const event = events.find((event) => event.date === formatDate(date));
    if (event) {
      setSelectedEvent(event);
    } else {
      setSelectedEvent(null); // clear previous event
    }
  };

  return (
    <div className="container pt-3 pb-4" style={{ backgroundColor: "#f4f4f4" }}>
      <div className="row g-4 mb-3">
        {/* Account Info Card */}
        <div className="col-md-4">
          <div className="card bg-secondary text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaUserCircle size={32} />
                <h5 className="card-title">Account information</h5>
              </div>
              <p className="mb-2">
                <strong>Name:</strong>{" "}
                {user ? user.fname + " " + user.lname : "N/A"}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {user ? user.email : "N/A"}
              </p>
              <p className="mb-0">
                <strong>Mobile:</strong> {user ? "+94" + user.mobile : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Ongoing Services Card */}
        <div className="col-md-4">
          <div className="card text-white bg-primary h-100">
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
              <FaTools size={32} className="mb-2" />
              <h5 className="card-title">Ongoing Services</h5>
              <h1 className="display-4">{ongoingServices}</h1>
            </div>
          </div>
        </div>

        {/* Pending Reservations Card */}
        <div className="col-md-4">
          <div className="card text-white bg-warning h-100">
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
              <FaClipboardList size={32} className="mb-2" />
              <h5 className="card-title">Pending Reservations</h5>
              <h1 className="display-4">{pendingServices}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5>Service Status Overview</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Service ID</th>
                      <th scope="col" style={{ width: "30%" }}>
                        Progress
                      </th>
                      <th scope="col">Status</th>
                      <th scope="col">Time Remaining</th>
                      <th scope="col">More Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#SRV001</td>
                      <td>
                        <div className="progress" style={{ height: "20px" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: "70%" }}
                            aria-valuenow="70"
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            70%
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          In Progress
                        </span>
                      </td>
                      <td>1h 45m</td>
                      <td>
                        <button className="btn btn-sm btn-primary">
                          More Info
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td>#SRV002</td>
                      <td>
                        <div className="progress" style={{ height: "20px" }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: "100%" }}
                            aria-valuenow="100"
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            100%
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-success">Completed</span>
                      </td>
                      <td>--</td>
                      <td>
                        <button className="btn btn-sm btn-primary">
                          More Info
                        </button>
                      </td>
                    </tr>
                    {/* Add more rows dynamically if needed */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-2">
        {/* Calendar Widget with Events */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <FaCalendar size={20} className="me-2" />
              <span>
                <h6>Service Calendar</h6>
              </span>
            </div>
            <div className="card-body">
              <Calendar
                className="custom-calendar"
                onChange={setDate}
                value={date}
                tileClassName={({ date }) =>
                  isEventDay(date) ? "event-day" : null
                }
                onClickDay={handleDateClick}
              />
              {selectedEvent && (
                <div className="alert alert-info mt-3">
                  <strong>Event Details:</strong> {selectedEvent.title}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <FaBell size={20} className="me-2" />
              <span>
                <h6>Important Notifications</h6>
              </span>
            </div>
            <div className="card-body">
              {notifications.length === 0 ? (
                <p>No new notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`alert alert-${
                      notification.type === "reminder"
                        ? "info"
                        : notification.type === "offer"
                        ? "success"
                        : "danger"
                    }`}
                    role="alert"
                  >
                    {notification.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
