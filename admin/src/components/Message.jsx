import { useState, useRef, useEffect } from "react";
import { BASE_URL } from "../config.js";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [reservationId, setReservationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get reservation ID from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resId = urlParams.get("resid");
    if (resId) {
      setReservationId(resId);
      loadMessagesForReservation(resId);
    }
  }, []);

  // Mock function to load messages - replace with actual API call
  const loadMessagesForReservation = async (resId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/getReservationMessages?resid=${resId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        console.log(data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !reservationId) return;

    const newID =
      messages.length > 0 ? messages[messages.length - 1].id + 1 : 1;

    const message = {
      id: newID,
      message: newMessage.trim(),
      description: "ADMIN",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    inputRef.current?.focus();
    sendMessageToServer();
    // Here you would also send the message to the server
  };

  const sendMessageToServer = async () => {
    try {
      const response = await fetch(`${BASE_URL}/sendReservationMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationId,
          message: newMessage.trim(),
        }),
        credentials: "include",
      });
      if (!response.ok) {
        console.error("Failed to send message to server");
      }
    } catch (error) {
      console.error("Error sending message to server:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!reservationId) {
    return (
      <section className="content pt-2">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <h5 className="text-muted">No reservation ID found</h5>
                  <p className="text-muted">
                    Please access this page with a valid reservation ID in the
                    URL (e.g., ?resid=1)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="content pt-2">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h4 className="mb-0">
                      <i className="fas fa-comments mr-2"></i>
                      Messages
                    </h4>
                    <small>Reservation #{reservationId}</small>
                  </div>
                  <div className="text-right">
                    <small>
                      {messages.length} message
                      {messages.length !== 1 ? "s" : ""}
                    </small>
                  </div>
                </div>
              </div>

              <div
                className="card-body p-0"
                style={{
                  height: "500px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Messages Container */}
                <div
                  className="flex-fill overflow-auto p-3"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  {messages.length > 0 ? (
                    <>
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`mb-3 d-flex ${
                            msg.description == "ADMIN"
                              ? "justify-content-end"
                              : "justify-content-start"
                          }`}
                        >
                          <div
                            className={`px-3 py-2 rounded shadow-sm ${
                              msg.description === "ADMIN"
                                ? "bg-primary text-white"
                                : "bg-white border"
                            }`}
                            style={{ maxWidth: "70%" }}
                          >
                            <div className="mb-1">
                              <small
                                className={`${
                                  msg.description === "ADMIN"
                                    ? "text-light"
                                    : "text-muted"
                                }`}
                              >
                                <i
                                  className={`fas ${
                                    msg.description === "USER"
                                      ? "fa-user"
                                      : "fa-user-shield"
                                  } mr-1`}
                                ></i>
                                {msg.description === "ADMIN" ? "Admin" : "User"}
                                <span className="ml-2">
                                  {new Date(msg.created_at).toLocaleString(
                                    "en-GB",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  )}
                                </span>
                              </small>
                            </div>
                            <div>{msg.message}</div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <i className="fas fa-comments fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">No messages yet</h5>
                      <p className="text-muted">
                        Start the conversation by sending a message below.
                      </p>
                    </div>
                  )}
                </div>

                {/* Input Section */}
                <div className="p-3 border-top bg-white">
                  <div className="input-group">
                    <input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      className="form-control"
                      rows="2"
                      style={{ resize: "none" }}
                    />
                    <div className="input-group-append">
                      <button
                        onClick={handleSendMessage}
                        disabled={newMessage.trim() === ""}
                        className={`btn ${
                          newMessage.trim() === ""
                            ? "btn-outline-secondary"
                            : "btn-primary"
                        }`}
                        style={{ height: "100%" }}
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </div>
                  <small className="text-muted mt-2 d-block">
                    <i className="fas fa-info-circle mr-1"></i>
                    Press Enter to send, Shift+Enter for new line
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Message;
