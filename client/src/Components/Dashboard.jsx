import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaTools,
  FaClipboardList,
  FaBell,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaGift,
  FaCalendarAlt,
  FaChartLine,
  FaEye,
} from "react-icons/fa";
import { MdDashboard, MdNotifications } from "react-icons/md";
import { BiTime } from "react-icons/bi";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./styles/Dashboard.css";
import { useUser } from "../Context/UserContext";
import { motion } from "framer-motion";
import BASE_URL from "../config.js";

const Dashboard = () => {
  const { user } = useUser();

  // Sample notifications with enhanced styling
  const notifications = [
    {
      id: 1,
      message: "Reminder: Your vehicle is due for an oil change in 3 days.",
      type: "reminder",
      icon: FaClock,
      time: "2 hours ago",
    },
    {
      id: 2,
      message: "Special Offer: 20% off on all tire services this week!",
      type: "offer",
      icon: FaGift,
      time: "1 day ago",
    },
    {
      id: 3,
      message: "Important: Your last service invoice is pending payment.",
      type: "alert",
      icon: FaExclamationTriangle,
      time: "3 days ago",
    },
  ];

  const [events, setEvents] = useState([]);
  const [pendingServices, setPendingServices] = useState(0);
  const [ongoingServices, setOngoingServices] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadAllUserReservations`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            var countPending = 0;
            var countOngoing = 0;
            var countCompleted = 0;

            const formattedEvents = data.reduce((acc, item) => {
              const date = item.reserve_date.split("T")[0];
              const title =
                item.vehicle_id +
                  " " +
                  item.service_name +
                  " at " +
                  new Date(`1970-01-01T${item.start_time}`).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }
                  ) || "Reserved";

              if (item.status_name === "Pending") countPending++;
              if (item.status_name === "Ongoing") countOngoing++;
              if (item.status_name === "Completed") countCompleted++;

              const existingEvent = acc.find((event) => event.date === date);
              if (existingEvent) {
                existingEvent.title += `, ${title}`;
              } else {
                acc.push({ date, title, status: item.status_name });
              }
              return acc;
            }, []);

            setEvents(formattedEvents);
            setPendingServices(countPending);
            setOngoingServices(countOngoing);
            setCompletedServices(countCompleted);
          }
        }
      } catch (error) {
        console.error("Error loading reservations:", error);
      }
    };
    loadReservations();
  }, []);

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
      setSelectedEvent(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "reminder":
        return FaClock;
      case "offer":
        return FaGift;
      case "alert":
        return FaExclamationTriangle;
      default:
        return FaBell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "reminder":
        return "primary";
      case "offer":
        return "success";
      case "alert":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div
      className="container px-4 py-4 bg-transparent"
      style={{ minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center mb-3">
            <MdDashboard className="text-primary me-3" size={40} />
            <div>
              <h1
                className="fw-bold text-dark mb-1"
                style={{ fontSize: "2.5rem" }}
              >
                Dashboard
              </h1>
              <p className="text-muted mb-0">
                Welcome back, {user ? user.fname : "User"}!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-4 mb-4">
        {/* Account Info Card */}
        <div className="col-lg-4 col-md-6">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ backgroundColor: "#0d6efd" }}
          >
            <div className="card-body text-white position-relative p-4">
              <FaUserCircle
                size={50}
                className="position-absolute top-0 end-0 m-3 opacity-75"
              />
              <div className="mb-3">
                <h5 className="card-title fw-bold mb-3">Account Information</h5>
              </div>
              <div className="mb-2">
                <small className="opacity-75">Full Name</small>
                <p className="mb-1 fw-medium">
                  {user ? `${user.fname} ${user.lname}` : "N/A"}
                </p>
              </div>
              <div className="mb-2">
                <small className="opacity-75">Email Address</small>
                <p className="mb-1 fw-medium">{user ? user.email : "N/A"}</p>
              </div>
              <div className="mb-0">
                <small className="opacity-75">Mobile Number</small>
                <p className="mb-0 fw-medium">
                  {user ? `+94${user.mobile}` : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ongoing Services Card */}
        <div className="col-lg-2 col-md-3 col-sm-6">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ backgroundColor: "#6c757d" }}
          >
            <div className="card-body text-white d-flex flex-column justify-content-center align-items-center text-center p-4">
              <div className="mb-3">
                <FaTools size={40} className="mb-2" />
              </div>
              <h6 className="card-title mb-2">Ongoing Services</h6>
              <h2 className="display-5 fw-bold mb-0">{ongoingServices}</h2>
            </div>
          </div>
        </div>

        {/* Pending Services Card */}
        <div className="col-lg-2 col-md-3 col-sm-6">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ backgroundColor: "#dc3545" }}
          >
            <div className="card-body text-white d-flex flex-column justify-content-center align-items-center text-center p-4">
              <div className="mb-3">
                <FaClipboardList size={40} className="mb-2" />
              </div>
              <h6 className="card-title mb-2">Pending Services</h6>
              <h2 className="display-5 fw-bold mb-0">{pendingServices}</h2>
            </div>
          </div>
        </div>

        {/* Completed Services Card */}
        <div className="col-lg-2 col-md-6">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ backgroundColor: "#198754" }}
          >
            <div className="card-body text-white d-flex flex-column justify-content-center align-items-center text-center p-4">
              <div className="mb-3">
                <FaCheckCircle size={40} className="mb-2" />
              </div>
              <h6 className="card-title mb-2">Completed</h6>
              <h2 className="display-5 fw-bold mb-0">{completedServices}</h2>
            </div>
          </div>
        </div>

        {/* Total Services Card */}
        <div className="col-lg-2 col-md-6">
          <div className="card border-0 shadow-sm h-100 bg-white">
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-4">
              <div className="mb-3">
                <FaChartLine size={40} className="mb-2 text-primary" />
              </div>
              <h6 className="card-title mb-2 text-dark">Total Services</h6>
              <h2 className="display-5 fw-bold mb-0 text-dark">
                {pendingServices + ongoingServices + completedServices}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Service Status Table */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex align-items-center">
                <FaChartLine className="text-primary me-2" size={20} />
                <h5 className="fw-bold mb-0 text-dark">
                  Service Status Overview
                </h5>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th scope="col" className="fw-bold text-dark px-4 py-3">
                        Service ID
                      </th>
                      <th
                        scope="col"
                        className="fw-bold text-dark py-3"
                        style={{ width: "30%" }}
                      >
                        Progress
                      </th>
                      <th scope="col" className="fw-bold text-dark py-3">
                        Status
                      </th>
                      <th scope="col" className="fw-bold text-dark py-3">
                        Time Remaining
                      </th>
                      <th scope="col" className="fw-bold text-dark py-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3">
                        <span className="fw-bold text-primary">#SRV001</span>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="progress flex-grow-1 me-2"
                            style={{ height: "8px" }}
                          >
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: "70%" }}
                              aria-valuenow="70"
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <small className="text-muted fw-medium">70%</small>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="badge bg-warning text-dark px-3 py-2">
                          In Progress
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <BiTime className="text-muted me-1" size={16} />
                          <span className="text-muted">1h 45m</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <button className="btn btn-outline-primary btn-sm">
                          <FaEye className="me-1" size={14} />
                          View Details
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <span className="fw-bold text-success">#SRV002</span>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="progress flex-grow-1 me-2"
                            style={{ height: "8px" }}
                          >
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: "100%" }}
                              aria-valuenow="100"
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <small className="text-muted fw-medium">100%</small>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="badge bg-success px-3 py-2">
                          Completed
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-muted">--</span>
                      </td>
                      <td className="py-3">
                        <button className="btn btn-outline-primary btn-sm">
                          <FaEye className="me-1" size={14} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar and Notifications Row */}
      <div className="row g-4">
        {/* Calendar Widget */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex align-items-center">
                <FaCalendarAlt className="text-primary me-2" size={20} />
                <h5 className="fw-bold mb-0 text-dark">Service Calendar</h5>
              </div>
            </div>
            <div className="card-body">
              <div className="custom-calendar-wrapper">
                <Calendar
                  className="custom-calendar w-100"
                  onChange={setDate}
                  value={date}
                  tileClassName={({ date }) =>
                    isEventDay(date) ? "event-day" : null
                  }
                  onClickDay={handleDateClick}
                />
              </div>
              {selectedEvent && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="alert alert-primary border-0 mt-3"
                  style={{ backgroundColor: "#e3f2fd" }}
                >
                  <div className="d-flex align-items-start">
                    <FaInfoCircle
                      className="text-primary me-2 mt-1"
                      size={16}
                    />
                    <div>
                      <h6 className="fw-bold text-primary mb-1">
                        Event Details
                      </h6>
                      <p className="mb-0 text-dark">{selectedEvent.title}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <MdNotifications className="text-primary me-2" size={22} />
                  <h5 className="fw-bold mb-0 text-dark">
                    Recent Notifications
                  </h5>
                </div>
                <span className="badge bg-danger rounded-pill">
                  {notifications.length}
                </span>
              </div>
            </div>
            <div className="card-body">
              {notifications.length === 0 ? (
                <div className="text-center py-4">
                  <FaBell className="text-muted mb-3" size={48} />
                  <p className="text-muted mb-0">No new notifications</p>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification, index) => {
                    const IconComponent = notification.icon;
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`alert alert-${getNotificationColor(
                          notification.type
                        )} border-0 mb-3`}
                        style={{
                          backgroundColor:
                            notification.type === "reminder"
                              ? "#e3f2fd"
                              : notification.type === "offer"
                              ? "#e8f5e8"
                              : "#ffebee",
                        }}
                      >
                        <div className="d-flex align-items-start">
                          <IconComponent
                            className={`text-${getNotificationColor(
                              notification.type
                            )} me-3 mt-1`}
                            size={18}
                          />
                          <div className="flex-grow-1">
                            <p className="mb-1 text-dark">
                              {notification.message}
                            </p>
                            
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
