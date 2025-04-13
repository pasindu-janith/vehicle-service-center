import Dashboard from "./../components/Dashboard";
import Navbar from "./../components/Navbar";
import Payment from "./../components/Payment";
import Services from "./../components/Services";
import Sidebar from "./../components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Profile from "./../components/Profile";
import Schedule from "./../components/Schedule";
import ServicesOngoing from "./../components/ServicesOngoing";
import Customers from "./../components/Customers";
import ServicesPending from "./../components/ServicesPending";
import ServicesCompleted from "./../components/ServicesCompleted";
import Reservations from "./../components/Reservations";
import Vehicle from "./../components/Vehicle";
import Messages from "./../components/Messages";

const AdminPanel = () => {
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
          <Route path="/calender" element={<Schedule />} />
          <Route path="/ongoing" element={<ServicesOngoing />} />
          <Route path="/pending" element={<ServicesPending />} />
          <Route path="/completed" element={<ServicesCompleted />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/vehicles" element={<Vehicle />} />
          <Route path="/message" element={<Messages />} />

        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;
