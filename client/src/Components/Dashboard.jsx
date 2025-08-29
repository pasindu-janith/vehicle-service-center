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
} from "react-icons/fa";
import { MdDashboard, MdNotifications,MdInfoOutline} from "react-icons/md";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./styles/Dashboard.css";
import { useUser } from "../Context/UserContext";
import { motion } from "framer-motion";
import BASE_URL from "../config.js";
import OngoingReservationsTable from "./OngoingReservationsTable.jsx";

const Dashboard = () => {
  const { user } = useUser();

  // Sample notifications with enhanced styling
  const [notifications, setNotifications] = useState([]);

  const [events, setEvents] = useState([]);
  const [pendingServices, setPendingServices] = useState(0);
  const [ongoingServices, setOngoingServices] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [inProgress, setInProgress] = useState(null); // State to hold ongoing reservations
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setIsLoading(true);
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
            let ongoingList = [];
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
              if (item.status_name === "Ongoing") {
                ongoingList.push(item); // Collect ongoing reservation
                countOngoing++;
              }
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
            setInProgress(ongoingList); // Update state with ongoing reservations
          }
        }
      } catch (error) {
        console.error("Error loading reservations:", error);
      } finally {
        setIsLoading(false);
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
      case "Reminder":
        return FaClock;
      case "Offer":
        return FaGift;
      case "Alert":
        return FaExclamationTriangle;
      default:
        return FaBell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "Reminder":
        return "primary";
      case "Offer":
        return "success";
      case "Alert":
        return "danger";
      default:
        return "secondary";
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/loadDashboardNotifications?today=${
            new Date().toISOString().split("T")[0]
          }`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          // Process notifications data if needed
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);
  return (
    <div
      className="container px-4 py-4 bg-transparent"
      style={{ minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="row mb-2">
        <div className="col-12">
          <div className="d-flex align-items-center mb-3">
            <MdDashboard className="text-darkblue me-3" size={40} />
            <div>
              <h1
                className="fw-bold text-dark mb-1 main-title"
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
                className="position-absolute top-0 end-0 m-3 opacity-75 icon"
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
                <FaTools size={40} className="icon mb-2" />
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
                <FaClipboardList size={40} className="icon mb-2" />
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
                <FaCheckCircle size={40} className="icon mb-2" />
              </div>
              <h6 className="card-title mb-2">Completed</h6>
              <h2 className="display-5 fw-bold mb-0">{completedServices}</h2>
            </div>
          </div>
        </div>

        {/* Total Services Card */}
        <div className="col-lg-2 col-md-6">
          <div className="card border-0 shadow-sm h-100 bg-info text-white">
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-4">
              <div className="mb-3">
                <FaChartLine size={40} className="icon mb-2" />
              </div>
              <h6 className="card-title mb-2">Total Services</h6>
              <h2 className="display-5 fw-bold mb-0">
                {pendingServices + ongoingServices + completedServices}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Service Status Table */}
      <div className="row mb-4">
        <div className="col-12">
          {!isLoading ? (
            inProgress && inProgress.length > 0 ? (
              <OngoingReservationsTable ongoing={inProgress} />
            ) : (
              <div
                className="card d-flex justify-content-center align-items-center py-4"
              >
                <MdInfoOutline className="text-muted mb-3" size={50} />
                <h5 className="text-muted mb-0">
                  You have no ongoing services at the moment.
                </h5>
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => (window.location.href = "/myaccount/add-reservation")}
                >
                  Book a Service
                </button>
              </div>
            )
          ) : (
            <div
              className="card d-flex justify-content-center align-items-center"
              style={{ height: "150px" }}
            >
              <div
                className="spinner-grow text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="text-muted mt-3">Loading your progress...</h5>
            </div>
          )}
        </div>
      </div>

      {/* Calendar and Notifications Row */}
      <div className="row g-4">
        {/* Calendar Widget */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
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
            <div className="card-header bg-white border-bottom py-3">
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
                <div
                  className="notification-list"
                  style={{
                    maxHeight: "400px",
                    overflowX: "hidden",
                    overflowY: "visible",
                  }}
                >
                  {notifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(
                      notification.type_name
                    );
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`alert alert-${getNotificationColor(
                          notification.type_name
                        )} border-0 mb-3`}
                      >
                        <div className="d-flex align-items-start">
                          <IconComponent
                            className={`text-${getNotificationColor(
                              notification.type_name
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
