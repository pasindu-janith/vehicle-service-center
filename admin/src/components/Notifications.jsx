import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { BASE_URL } from "../config.js";

const Notifications = () => {
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  useEffect(() => {
    const fetchNotificationTypes = async () => {
      try {
        const response = await fetch(`${BASE_URL}/loadNotificationTypes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotificationTypes(data);
        } else {
          console.error("Failed to fetch notification types");
        }
      } catch (error) {
        console.error("Error fetching notification types:", error);
      }
    };
    fetchNotificationTypes();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message || !startDate || !endDate) {
      alert("Please fill in all fields");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/sendNotification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: document.getElementById("notifType").value,
          startDate,
          endDate,
          message,
        }),
      });
      if (response.ok) {
        alert("Notification sent successfully");
      } else {
        console.error("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  return (
    <section className="content pt-2">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-info">
                <h4>Common Notifications</h4>
              </div>
              {/* /.card-header */}
              <div className="card-body">
                <p>Send new notification to all users</p>
                {/* Inline Row */}
                <form className="d-md-flex justify-content-between mb-3">
                  {/* Notification Type */}
                  <div className="form-group col-md-3 mr-3">
                    <label htmlFor="notifType" className="mr-2">
                      Type
                    </label>
                    <select id="notifType" className="form-control">
                      {notificationTypes.map((type) => (
                        <option
                          key={type.notification_type_id}
                          value={type.notification_type_id}
                        >
                          {type.type_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="form-group col-md-3 mr-3">
                    <label htmlFor="startDate" className="mr-2">
                      Start
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      className="form-control"
                    />
                  </div>

                  {/* End Date */}
                  <div className="form-group col-md-3 mr-3">
                    <label htmlFor="endDate" className="mr-2">
                      End
                    </label>
                    <input type="date" id="endDate" className="form-control" />
                  </div>
                </form>

                {/* Message */}
                <div className="form-group mb-3">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    className="form-control"
                    placeholder="Enter message"
                    rows="3"
                  />
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn btn-primary">
                  Send
                </button>
              </div>
            </div>
            {/* /.card */}
          </div>
        </div>
      </div>
    </section>
=======

const Notifications = () => {
  
  return (
   <div></div>
>>>>>>> 3a4beb09bf377ff440cbfef26f7c3a6f1518ee5b
  );
};

export default Notifications;
