import React, { useState, useEffect } from "react";
import { BASE_URL } from "../config.js";
import toastr from "toastr";

const Notifications = () => {
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
    if (!message || !startDate || !endDate) {
      toastr.error("Please fill in all fields");
      setIsSubmitting(false); 
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toastr.error("Start date cannot be later than end date");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/addNotification`, {
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
        credentials: "include",
      });
      if (response.ok) {
        toastr.success("Notification sent successfully");
        setMessage("");
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate(new Date().toISOString().split("T")[0]);
      } else {
        console.error("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setIsSubmitting(false);
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
                <form
                  className="d-md-flex justify-content-between mb-3"
                >
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
                      onChange={(e) => setStartDate(e.target.value)}
                      value={startDate}
                    />
                  </div>

                  {/* End Date */}
                  <div className="form-group col-md-3 mr-3">
                    <label htmlFor="endDate" className="mr-2">
                      End
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      className="form-control"
                      onChange={(e) => setEndDate(e.target.value)}
                      value={endDate}
                    />
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
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                  />
                </div>

                {/* Submit Button */}
                <button type="submit" onClick={handleSubmit} className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </div>
            {/* /.card */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Notifications;
