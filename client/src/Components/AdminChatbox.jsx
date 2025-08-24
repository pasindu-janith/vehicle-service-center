import React, { useState, useRef, useEffect } from "react";
import { FiUser, FiMessageCircle } from "react-icons/fi";
import { BsFillSendFill } from "react-icons/bs";
import BASE_URL from "../config.js";

const AdminChatbox = (reservationId) => {
  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Fetch messages from the server when the component mounts
    console.log("Reservation ID in AdminChatbox:", reservationId.reservationId);
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/getReservationMessages?resid=${reservationId.reservationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies for authentication
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched messages:", data);
          setMessages(data || []);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [reservationId.reservationId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const newId =
      (messages.length > 0 ? Math.max(...messages.map((m) => m.id)) : 0) + 1;

    const message = {
      id: newId,
      message: newMessage.trim(),
      role: "2", // User role
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    inputRef.current?.focus();
    scrollToBottom();

    const sendMessage = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/sendReservationMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Include cookies for authentication
            body: JSON.stringify({ message: message.message, reservationId: reservationId.reservationId } ),
          }
        );
        if (response.ok) {
          console.log("Message sent successfully");
        } else {
          console.error("Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };
    sendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="col-lg-4">
      <div className="card border-0 shadow-sm h-100 d-flex flex-column">
        <div className="card-header bg-white border-0 py-4">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <FiMessageCircle size={24} className="text-primary" />
            </div>
            <div>
              <h4 className="mb-1 fw-bold">Admin Messages</h4>
              <p className="text-muted mb-0 small">Communication updates</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="card-body p-0 flex-grow-1 d-flex flex-column">
          <div
            className="overflow-auto flex-grow-1 px-4 pt-2"
            style={{ maxHeight: "350px" }}
          >
            {messages.length > 0 ? (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`py-2 px-3 mb-3 rounded-3 shadow-sm ${
                      msg.role == "1"
                        ? "bg-white border border-primary border-opacity-25"
                        : "border"
                    }`}
                    style={
                      msg.role != "1" ? { backgroundColor: "#e3f2fd" } : {}
                    }
                  >
                    <div className="d-flex align-items-center mb-2">
                      <div className="me-2">
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center ${
                            msg.role === "1" ? "bg-primary" : "bg-info"
                          }`}
                          style={{ width: "24px", height: "24px" }}
                        >
                          <FiUser size={12} className="text-white" />
                        </div>
                      </div>
                      <small className="text-muted">
                        {new Date(msg.created_at)
                          .toLocaleString("en-GB", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .toUpperCase()}
                      </small>
                    </div>
                    <div className="text-dark">{msg.message}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="text-center py-5">
                <FiMessageCircle size={48} className="text-muted mb-3" />
                <p className="text-muted mb-0">No messages from admin yet</p>
                <small className="text-muted">
                  Updates will appear here when available
                </small>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="card-footer bg-white border-0 p-3">
            <form onSubmit={handleSendMessage} className="d-flex">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Type your message..."
                onKeyDown={handleKeyPress}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                ref={inputRef}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={newMessage.trim() === ""}
              >
                <BsFillSendFill size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatbox;
