import Dashboard from "./../components/Dashboard";
import Navbar from "./../components/Navbar";
import Payment from "./../components/Payment";
import Sidebar from "./../components/Sidebar";
import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Profile from "./../components/Profile";
import Schedule from "./../components/Schedule";
import ServicesOngoing from "./../components/ServicesOngoing";
import Customers from "./../components/Customers";
import ServicesPending from "./../components/ServicesPending";
import ServicesCompleted from "./../components/ServicesCompleted";
import Reservations from "./../components/Reservations";
import Vehicle from "./../components/Vehicle";
import Messages from "./../components/Messages";
import ServicesCancelled from "./../components/ServicesCancelled";
import Notifications from "./../components/Notifications";
import { BASE_URL } from "../config.js";

const AdminPanel = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const verifyLoginStatus = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/authAdmin`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!response.ok) {
          navigate("/login");
        }
      } catch (error) {
        console.log(error);
      }
    };
    verifyLoginStatus();
  }, []);

  return (
    <div className="wrapper">
      <Navbar />
      <Sidebar />
      <div className="content-wrapper">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/settings" element={<Payment />} />
          <Route path="/calendar" element={<Schedule />} />
          <Route path="/ongoing" element={<ServicesOngoing />} />
          <Route path="/pending" element={<ServicesPending />} />
          <Route path="/completed" element={<ServicesCompleted />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/vehicles" element={<Vehicle />} />
          <Route path="/message" element={<Messages />} />
          <Route path="/cancelled" element={<ServicesCancelled />} />
          <Route path="/messages" element={<Notifications />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;
